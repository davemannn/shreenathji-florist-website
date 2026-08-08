import { Readable } from "node:stream";
import ExcelJS from "exceljs";
import { z } from "zod";

/**
 * Deliberately update-only, not create — a new product needs images and a
 * description, which is a bad spreadsheet-editing experience, so full
 * creation stays on the product form. This exists for the thing a
 * spreadsheet genuinely is good at: bulk price/stock revisions across a
 * catalog (e.g. a seasonal price pass, or a stock-take reconciliation).
 * Pairs with the export below — export, edit price/stock in Excel,
 * re-import the same file.
 */
export interface ProductImportRow {
  rowNumber: number;
  slug: string;
  variantLabel: string;
  price?: number;
  compareAtPrice?: number;
  stock?: number;
  isActive?: boolean;
}

export interface ProductImportRowError {
  rowNumber: number;
  message: string;
}

const rowSchema = z.object({
  slug: z.string().min(1, "Missing slug"),
  variantLabel: z.string().min(1, "Missing variant"),
  price: z.coerce.number().int().min(1, "Price must be at least ₹1").optional(),
  compareAtPrice: z.coerce.number().int().min(1).optional(),
  stock: z.coerce.number().int().min(0, "Stock can't be negative").optional(),
  isActive: z.boolean().optional(),
});

/** Normalizes a header cell to match regardless of casing/spacing — "Variant Label", "variant_label", "variantLabel" all resolve the same column. */
function normalizeHeader(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");
}

const HEADER_ALIASES: Record<string, keyof ProductImportRow> = {
  slug: "slug",
  variant: "variantLabel",
  variantlabel: "variantLabel",
  price: "price",
  compareatprice: "compareAtPrice",
  mrp: "compareAtPrice",
  stock: "stock",
  active: "isActive",
  isactive: "isActive",
};

function parseBoolean(value: unknown): boolean | undefined {
  if (value === null || value === undefined || value === "") return undefined;
  if (typeof value === "boolean") return value;
  const str = String(value).trim().toLowerCase();
  if (["true", "yes", "y", "1", "active"].includes(str)) return true;
  if (["false", "no", "n", "0", "inactive"].includes(str)) return false;
  return undefined;
}

function cellText(value: unknown): string | undefined {
  if (value === null || value === undefined) return undefined;
  // ExcelJS hands back rich objects for formulas/hyperlinks — plain cells
  // (what an import file should only ever contain) are primitives already.
  if (typeof value === "object" && "text" in (value as Record<string, unknown>)) {
    return String((value as { text: unknown }).text).trim();
  }
  const str = String(value).trim();
  return str === "" ? undefined : str;
}

export interface ParsedProductImport {
  rows: ProductImportRow[];
  errors: ProductImportRowError[];
}

/** Reads an uploaded .xlsx or .csv buffer into validated rows + per-row errors — the caller decides what to do with either. */
export async function parseProductImportFile(
  buffer: Buffer,
  filename: string,
): Promise<ParsedProductImport> {
  const workbook = new ExcelJS.Workbook();
  const isCsv = filename.toLowerCase().endsWith(".csv");

  let sheet: ExcelJS.Worksheet;
  if (isCsv) {
    sheet = await workbook.csv.read(bufferToStream(buffer));
  } else {
    // exceljs's bundled type declarations reference a slightly different
    // `Buffer` shape than this project's @types/node resolves to (a known
    // duplicate-types mismatch, not a real runtime concern — it's the same
    // Node Buffer either way).
    await workbook.xlsx.load(buffer as unknown as Parameters<typeof workbook.xlsx.load>[0]);
    const first = workbook.worksheets[0];
    if (!first) throw new Error("The file has no sheets.");
    sheet = first;
  }

  const headerRow = sheet.getRow(1);
  const columnMap = new Map<number, keyof ProductImportRow>();
  headerRow.eachCell({ includeEmpty: false }, (cell, colNumber) => {
    const key = HEADER_ALIASES[normalizeHeader(cell.value)];
    if (key) columnMap.set(colNumber, key);
  });

  if (!Array.from(columnMap.values()).includes("slug")) {
    throw new Error(
      'The file needs a "slug" column — export the product list to see the expected format.',
    );
  }
  if (!Array.from(columnMap.values()).includes("variantLabel")) {
    throw new Error('The file needs a "variant" column matching each variant\'s label.');
  }

  const rows: ProductImportRow[] = [];
  const errors: ProductImportRowError[] = [];

  sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) return; // header

    const raw: Record<string, unknown> = {};
    columnMap.forEach((key, colNumber) => {
      const cell = row.getCell(colNumber);
      raw[key] = key === "isActive" ? parseBoolean(cell.value) : cellText(cell.value);
    });

    // A fully blank row (e.g. trailing rows Excel sometimes writes) is
    // silently skipped rather than reported as an error.
    if (!raw.slug && !raw.variantLabel) return;

    const parsed = rowSchema.safeParse(raw);
    if (!parsed.success) {
      errors.push({
        rowNumber,
        message: parsed.error.issues.map((i) => i.message).join("; "),
      });
      return;
    }
    rows.push({ rowNumber, ...parsed.data });
  });

  return { rows, errors };
}

function bufferToStream(buffer: Buffer) {
  return Readable.from(buffer);
}

export interface ImportableProduct {
  id: string;
  slug: string;
  variants: { id: string; label: string }[];
}

export interface ResolvedProductImport {
  variantUpdates: { variantId: string; price?: number; compareAtPrice?: number; stock?: number }[];
  productActiveUpdates: { productId: string; isActive: boolean }[];
  touchedVariantIds: Set<string>;
  touchedProductIds: Set<string>;
  errors: ProductImportRowError[];
}

/**
 * Pure resolution step (slug/label → product/variant id), separated from
 * `parseProductImportFile` (file → rows) and the DB write so it's testable
 * without a real upload or a live database — feed it rows plus the
 * products those rows claim to touch, get back exactly what a transaction
 * needs to apply, plus every row that couldn't be resolved.
 */
export function resolveProductImportRows(
  rows: ProductImportRow[],
  products: ImportableProduct[],
): ResolvedProductImport {
  const productBySlug = new Map(products.map((p) => [p.slug, p]));
  const variantUpdates: ResolvedProductImport["variantUpdates"] = [];
  // Keyed by productId so multiple rows for the same product's variants
  // (the common case) only produce one isActive update, last-row-wins.
  const productActiveUpdates = new Map<string, boolean>();
  const touchedVariantIds = new Set<string>();
  const touchedProductIds = new Set<string>();
  const errors: ProductImportRowError[] = [];

  for (const row of rows) {
    const product = productBySlug.get(row.slug);
    if (!product) {
      errors.push({
        rowNumber: row.rowNumber,
        message: `No product found with slug "${row.slug}".`,
      });
      continue;
    }

    if (row.isActive !== undefined) {
      productActiveUpdates.set(product.id, row.isActive);
      touchedProductIds.add(product.id);
    }

    if (row.price === undefined && row.compareAtPrice === undefined && row.stock === undefined) {
      continue; // row only carried an isActive change (or nothing at all) — nothing variant-level to apply
    }

    const variant =
      product.variants.find((v) => v.label === row.variantLabel) ??
      product.variants.find(
        (v) => v.label.trim().toLowerCase() === row.variantLabel.trim().toLowerCase(),
      );
    if (!variant) {
      errors.push({
        rowNumber: row.rowNumber,
        message: `Product "${row.slug}" has no variant labeled "${row.variantLabel}".`,
      });
      continue;
    }

    variantUpdates.push({
      variantId: variant.id,
      price: row.price,
      compareAtPrice: row.compareAtPrice,
      stock: row.stock,
    });
    touchedVariantIds.add(variant.id);
    touchedProductIds.add(product.id);
  }

  return {
    variantUpdates,
    productActiveUpdates: Array.from(productActiveUpdates, ([productId, isActive]) => ({
      productId,
      isActive,
    })),
    touchedVariantIds,
    touchedProductIds,
    errors,
  };
}

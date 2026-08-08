"use server";

import { revalidatePath } from "next/cache";
import { requireAdminCapability } from "@/server/auth/require-admin";
import { logAudit } from "@/server/audit/log";
import {
  applyProductImport,
  createProduct as createProductRepo,
  findProductByIdAdmin,
  findProductsForImport,
  setProductActive,
  updateProduct as updateProductRepo,
} from "@/server/repositories/product.repository";
import { productFormSchema, type ProductFormValues } from "./validations";
import {
  parseProductImportFile,
  resolveProductImportRows,
  type ProductImportRowError,
} from "./import";

/**
 * Price and stock changes are exactly what an audit trail exists for — a
 * customer or another admin asking "why did this price change" needs an
 * answer. Variants are matched by label (they're fully replaced on every
 * update, not diffed at the DB layer — see updateProduct), so a renamed
 * variant reads as "removed + added" rather than "changed", which is the
 * honest description of what actually happened to the row.
 */
function summarizeProductChanges(
  before: NonNullable<Awaited<ReturnType<typeof findProductByIdAdmin>>>,
  after: ProductFormValues,
): string {
  const changes: string[] = [];
  if (before.title !== after.title) changes.push(`Title "${before.title}" → "${after.title}"`);
  if (before.isActive !== after.isActive)
    changes.push(after.isActive ? "Reactivated" : "Deactivated");

  const beforeByLabel = new Map(before.variants.map((v) => [v.label, v]));
  const afterLabels = new Set(after.variants.map((v) => v.label));
  for (const variant of after.variants) {
    const prev = beforeByLabel.get(variant.label);
    if (!prev) {
      changes.push(`Added variant "${variant.label}" (₹${variant.price})`);
      continue;
    }
    if (prev.price !== variant.price) {
      changes.push(`Price (${variant.label}) ₹${prev.price} → ₹${variant.price}`);
    }
    if (prev.stock !== variant.stock) {
      changes.push(`Stock (${variant.label}) ${prev.stock} → ${variant.stock}`);
    }
  }
  for (const label of beforeByLabel.keys()) {
    if (!afterLabels.has(label)) changes.push(`Removed variant "${label}"`);
  }

  return changes.length > 0 ? changes.join("; ") : "Updated product details";
}

export async function createProductAction(input: ProductFormValues) {
  const session = await requireAdminCapability("products:manage");
  const values = productFormSchema.parse(input);

  const product = await createProductRepo(values);

  await logAudit(session, {
    entityType: "Product",
    entityId: product.id,
    entityLabel: values.title,
    action: "created",
    summary: `Created with ${values.variants.length} variant${values.variants.length === 1 ? "" : "s"}`,
  });

  revalidatePath("/admin/products");
  return { id: product.id };
}

export async function updateProductAction(id: string, input: ProductFormValues) {
  const session = await requireAdminCapability("products:manage");
  const values = productFormSchema.parse(input);

  const before = await findProductByIdAdmin(id);
  await updateProductRepo(id, values);

  if (before) {
    await logAudit(session, {
      entityType: "Product",
      entityId: id,
      entityLabel: values.title,
      action: "updated",
      summary: summarizeProductChanges(before, values),
    });
  }

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}`);
  // Storefront pages showing this product need to reflect the edit too.
  revalidatePath(`/shop/product/${values.slug}`);
}

export async function setProductActiveAction(id: string, isActive: boolean) {
  const session = await requireAdminCapability("products:manage");
  const before = await findProductByIdAdmin(id);
  await setProductActive(id, isActive);

  if (before) {
    await logAudit(session, {
      entityType: "Product",
      entityId: id,
      entityLabel: before.title,
      action: isActive ? "restored" : "archived",
      summary: isActive ? "Reactivated" : "Deactivated",
    });
  }

  revalidatePath("/admin/products");
}

export interface ProductImportResult {
  totalRows: number;
  updatedVariants: number;
  updatedProducts: number;
  errors: ProductImportRowError[];
}

/**
 * Update-only bulk import — see features/product/import.ts's module comment
 * for why full product creation stays on the form. Every row is resolved
 * (slug → product, label → variant) before anything is written, so a
 * partially-bad file reports every problem row at once rather than failing
 * on the first one; only rows that resolved cleanly are applied, in one
 * transaction.
 */
export async function importProductsAction(formData: FormData): Promise<ProductImportResult> {
  const session = await requireAdminCapability("products:manage");

  const file = formData.get("file");
  if (!(file instanceof File)) {
    throw new Error("No file was uploaded.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const { rows, errors: parseErrors } = await parseProductImportFile(buffer, file.name);

  const errors: ProductImportRowError[] = [...parseErrors];
  if (rows.length === 0) {
    return { totalRows: 0, updatedVariants: 0, updatedProducts: 0, errors };
  }

  const slugs = Array.from(new Set(rows.map((r) => r.slug)));
  const products = await findProductsForImport(slugs);
  const {
    variantUpdates,
    productActiveUpdates,
    touchedVariantIds,
    touchedProductIds,
    errors: resolveErrors,
  } = resolveProductImportRows(rows, products);
  errors.push(...resolveErrors);

  if (variantUpdates.length > 0 || productActiveUpdates.length > 0) {
    await applyProductImport({ variantUpdates, productActiveUpdates });

    await logAudit(session, {
      entityType: "Product",
      entityId: "bulk-import",
      entityLabel: `Bulk import (${touchedProductIds.size} product${touchedProductIds.size === 1 ? "" : "s"})`,
      action: "updated",
      summary: `Updated ${touchedVariantIds.size} variant${touchedVariantIds.size === 1 ? "" : "s"} across ${touchedProductIds.size} product${touchedProductIds.size === 1 ? "" : "s"} via bulk import`,
    });

    revalidatePath("/admin/products");
  }

  return {
    totalRows: rows.length,
    updatedVariants: touchedVariantIds.size,
    updatedProducts: touchedProductIds.size,
    errors,
  };
}

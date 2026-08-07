// Shared CSV/XLSX generation for the admin Reports section — every report
// (Sales, Tax, Products, Customers) exports through these two functions so
// the actual formatting logic lives in exactly one place.

import ExcelJS from "exceljs";

export interface ReportColumn {
  key: string;
  label: string;
}

/** Escapes a value for a CSV field per RFC 4180 — wraps in quotes and doubles any embedded quotes whenever the value contains a comma, quote, or newline. */
function csvField(value: unknown): string {
  const str = value === null || value === undefined ? "" : String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function buildCsv(columns: ReportColumn[], rows: Record<string, unknown>[]): string {
  const header = columns.map((c) => csvField(c.label)).join(",");
  const body = rows.map((row) => columns.map((c) => csvField(row[c.key])).join(",")).join("\n");
  // Leading BOM so Excel (still the most common opener for a .csv on
  // Windows) detects UTF-8 instead of guessing a local codepage and
  // mangling the ₹ symbol.
  return `﻿${header}\n${body}`;
}

export async function buildXlsx(
  sheetName: string,
  columns: ReportColumn[],
  rows: Record<string, unknown>[],
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(sheetName);

  sheet.columns = columns.map((c) => ({ header: c.label, key: c.key, width: 18 }));
  sheet.getRow(1).font = { bold: true };
  rows.forEach((row) => sheet.addRow(row));

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

/** Sets the two headers a file-download response needs, given a base filename (no extension). */
export function downloadHeaders(filename: string, format: "csv" | "xlsx"): HeadersInit {
  const contentType =
    format === "csv"
      ? "text/csv; charset=utf-8"
      : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  return {
    "Content-Type": contentType,
    "Content-Disposition": `attachment; filename="${filename}.${format}"`,
  };
}

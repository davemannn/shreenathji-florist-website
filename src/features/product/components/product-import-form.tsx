"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { importProductsAction, type ProductImportResult } from "../actions";

export function ProductImportForm() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ProductImportResult | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const file = inputRef.current?.files?.[0];
    if (!file) {
      toast.error("Choose a file first.");
      return;
    }

    setSubmitting(true);
    setResult(null);
    try {
      const formData = new FormData();
      formData.set("file", file);
      const outcome = await importProductsAction(formData);
      setResult(outcome);
      if (outcome.updatedVariants > 0 || outcome.updatedProducts > 0) {
        toast.success(
          `Updated ${outcome.updatedVariants} variant${outcome.updatedVariants === 1 ? "" : "s"} across ${outcome.updatedProducts} product${outcome.updatedProducts === 1 ? "" : "s"}.`,
        );
        router.refresh();
      } else if (outcome.errors.length === 0) {
        toast.info("Nothing to update — the file didn't contain any changed rows.");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't process the file.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <Card className="p-4">
        <p className="text-sm">
          Upload a .xlsx or .csv file to bulk-update{" "}
          <strong>price, compare-at price, and stock</strong> for existing variants (and a
          product&rsquo;s Active flag). Each row must match an existing product by{" "}
          <strong>slug</strong> and variant by <strong>label</strong> — this doesn&rsquo;t create
          new products or variants.
        </p>
        <p className="text-muted-foreground mt-2 text-xs">
          Easiest way to get the right format: export your current catalog below, edit the Price /
          Stock columns in Excel, then re-upload the same file.
        </p>
      </Card>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xlsx"
          onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
          className="text-sm"
        />
        <Button type="submit" variant="brand" size="lg" className="w-fit" disabled={submitting}>
          <Upload className="size-4" aria-hidden="true" />
          {submitting ? "Importing…" : fileName ? `Import ${fileName}` : "Import"}
        </Button>
      </form>

      {result ? (
        <Card className="flex flex-col gap-3 p-4">
          <p className="text-sm font-medium">
            {result.totalRows} row{result.totalRows === 1 ? "" : "s"} read — updated{" "}
            {result.updatedVariants} variant{result.updatedVariants === 1 ? "" : "s"} across{" "}
            {result.updatedProducts} product{result.updatedProducts === 1 ? "" : "s"}.
          </p>
          {result.errors.length > 0 ? (
            <div className="flex flex-col gap-1">
              <p className="text-destructive text-sm font-medium">
                {result.errors.length} row{result.errors.length === 1 ? "" : "s"} skipped:
              </p>
              <ul className="text-destructive max-h-64 list-disc overflow-y-auto pl-5 text-xs">
                {result.errors.map((e, i) => (
                  <li key={i}>
                    Row {e.rowNumber}: {e.message}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </Card>
      ) : null}
    </div>
  );
}

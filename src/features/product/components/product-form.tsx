"use client";

import { useRouter } from "next/navigation";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CloudinaryUploader } from "@/components/shared/cloudinary-uploader";
import { MultiSelectCombobox } from "@/components/shared/multi-select-combobox";
import { createProductAction, updateProductAction } from "../actions";
import { productFormSchema, type ProductFormInput, type ProductFormValues } from "../validations";
import type { AdminProductDetail } from "../types";

interface CategoryOption {
  id: string;
  name: string;
}

const FLAG_CAPTIONS: Record<"isActive" | "isBestSeller" | "isFeatured", string> = {
  isActive: "Visible in the shop. Turn off to hide without deleting it.",
  isBestSeller: "Includes this product in the homepage “Best Sellers” row.",
  isFeatured: "Reserved for a future homepage section — not shown anywhere on the storefront yet.",
};

interface ProductFormProps {
  categories: CategoryOption[];
  product?: AdminProductDetail;
}

const BADGE_OPTIONS = [
  { value: "NONE", label: "No badge" },
  { value: "SALE", label: "Sale" },
  { value: "NEW", label: "New" },
  { value: "BESTSELLER", label: "Bestseller" },
];

export function ProductForm({ categories, product }: ProductFormProps) {
  const router = useRouter();
  const isEdit = !!product;

  const form = useForm<ProductFormInput, unknown, ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      slug: product?.slug ?? "",
      title: product?.title ?? "",
      description: product?.description ?? "",
      badge: product?.badge,
      isActive: product?.isActive ?? true,
      isBestSeller: product?.isBestSeller ?? false,
      isFeatured: product?.isFeatured ?? false,
      categoryIds: product?.categoryIds ?? [],
      variants: product?.variants ?? [{ label: "", price: 0, stock: 0, isDefault: true }],
      images: product?.images ?? [],
    },
  });
  const { setValue, getValues } = form;

  const variantFields = useFieldArray({ control: form.control, name: "variants" });
  const imageFields = useFieldArray({ control: form.control, name: "images" });

  // useWatch (not form.watch) — form.watch() triggers React Compiler's
  // react-hooks/incompatible-library warning; useWatch is a separate hook
  // the compiler can reason about. Confirmed via category-form.tsx.
  const watchedCategoryIds = useWatch({ control: form.control, name: "categoryIds" });
  const watchedVariants = useWatch({ control: form.control, name: "variants" });
  const watchedImages = useWatch({ control: form.control, name: "images" });

  async function onSubmit(values: ProductFormValues) {
    try {
      if (isEdit && product) {
        await updateProductAction(product.id, values);
        toast.success("Product updated.");
      } else {
        await createProductAction(values);
        toast.success("Product created.");
      }
      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't save this product.");
    }
  }

  function setDefaultVariant(index: number) {
    variantFields.fields.forEach((_, i) => setValue(`variants.${i}.isDefault`, i === index));
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
        className="flex max-w-3xl flex-col gap-6"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Slug</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="rose-elegance-bouquet" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <textarea
                  {...field}
                  rows={4}
                  className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-lg border bg-transparent px-2.5 py-1.5 text-sm outline-none focus-visible:ring-3"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="badge"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Badge</FormLabel>
              <Select
                value={field.value ?? "NONE"}
                onValueChange={(value) => field.onChange(value === "NONE" ? undefined : value)}
              >
                <SelectTrigger className="w-48">
                  <SelectValue>
                    {(value: string) => BADGE_OPTIONS.find((o) => o.value === value)?.label}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {BADGE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                A small ribbon shown on the product image in the shop — purely visual, doesn&rsquo;t
                affect where the product appears.
              </FormDescription>
            </FormItem>
          )}
        />

        <div className="flex flex-col gap-3">
          {(["isActive", "isBestSeller", "isFeatured"] as const).map((name) => (
            <FormField
              key={name}
              control={form.control}
              name={name}
              render={({ field }) => (
                <div>
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    {name === "isActive"
                      ? "Active"
                      : name === "isBestSeller"
                        ? "Best seller"
                        : "Featured"}
                  </label>
                  <p className="text-muted-foreground pl-6 text-xs">{FLAG_CAPTIONS[name]}</p>
                </div>
              )}
            />
          ))}
        </div>

        <div>
          <Label>Categories</Label>
          <div className="mt-2">
            <MultiSelectCombobox
              options={categories.map((category) => ({ value: category.id, label: category.name }))}
              value={watchedCategoryIds}
              onChange={(next) => setValue("categoryIds", next, { shouldValidate: true })}
              placeholder="Search categories…"
              emptyMessage="No categories match."
            />
          </div>
          {form.formState.errors.categoryIds ? (
            <p className="text-destructive mt-1 text-xs">
              {form.formState.errors.categoryIds.message}
            </p>
          ) : null}
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <Label>Variants</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                variantFields.append({ label: "", price: 0, stock: 0, isDefault: false })
              }
            >
              <Plus className="size-3.5" aria-hidden="true" />
              Add Variant
            </Button>
          </div>
          <p className="text-muted-foreground mb-2 text-xs">
            Give a variant its own photo when it looks noticeably different (e.g. a color or size
            option) — customers see it swap in when they pick that option. Variants without one fall
            back to the product photos below.
          </p>
          <div className="flex flex-col gap-3">
            {variantFields.fields.map((field, index) => (
              <div
                key={field.id}
                className="border-border flex items-end gap-3 rounded-xs border p-3"
              >
                <CloudinaryUploader
                  folder="products"
                  value={watchedVariants[index]?.imageUrl}
                  thumbnailClassName="size-16"
                  triggerLabel="Photo"
                  onChange={(url, cloudinaryId) => {
                    setValue(`variants.${index}.imageUrl`, url);
                    setValue(`variants.${index}.imageCloudinaryId`, cloudinaryId);
                  }}
                  onRemove={() => {
                    setValue(`variants.${index}.imageUrl`, "");
                    setValue(`variants.${index}.imageCloudinaryId`, "");
                  }}
                />
                <div className="grid flex-1 grid-cols-12 items-end gap-2">
                  <div className="col-span-4">
                    <FormField
                      control={form.control}
                      name={`variants.${index}.label`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Label</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Medium (12 roses)" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="col-span-2">
                    <FormField
                      control={form.control}
                      name={`variants.${index}.price`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Price</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} value={field.value as number} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="col-span-2">
                    <FormField
                      control={form.control}
                      name={`variants.${index}.compareAtPrice`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Compare-at</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} value={(field.value as number) ?? ""} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="col-span-2">
                    <FormField
                      control={form.control}
                      name={`variants.${index}.stock`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Stock</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} value={field.value as number} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="col-span-1 flex items-center justify-center pb-1.5">
                    <label className="flex flex-col items-center gap-1 text-[10px]">
                      Default
                      <Checkbox
                        checked={watchedVariants[index]?.isDefault ?? false}
                        onCheckedChange={() => setDefaultVariant(index)}
                      />
                    </label>
                  </div>
                  <div className="col-span-1 flex justify-end pb-1.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      disabled={variantFields.fields.length === 1}
                      onClick={() => variantFields.remove(index)}
                    >
                      <Trash2 className="size-3.5" aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {form.formState.errors.variants?.message ? (
            <p className="text-destructive mt-1 text-xs">
              {form.formState.errors.variants.message}
            </p>
          ) : null}
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <Label>Images</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                imageFields.append({ url: "", alt: getValues("title") || "Product image" })
              }
            >
              <Plus className="size-3.5" aria-hidden="true" />
              Add Image Slot
            </Button>
          </div>
          <div className="flex flex-wrap gap-4">
            {imageFields.fields.map((field, index) => (
              <div key={field.id} className="flex flex-col items-center gap-2">
                <CloudinaryUploader
                  folder="products"
                  value={watchedImages[index]?.url}
                  onChange={(url, cloudinaryId) => {
                    setValue(`images.${index}.url`, url);
                    setValue(`images.${index}.cloudinaryId`, cloudinaryId);
                    if (!getValues(`images.${index}.alt`)) {
                      setValue(`images.${index}.alt`, getValues("title") || "Product image");
                    }
                  }}
                  onRemove={() => imageFields.remove(index)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => imageFields.remove(index)}
                >
                  <Trash2 className="size-3.5" aria-hidden="true" />
                </Button>
              </div>
            ))}
          </div>
          {form.formState.errors.images?.message ? (
            <p className="text-destructive mt-1 text-xs">{form.formState.errors.images.message}</p>
          ) : null}
        </div>

        <Button
          type="submit"
          variant="brand"
          size="lg"
          disabled={form.formState.isSubmitting}
          className="w-fit"
        >
          {form.formState.isSubmitting ? "Saving…" : isEdit ? "Save Changes" : "Create Product"}
        </Button>
      </form>
    </Form>
  );
}

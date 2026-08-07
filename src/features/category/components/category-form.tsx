"use client";

import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
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
import { CloudinaryUploader } from "@/components/shared/cloudinary-uploader";
import { createCategoryAction, updateCategoryAction } from "../actions";
import {
  categoryFormSchema,
  type CategoryFormInput,
  type CategoryFormValues,
} from "../validations";
import type { AdminCategory } from "../types";

export function CategoryForm({ category }: { category?: AdminCategory }) {
  const router = useRouter();
  const isEdit = !!category;

  const form = useForm<CategoryFormInput, unknown, CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: category?.name ?? "",
      slug: category?.slug ?? "",
      description: category?.description ?? "",
      imageUrl: category?.imageUrl ?? "",
      imageCloudinaryId: category?.imageCloudinaryId ?? "",
      isOccasion: category?.isOccasion ?? false,
      isFeatured: category?.isFeatured ?? false,
      gstRate: category?.gstRate,
      hsnCode: category?.hsnCode ?? "",
    },
  });
  const { setValue } = form;
  const imageUrl = useWatch({ control: form.control, name: "imageUrl" });
  const isOccasion = useWatch({ control: form.control, name: "isOccasion" });

  async function onSubmit(values: CategoryFormValues) {
    try {
      if (isEdit && category) {
        await updateCategoryAction(category.id, values);
        toast.success("Category updated.");
      } else {
        await createCategoryAction(values);
        toast.success("Category created.");
      }
      router.push("/admin/categories");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't save this category.");
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
        className="flex max-w-lg flex-col gap-4"
      >
        <div>
          <Label>Image</Label>
          <div className="mt-2">
            <CloudinaryUploader
              folder="categories"
              value={imageUrl}
              onChange={(url, cloudinaryId) => {
                setValue("imageUrl", url);
                setValue("imageCloudinaryId", cloudinaryId);
              }}
              onRemove={() => {
                setValue("imageUrl", "");
                setValue("imageCloudinaryId", "");
              }}
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
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
                <Input {...field} placeholder="flowers" />
              </FormControl>
              <FormDescription>
                The URL for this category&rsquo;s page — e.g. shreenathjiflorist.com/shop/
                {field.value || "flowers"}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (optional)</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>
                Shown at the top of this category&rsquo;s page, under its name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col gap-3">
          <FormField
            control={form.control}
            name="isOccasion"
            render={({ field }) => (
              <FormItem>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  Occasion
                </label>
                <FormDescription className="pl-6">
                  Lists this category under the header&rsquo;s &ldquo;Occasions&rdquo; menu (e.g.
                  Birthday, Anniversary) instead of &ldquo;Shop&rdquo; (e.g. Flowers, Cakes).
                </FormDescription>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="isFeatured"
            render={({ field }) => (
              <FormItem>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  Featured on homepage
                </label>
                <FormDescription className="pl-6">
                  Shows this category in the homepage&rsquo;s featured categories row.
                </FormDescription>
              </FormItem>
            )}
          />
        </div>

        {!isOccasion ? (
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="gstRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GST rate (%)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} value={(field.value as number) ?? ""} />
                  </FormControl>
                  <FormDescription>
                    Leave blank to fall back to Settings&rsquo; default rate.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="hsnCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>HSN code</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="0603" />
                  </FormControl>
                  <FormDescription>For GST invoices.</FormDescription>
                </FormItem>
              )}
            />
          </div>
        ) : null}

        <Button
          type="submit"
          variant="brand"
          size="lg"
          disabled={form.formState.isSubmitting}
          className="w-fit"
        >
          {form.formState.isSubmitting ? "Saving…" : isEdit ? "Save Changes" : "Create Category"}
        </Button>
      </form>
    </Form>
  );
}

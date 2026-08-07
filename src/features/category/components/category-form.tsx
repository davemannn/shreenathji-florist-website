"use client";

import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
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
      sortOrder: category?.sortOrder ?? 0,
    },
  });
  const { setValue } = form;
  const imageUrl = useWatch({ control: form.control, name: "imageUrl" });

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
          <FormLabel>Image</FormLabel>
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
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="sortOrder"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sort Order</FormLabel>
              <FormControl>
                <Input type="number" {...field} value={field.value as number} className="w-24" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4">
          <FormField
            control={form.control}
            name="isOccasion"
            render={({ field }) => (
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                Occasion (shown under &ldquo;Occasions&rdquo; nav)
              </label>
            )}
          />
          <FormField
            control={form.control}
            name="isFeatured"
            render={({ field }) => (
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                Featured on homepage
              </label>
            )}
          />
        </div>

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

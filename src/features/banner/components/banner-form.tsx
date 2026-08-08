"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { createBannerAction, updateBannerAction } from "../actions";
import { bannerFormSchema, type BannerFormInput, type BannerFormValues } from "../validations";
import type { AdminBanner, BannerType } from "../types";

const TYPE_LABELS: Record<BannerType, string> = {
  HERO: "Hero slide",
  PROMO: "Promo tile",
  OCCASION: "Occasion banner",
};

export function BannerForm({ banner }: { banner?: AdminBanner }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEdit = !!banner;
  const defaultType = (searchParams.get("type") as BannerType | null) ?? "HERO";

  const form = useForm<BannerFormInput, unknown, BannerFormValues>({
    resolver: zodResolver(bannerFormSchema),
    defaultValues: {
      type: banner?.type ?? defaultType,
      eyebrow: banner?.eyebrow ?? "",
      headline: banner?.headline ?? "",
      subtitle: banner?.subtitle ?? "",
      ctaLabel: banner?.ctaLabel ?? "",
      ctaHref: banner?.ctaHref ?? "",
      imageUrl: banner?.imageUrl ?? "",
      imageAlt: banner?.imageAlt ?? "",
      imageCloudinaryId: banner?.imageCloudinaryId ?? "",
      isActive: banner?.isActive ?? true,
      startsAt: banner?.startsAt ? banner.startsAt.slice(0, 10) : "",
      endsAt: banner?.endsAt ? banner.endsAt.slice(0, 10) : "",
    },
  });
  const { setValue } = form;
  const imageUrl = useWatch({ control: form.control, name: "imageUrl" });
  const type = useWatch({ control: form.control, name: "type" });

  async function onSubmit(values: BannerFormValues) {
    try {
      if (isEdit && banner) {
        await updateBannerAction(banner.id, values);
        toast.success("Banner updated.");
      } else {
        await createBannerAction(values);
        toast.success("Banner created.");
      }
      router.push(`/admin/banners?type=${values.type}`);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't save this banner.");
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
        className="flex max-w-lg flex-col gap-4"
      >
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Placement</FormLabel>
              <Select value={field.value} onValueChange={field.onChange} disabled={isEdit}>
                <SelectTrigger>
                  <SelectValue>{(value: BannerType) => TYPE_LABELS[value]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(TYPE_LABELS) as BannerType[]).map((value) => (
                    <SelectItem key={value} value={value}>
                      {TYPE_LABELS[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                {type === "HERO"
                  ? "Full-width slide in the homepage's top carousel."
                  : type === "PROMO"
                    ? "One of the 3 tiles in the promo strip under the hero."
                    : "The single wide banner further down the homepage (e.g. a seasonal push)."}
              </FormDescription>
            </FormItem>
          )}
        />

        <div>
          <Label>Image</Label>
          <div className="mt-2">
            <CloudinaryUploader
              folder="banners"
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
          <p className="text-muted-foreground mt-1 text-xs">
            Leave blank to fall back to a plain placeholder block instead of a photo.
          </p>
        </div>

        <FormField
          control={form.control}
          name="imageAlt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image alt text</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Describes the photo for screen readers" />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="eyebrow"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Eyebrow (optional)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Fresh Today" />
              </FormControl>
              <FormDescription>Small label shown above the headline.</FormDescription>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="headline"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Headline</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              {type === "HERO" ? (
                <FormDescription>Use \n for a manual line break.</FormDescription>
              ) : null}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="subtitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{type === "PROMO" ? "Subtitle" : "Body text"} (optional)</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="ctaLabel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Button label (optional)</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Shop Now" />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="ctaHref"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Button link (optional)</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="/shop" />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startsAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Starts (optional)</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endsAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ends (optional)</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <p className="text-muted-foreground -mt-2 text-xs">
          Leave both blank to run indefinitely (as long as Active is checked). With dates set, this
          banner turns itself on/off automatically — no need to come back and flip the toggle.
        </p>

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                Active
              </label>
            </FormItem>
          )}
        />

        <Button
          type="submit"
          variant="brand"
          size="lg"
          disabled={form.formState.isSubmitting}
          className="w-fit"
        >
          {form.formState.isSubmitting ? "Saving…" : isEdit ? "Save Changes" : "Create Banner"}
        </Button>
      </form>
    </Form>
  );
}

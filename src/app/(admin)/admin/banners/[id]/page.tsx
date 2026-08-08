import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdminSession } from "@/server/auth/require-admin";
import { getBannerForEdit } from "@/features/banner/queries";
import { BannerForm } from "@/features/banner/components/banner-form";

export const metadata: Metadata = {
  title: "Edit Banner",
};

export default async function EditBannerPage({ params }: PageProps<"/admin/banners/[id]">) {
  const { id } = await params;
  await requireAdminSession("banners:manage");

  const banner = await getBannerForEdit(id);
  if (!banner) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Edit Banner</h1>
      <BannerForm banner={banner} />
    </div>
  );
}

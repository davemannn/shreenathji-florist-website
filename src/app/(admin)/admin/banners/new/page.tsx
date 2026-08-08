import type { Metadata } from "next";
import { requireAdminSession } from "@/server/auth/require-admin";
import { BannerForm } from "@/features/banner/components/banner-form";

export const metadata: Metadata = {
  title: "New Banner",
};

export default async function NewBannerPage() {
  await requireAdminSession("banners:manage");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">New Banner</h1>
      </div>
      <BannerForm />
    </div>
  );
}

import { NextResponse } from "next/server";
import { requireAdminCapability } from "@/server/auth/require-admin";
import { cloudinary } from "@/server/storage/cloudinary";

/**
 * Signs upload params for next-cloudinary's <CldUploadWidget
 * signatureEndpoint>. Contract (verified against next-cloudinary/
 * @cloudinary-util's own source, not just its docs): it POSTs
 * `{ paramsToSign }` and expects `{ signature }` back — cloudinary's own
 * `utils.api_sign_request` does exactly that signing, using the server-only
 * API secret that never reaches the browser.
 */
export async function POST(request: Request) {
  try {
    await requireAdminCapability([
      "products:manage",
      "categories:manage",
      "blog:manage",
      "banners:manage",
      "gallery:manage",
      "testimonials:manage",
      "subscriptions:manage",
    ]);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { paramsToSign } = await request.json();
  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET ?? "",
  );

  return NextResponse.json({ signature });
}

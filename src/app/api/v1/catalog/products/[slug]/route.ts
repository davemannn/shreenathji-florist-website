import { getProductBySlug } from "@/features/product/queries";
import { apiError, apiSuccess, withApiErrors } from "@/server/api/response";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  return withApiErrors(async () => {
    const { slug } = await params;
    const product = await getProductBySlug(slug);
    if (!product) return apiError("Product not found.", 404);
    return apiSuccess(product);
  });
}

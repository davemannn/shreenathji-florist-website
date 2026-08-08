import { listAllCategories } from "@/features/category/queries";
import { apiSuccess, withApiErrors } from "@/server/api/response";

export async function GET() {
  return withApiErrors(async () => {
    const categories = await listAllCategories();
    return apiSuccess(categories);
  });
}

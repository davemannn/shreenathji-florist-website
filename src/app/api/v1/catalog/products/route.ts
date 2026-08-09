import {
  listShopProducts,
  searchShopProducts,
  type ShopProductListParams,
} from "@/features/product/queries";
import { apiSuccess, withApiErrors } from "@/server/api/response";
import type { ProductSort } from "@/server/repositories/product.repository";

const SORTS: ProductSort[] = ["newest", "price-asc", "price-desc", "rating"];

export async function GET(request: Request) {
  return withApiErrors(async () => {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();
    const page = Number(searchParams.get("page")) || 1;
    // Clamped, optional — lets the header's live-search suggestions ask for
    // a handful of results (e.g. 5) instead of a full page of 12+, without
    // opening this up to an unbounded page size.
    const rawPageSize = Number(searchParams.get("pageSize"));
    const pageSize = rawPageSize > 0 && rawPageSize <= 24 ? Math.floor(rawPageSize) : undefined;

    if (q) {
      const result = await searchShopProducts({ query: q, page, pageSize });
      return apiSuccess(result);
    }

    const rawSort = searchParams.get("sort");
    const sort = SORTS.find((s) => s === rawSort);
    const params: ShopProductListParams = {
      categorySlug: searchParams.get("category") ?? undefined,
      sort,
      page,
    };
    const result = await listShopProducts(params);
    return apiSuccess(result);
  });
}

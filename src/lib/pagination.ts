/** Standard admin list page-size choices — shared so the "Rows per page" selector offers the same options everywhere. */
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

/** Parses a `?pageSize=` search param, falling back to `fallback` for anything missing or not one of PAGE_SIZE_OPTIONS — never trusts an arbitrary client-supplied number straight into a Prisma `take`. */
export function parsePageSize(
  value: string | string[] | undefined,
  fallback: number = PAGE_SIZE_OPTIONS[1],
): number {
  const raw = typeof value === "string" ? Number(value) : NaN;
  return (PAGE_SIZE_OPTIONS as readonly number[]).includes(raw) ? raw : fallback;
}

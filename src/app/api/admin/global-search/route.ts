import { NextResponse } from "next/server";
import { getSession } from "@/server/auth/require-admin";
import { can, isAdminRole } from "@/server/auth/permissions";
import { prisma } from "@/server/db/prisma";
import type { GlobalSearchResult } from "@/features/dashboard/types";

const RESULT_LIMIT = 5;

/**
 * One endpoint across the three entity types staff actually need to jump
 * to quickly — each result set is included only if the signed-in role can
 * see that data at all (matches the capability that gates the
 * corresponding list page), so this never surfaces something a role
 * couldn't otherwise reach.
 */
export async function GET(request: Request) {
  // getSession + isAdminRole directly (not requireAdminSession, which
  // calls Next's redirect() — meant for page rendering, not a Route
  // Handler) and not requireAdminCapability (which needs one specific
  // capability; this route's per-section checks below cover that instead).
  const session = await getSession();
  if (!session || !isAdminRole(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const role = session.user.role;

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();
  if (q.length < 2) return NextResponse.json({ results: [] });

  const results: GlobalSearchResult[] = [];

  if (can(role, "orders:view:all")) {
    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { orderNumber: { contains: q } },
          { recipientName: { contains: q } },
          { recipientPhone: { contains: q } },
        ],
      },
      select: { id: true, orderNumber: true, recipientName: true, total: true },
      take: RESULT_LIMIT,
      orderBy: { createdAt: "desc" },
    });
    results.push(
      ...orders.map((o) => ({
        type: "order" as const,
        id: o.id,
        title: o.orderNumber,
        subtitle: `${o.recipientName} · ₹${o.total}`,
        href: `/admin/orders/${o.id}`,
      })),
    );
  }

  if (can(role, "customers:view")) {
    const customers = await prisma.user.findMany({
      where: {
        role: "user",
        OR: [{ name: { contains: q } }, { email: { contains: q } }, { phone: { contains: q } }],
      },
      select: { id: true, name: true, email: true },
      take: RESULT_LIMIT,
    });
    results.push(
      ...customers.map((c) => ({
        type: "customer" as const,
        id: c.id,
        title: c.name,
        subtitle: c.email,
        href: `/admin/customers/${c.id}`,
      })),
    );
  }

  if (can(role, "products:manage")) {
    const products = await prisma.product.findMany({
      where: { OR: [{ title: { contains: q } }, { slug: { contains: q } }] },
      select: { id: true, title: true, slug: true, isActive: true },
      take: RESULT_LIMIT,
    });
    results.push(
      ...products.map((p) => ({
        type: "product" as const,
        id: p.id,
        title: p.title,
        subtitle: p.isActive ? p.slug : `${p.slug} · Inactive`,
        href: `/admin/products/${p.id}`,
      })),
    );
  }

  return NextResponse.json({ results });
}

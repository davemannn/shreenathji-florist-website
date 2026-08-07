/**
 * Admin RBAC — capability matrix for the 4 staff tiers.
 *
 * `User.role` stays exactly the loose `String?` Better Auth's `admin`
 * plugin owns (see src/server/auth/config.ts) — this module doesn't
 * change the DB column, it just defines what the app-level role values
 * mean and what each is allowed to do. Better Auth's own `adminRoles`
 * config only gates Better Auth's *built-in* admin API (ban/impersonate);
 * everything else — every admin page and every admin server action —
 * checks capabilities from here instead.
 */

export const ADMIN_ROLES = ["super_admin", "admin", "store_manager", "delivery_guy"] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

export function isAdminRole(role: string | null | undefined): role is AdminRole {
  return !!role && (ADMIN_ROLES as readonly string[]).includes(role);
}

export type Capability =
  | "products:manage"
  | "categories:manage"
  | "reviews:moderate"
  | "orders:view:all"
  | "orders:view:assigned"
  | "orders:update_status:any"
  | "orders:update_status:assigned"
  | "orders:assign_delivery"
  | "orders:cancel"
  | "coupons:manage"
  | "blog:manage"
  | "gift_cards:view"
  | "gift_cards:issue"
  | "delivery_slots:manage"
  | "settings:manage"
  | "settings:view"
  | "customers:view"
  | "customers:moderate"
  | "team:manage:junior"
  | "team:manage:all"
  | "analytics:view:operational"
  | "analytics:view:financial";

const ROLE_CAPABILITIES: Record<AdminRole, ReadonlySet<Capability>> = {
  super_admin: new Set<Capability>([
    "products:manage",
    "categories:manage",
    "reviews:moderate",
    "orders:view:all",
    "orders:update_status:any",
    "orders:assign_delivery",
    "orders:cancel",
    "coupons:manage",
    "blog:manage",
    "gift_cards:view",
    "gift_cards:issue",
    "delivery_slots:manage",
    "settings:manage",
    "settings:view",
    "customers:view",
    "customers:moderate",
    "team:manage:junior",
    "team:manage:all",
    "analytics:view:operational",
    "analytics:view:financial",
  ]),
  admin: new Set<Capability>([
    "products:manage",
    "categories:manage",
    "reviews:moderate",
    "orders:view:all",
    "orders:update_status:any",
    "orders:assign_delivery",
    "orders:cancel",
    "coupons:manage",
    "blog:manage",
    "gift_cards:view",
    "delivery_slots:manage",
    "settings:manage",
    "settings:view",
    "customers:view",
    "customers:moderate",
    "team:manage:junior",
    "analytics:view:operational",
    "analytics:view:financial",
  ]),
  store_manager: new Set<Capability>([
    "products:manage",
    "categories:manage",
    "reviews:moderate",
    "orders:view:all",
    "orders:update_status:any",
    "orders:assign_delivery",
    "orders:cancel",
    "coupons:manage",
    "blog:manage",
    "gift_cards:view",
    "delivery_slots:manage",
    "settings:view",
    "customers:view",
    "analytics:view:operational",
  ]),
  delivery_guy: new Set<Capability>(["orders:view:assigned", "orders:update_status:assigned"]),
};

/** The single source of truth every admin page/action checks against. */
export function can(role: string | null | undefined, capability: Capability): boolean {
  if (!isAdminRole(role)) return false;
  return ROLE_CAPABILITIES[role].has(capability);
}

/** Better Auth's own ban/impersonate API stays exclusive to the top tier — see adminRoles in config.ts. */
export const BETTER_AUTH_ADMIN_ROLES: AdminRole[] = ["super_admin"];

/**
 * Where to send a staff member who hits an admin page they lack the
 * capability for. Not just "/admin" for everyone — delivery_guy lacks
 * the dashboard's own capability (analytics:view:operational), so
 * bouncing them to "/admin" would just redirect them right back out again.
 */
export function defaultAdminLandingFor(role: AdminRole): string {
  return role === "delivery_guy" ? "/admin/my-deliveries" : "/admin";
}

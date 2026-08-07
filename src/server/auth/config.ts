import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins";
import { adminAc } from "better-auth/plugins/admin/access";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "@/server/db/prisma";
import { BETTER_AUTH_ADMIN_ROLES } from "./permissions";

/**
 * Server-side Better Auth instance. Email/password only for now (no OAuth
 * provider is registered yet — trivial to add later). The `admin` plugin
 * adds `role`/`banned`/`banReason`/`banExpires` to the User model.
 *
 * `adminRoles` here only controls who can call Better Auth's own *built-in*
 * admin API (ban/unban/impersonate) — deliberately narrowed to super_admin
 * only. The full 4-tier staff RBAC (super_admin/admin/store_manager/
 * delivery_guy) is a separate, app-level concern handled by
 * src/server/auth/permissions.ts + require-admin.ts, not by this plugin —
 * "admin"/"store_manager" get an equivalent app-level suspend action
 * instead of raw access to Better Auth's ban/impersonate endpoints.
 *
 * `nextCookies()` must stay last in the plugins array — Better Auth
 * enforces this itself.
 */
export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "mysql" }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    admin({
      defaultRole: "user",
      adminRoles: BETTER_AUTH_ADMIN_ROLES,
      // Better Auth's admin plugin has its own internal role→permission map
      // (independent of our app-level permissions.ts) and only recognizes
      // "admin"/"user" out of the box — any custom adminRoles value must be
      // registered here too, or it rejects it at startup. "super_admin"
      // maps to the plugin's own built-in `adminAc` (full ban/impersonate/
      // etc.), the same permission set its default "admin" role gets.
      roles: { super_admin: adminAc },
    }),
    nextCookies(),
  ],
});

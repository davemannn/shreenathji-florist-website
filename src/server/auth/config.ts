import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "@/server/db/prisma";

/**
 * Server-side Better Auth instance. Email/password only for now (no OAuth
 * provider is registered yet — trivial to add later). The `admin` plugin
 * adds `role`/`banned`/`banReason`/`banExpires` to the User model, used to
 * gate the (admin) route group. `nextCookies()` must stay last in the
 * plugins array — Better Auth enforces this itself.
 */
export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "mysql" }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
  },
  plugins: [admin({ defaultRole: "user", adminRoles: ["admin"] }), nextCookies()],
});

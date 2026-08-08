import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin, emailOTP } from "better-auth/plugins";
import { adminAc } from "better-auth/plugins/admin/access";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "@/server/db/prisma";
import { sendEmail } from "@/server/email/mailer";
import { OtpEmail, type OtpEmailPurpose } from "@/emails/otp-email";
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
    // A signup/sign-in still needs a password — the emailOTP plugin below
    // only replaces *verification* (confirming the address), not the
    // credential itself. See that plugin's overrideDefaultEmailVerification.
    requireEmailVerification: true,
    // Deliberately no sendResetPassword here — the classic link-based
    // reset flow is unused; emailOTP's own forget-password OTP flow
    // (below) is completely independent of this option.
  },
  plugins: [
    emailOTP({
      otpLength: 6,
      expiresIn: 300, // 5 minutes — matches the copy hardcoded in emails/otp-email.tsx
      allowedAttempts: 3,
      // This is the switch that makes the OTP actually *be* the
      // verification mechanism for requireEmailVerification above, instead
      // of the core's default magic-link email — see this plugin's own
      // `init()`, which monkey-patches emailVerification.sendVerificationEmail
      // to fire an OTP send instead whenever core would otherwise send a link.
      overrideDefaultEmailVerification: true,
      async sendVerificationOTP({ email, otp, type }) {
        // "sign-in" and "change-email" OTP types aren't used by this app
        // (no passwordless sign-in, no self-service email-change flow yet)
        // — only the two purposes emails/otp-email.tsx actually has copy for.
        if (type !== "email-verification" && type !== "forget-password") return;

        await sendEmail({
          to: email,
          subject:
            type === "email-verification"
              ? "Verify your email — Shrinathji Florist"
              : "Reset your password — Shrinathji Florist",
          react: OtpEmail({ otp, purpose: type as OtpEmailPurpose }),
        });
      },
    }),
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

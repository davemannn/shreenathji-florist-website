import { createAuthClient } from "better-auth/react";
import { adminClient, emailOTPClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [adminClient(), emailOTPClient()],
});

export const { useSession, signIn, signUp, signOut } = authClient;

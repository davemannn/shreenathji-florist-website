import { z } from "zod";
import { ADMIN_ROLES } from "@/server/auth/permissions";

export const createTeamMemberSchema = z.object({
  name: z.string().min(2, "Enter a name"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters"),
  role: z.enum(ADMIN_ROLES),
});
export type CreateTeamMemberValues = z.infer<typeof createTeamMemberSchema>;

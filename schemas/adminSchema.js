import { z } from "zod";

export const updatePostStatusSchema = z.object({
  status: z.enum(["draft", "published", "archived"]),
});

export const updateUserRoleSchema = z.object({
  roles: z.array(z.enum(["user", "admin", "moderator"])).optional(),
  isActive: z.boolean().optional(),
});

import { z } from "zod";

export const postCreationSchema = z.object({
  categoryName: z.string(),
  categoryImage: z.string().optional(),
});

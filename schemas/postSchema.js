import { object, z } from "zod";

export const postCreationSchema = z.object({
  author: z.string(),
  title: z
    .string()
    .min(20, "Title should be 20 charcters long!!")
    .max(100, "Title should not be greater than 100 charcters!!"),
  content: z.string(),
  tags: z.string().array().max(3, "Maximum 3 tags are allowed"),
  imageUrl: z.string(),
});

export const postCommentSchema = z.object({
  user: z.string(),
  text: z
    .string()
    .min(3, "Comment should be minimum 3 charcters long!!")
    .max(15, "Comment Should not be greater than 15 charchters"),
});

export const postUpdateSchema = z.object({
  author: z.string().optional(),
  title: z
    .string()
    .min(20, "Title should be 20 charcters long!!")
    .max(100, "Title should not be greater than 100 charcters!!"),
  content: z.string(),
  tags: z.string().array().max(3, "Maximum 3 tags are allowed"),
  imageUrl: z.string(),
});

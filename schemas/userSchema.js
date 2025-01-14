import { z } from "zod";

export const userCreationSchema = z.object({
  username: z
    .string()
    .min(5, "Username should be 5 charcters long!!")
    .max(15, "Username can't greater than 15 charcters!!"),
  email: z.string().email("Please enter a valid email!!"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(10, "Password should not greater that 10 charcters")
    .regex(/[A-Z]/, "Password must contain an uppercase letter")
    .regex(/[0-9]/, "Password must contain a number"),
});

export const userUpdateSchema = z.object({
  username: z
    .string()
    .min(5, "Username should be 5 charcters long!!")
    .max(15, "Username can't greater than 15 charcters!!"),
  email: z.string().email("Please enter a valid email!!"),
});

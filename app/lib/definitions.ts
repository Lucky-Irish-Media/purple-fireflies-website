import { z } from "zod";

export const LoginFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }).trim(),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters." })
    .max(128, { message: "Password must be less than 128 characters." })
    .trim(),
});

export type LoginFormState =
  | { errors?: { email?: string[]; password?: string[] }; message?: string }
  | undefined;

export interface SessionPayload {
  adminId: number;
  email: string;
  role: string;
  expiresAt: Date;
}

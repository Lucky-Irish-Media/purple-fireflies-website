import { z } from "zod";

export const LoginFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }).trim(),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters." })
    .max(128, { message: "Password must be less than 128 characters." })
    .regex(/[a-zA-Z]/, { message: "Password must contain at least one letter." })
    .regex(/[0-9]/, { message: "Password must contain at least one number." })
    .regex(/[^a-zA-Z0-9]/, {
      message: "Password must contain at least one special character.",
    })
    .trim(),
});

export const MealSignupSchema = z.object({
  name: z.string().min(1, { message: "Name is required." }).trim(),
  email: z.string().email({ message: "Please enter a valid email." }).trim(),
  phone: z.string().min(10, { message: "Phone number is required." }).trim(),
  address: z.string().min(1, { message: "Address is required." }).trim(),
  mealType: z.enum(["regular", "vegan"], { message: "Please select a meal type." }),
  deliveryDate: z.string().min(1, { message: "Please select a delivery date." }),
  comments: z.string().optional(),
});

export type MealSignupFormState =
  | { errors?: { name?: string[]; email?: string[]; phone?: string[]; address?: string[]; mealType?: string[]; deliveryDate?: string[]; comments?: string[] }; message?: string; selectedDate?: string }
  | undefined;

export type LoginFormState =
  | { errors?: { email?: string[]; password?: string[] }; message?: string }
  | undefined;

export interface SessionPayload {
  adminId: number;
  email: string;
  role: string;
  expiresAt: Date;
}

export interface MealSignup {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  meal_type: "regular" | "vegan";
  delivery_day: "wednesday" | "thursday";
  delivery_date: string;
  comments: string | null;
  created_at: string;
}

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

const stateAbbreviations = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
] as const;

export const MealSignupSchema = z.object({
  name: z.string().min(1, { message: "Name is required." }).trim(),
  email: z.string().email({ message: "Please enter a valid email." }).trim(),
  phone: z.string().min(10, { message: "Phone number is required." }).trim(),
  address1: z.string().min(1, { message: "Address line 1 is required." }).trim(),
  address2: z.string().optional(),
  city: z.string().min(1, { message: "City is required." }).trim(),
  state: z.enum(stateAbbreviations, { message: "Please select a valid state." }),
  zipCode: z.string().min(5, { message: "ZIP code is required." }).max(10).trim(),
  mealType: z.enum(["regular", "vegan"], { message: "Please select a meal type." }),
  deliveryDate: z.string().min(1, { message: "Please select a delivery date." }),
  comments: z.string().optional(),
});

export type MealSignupFormState =
  | { errors?: { name?: string[]; email?: string[]; phone?: string[]; address1?: string[]; address2?: string[]; city?: string[]; state?: string[]; zipCode?: string[]; mealType?: string[]; deliveryDate?: string[]; comments?: string[] }; message?: string; selectedDate?: string }
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

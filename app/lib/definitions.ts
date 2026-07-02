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

const phoneRegex = /^(\+1[-\s.]?)?\(?\d{3}\)?[-\s.]?\d{3}[-\s.]?\d{4}$/;

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
  phone: z.string().regex(phoneRegex, { message: "Please enter a valid phone number." }).trim(),
  address1: z.string().min(1, { message: "Address line 1 is required." }).trim(),
  address2: z.string().optional(),
  city: z.string().min(1, { message: "City is required." }).trim(),
  state: z.enum(stateAbbreviations, { message: "Please select a valid state." }),
  zipCode: z.string().min(5, { message: "ZIP code is required." }).max(10).trim(),
  regularQuantity: z.coerce.number().int().min(0).max(2),
  veganQuantity: z.coerce.number().int().min(0).max(2),
  contactMethod: z.enum(["call", "text", "email"], { message: "Please select a contact method." }),
  deliveryDates: z.array(z.string()).min(1, { message: "Please select at least one delivery date." }),
  comments: z.string().optional(),
}).refine((data) => {
  const total = data.regularQuantity + data.veganQuantity;
  return total >= 1 && total <= 2;
}, { message: "Total meals must be 1 or 2.", path: ["regularQuantity"] });

const regions = ["North", "South", "East", "West", "The Plains", "Chauncey", "Glouster/Jacksonville/Trimble"] as const;

export const DriverVolunteerSchema = z.object({
  name: z.string().min(1, { message: "Name is required." }).trim(),
  email: z.string().email({ message: "Please enter a valid email." }).trim(),
  phone: z.string().regex(phoneRegex, { message: "Please enter a valid phone number." }).trim(),
  onSignal: z.enum(["yes", "no", "willing"], { message: "Please select an option." }),
  deliveryDates: z.array(z.string()).min(1, { message: "Please select at least one delivery date." }),
  regions: z.array(z.enum(regions)).min(1, { message: "Please select at least one region." }),
});

export type MealSignupFormState =
  | { errors?: { name?: string[]; email?: string[]; phone?: string[]; address1?: string[]; address2?: string[]; city?: string[]; state?: string[]; zipCode?: string[]; regularQuantity?: string[]; veganQuantity?: string[]; contactMethod?: string[]; deliveryDates?: string[]; comments?: string[] }; message?: string; selectedDate?: string }
  | undefined;

export type DriverVolunteerFormState =
  | { errors?: { name?: string[]; email?: string[]; phone?: string[]; onSignal?: string[]; deliveryDates?: string[]; regions?: string[] }; message?: string; selectedDates?: string }
  | undefined;

export type LoginFormState =
  | { errors?: { email?: string[]; password?: string[] }; message?: string }
  | undefined;

export interface SessionPayload {
  userId: number;
  email: string;
  role: string;
  expiresAt: Date;
}

export interface MealSignup {
  id: number;
  name: string;
  email: string;
  phone: string;
  address1: string;
  address2: string | null;
  city: string;
  state: string;
  zip_code: string;
  meal_type: "regular" | "vegan";
  quantity: number;
  contact_method: "call" | "text" | "email";
  delivery_day: "wednesday" | "thursday";
  delivery_date: string;
  comments: string | null;
  created_at: string;
}

export interface DriverVolunteer {
  id: number;
  name: string;
  email: string;
  phone: string;
  on_signal: "yes" | "no" | "willing";
  regions: string;
  delivery_day: "wednesday" | "thursday";
  delivery_date: string;
  created_at: string;
}

export interface DeliveryAssignment {
  id: number;
  meal_signup_id: number;
  driver_volunteer_id: number;
  notes: string | null;
  created_at: string;
}

export interface MealSignupWithAssignment extends MealSignup {
  assignment_id: number | null;
  driver_id: number | null;
  driver_name: string | null;
  driver_phone: string | null;
}

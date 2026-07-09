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

export const ParticipantSchema = z.object({
  name: z.string().min(1, { message: "Name is required." }).trim(),
  email: z.string().email({ message: "Please enter a valid email." }).trim(),
  phone: z.string().regex(phoneRegex, { message: "Please enter a valid phone number." }).trim(),
  address1: z.string().min(1, { message: "Address line 1 is required." }).trim(),
  address2: z.string().optional(),
  city: z.string().min(1, { message: "City is required." }).trim(),
  state: z.enum(stateAbbreviations, { message: "Please select a valid state." }),
  zipCode: z.string().min(5, { message: "ZIP code is required." }).max(10).trim(),
  contactMethod: z.enum(["call", "text", "email"], { message: "Please select a contact method." }),
});

export const MealSignupSchema = z.object({
  ...ParticipantSchema.shape,
  regularQuantity: z.coerce.number().int().min(0).max(2),
  veganQuantity: z.coerce.number().int().min(0).max(2),
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

export interface Participant {
  id: number;
  name: string;
  email: string;
  phone: string;
  address1: string;
  address2: string | null;
  city: string;
  state: string;
  zip_code: string;
  contact_method: "call" | "text" | "email";
  created_at: string;
  updated_at: string;
}

export interface MealSignup {
  id: number;
  participant_id: number;
  meal_type: "regular" | "vegan";
  quantity: number;
  delivery_day: "wednesday" | "thursday";
  delivery_date: string;
  comments: string | null;
  created_at: string;
}

export interface DriverVolunteer {
  id: number;
  participant_id: number;
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
  bag_number: string | null;
  created_at: string;
}

export interface MealSignupWithParticipant extends MealSignup {
  participant_name: string;
  participant_email: string;
  participant_phone: string;
  participant_address1: string;
  participant_address2: string | null;
  participant_city: string;
  participant_state: string;
  participant_zip_code: string;
  participant_contact_method: string;
}

export interface DriverVolunteerWithParticipant extends DriverVolunteer {
  participant_name: string;
  participant_email: string;
  participant_phone: string;
}

export interface MealSignupWithAssignment extends MealSignupWithParticipant {
  assignment_id: number | null;
  driver_id: number | null;
  driver_name: string | null;
  driver_phone: string | null;
  assignment_notes: string | null;
  bag_number: string | null;
}

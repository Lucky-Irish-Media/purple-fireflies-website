import { z } from "zod";
import type { DeliveryDay } from "@/app/lib/delivery-day";

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
  driverLicenseNumber: z.string().optional(),
  licenseState: z.string().optional(),
  vehicle: z.string().optional(),
  licensePlate: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().regex(phoneRegex, { message: "Please enter a valid phone number." }).optional().or(z.literal("")),
  signature: z.string().optional(),
  waiverAcknowledged: z.coerce.boolean().optional(),
});

export type MealSignupFormState =
  | { errors?: { name?: string[]; email?: string[]; phone?: string[]; address1?: string[]; address2?: string[]; city?: string[]; state?: string[]; zipCode?: string[]; regularQuantity?: string[]; veganQuantity?: string[]; contactMethod?: string[]; deliveryDates?: string[]; comments?: string[] }; message?: string; selectedDate?: string; waitlistedDates?: string }
  | undefined;

export type DriverVolunteerFormState =
  | { errors?: { name?: string[]; email?: string[]; phone?: string[]; onSignal?: string[]; deliveryDates?: string[]; regions?: string[]; driverLicenseNumber?: string[]; licenseState?: string[]; vehicle?: string[]; licensePlate?: string[]; emergencyContactName?: string[]; emergencyContactPhone?: string[]; signature?: string[]; waiverAcknowledged?: string[] }; message?: string; selectedDates?: string; accountCreated?: boolean }
  | undefined;

export const VolunteerProfileSchema = z.object({
  name: z.string().min(1, { message: "Name is required." }).trim(),
  email: z.string().email({ message: "Please enter a valid email." }).trim(),
  phone: z.string().regex(phoneRegex, { message: "Please enter a valid phone number." }).trim(),
  onSignal: z.enum(["yes", "no", "willing"], { message: "Please select an option." }),
  regions: z.array(z.enum(regions)).min(1, { message: "Please select at least one region." }),
});

export type VolunteerProfileFormState =
  | { errors?: { name?: string[]; email?: string[]; phone?: string[]; onSignal?: string[]; regions?: string[] }; message?: string; success?: boolean }
  | undefined;

export const VolunteerPasswordSchema = z
  .object({
    currentPassword: z.string().min(1, { message: "Current password is required." }),
    newPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 characters." })
      .max(128, { message: "Password must be less than 128 characters." })
      .regex(/[a-zA-Z]/, { message: "Password must contain at least one letter." })
      .regex(/[0-9]/, { message: "Password must contain at least one number." })
      .regex(/[^a-zA-Z0-9]/, {
        message: "Password must contain at least one special character.",
      })
      .trim(),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ["confirmPassword"],
  });

export type VolunteerPasswordFormState =
  | { errors?: { currentPassword?: string[]; newPassword?: string[]; confirmPassword?: string[] }; message?: string; success?: boolean }
  | undefined;

export type CancelVolunteerSignupState =
  | { message?: string; success?: boolean }
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
  internal_notes: string | null;
  bag_number: string | null;
  driver_liability: number;
  driver_status: "active" | "inactive";
  created_at: string;
  updated_at: string;
}

export interface MealSignup {
  id: number;
  participant_id: number;
  regular_quantity: number;
  vegan_quantity: number;
  delivery_day: DeliveryDay;
  delivery_date: string;
  comments: string | null;
  bag_number: string | null;
  status: "active" | "out_of_range";
  created_at: string;
}

export interface DriverVolunteer {
  id: number;
  participant_id: number;
  on_signal: "yes" | "no" | "willing";
  regions: string;
  delivery_day: DeliveryDay;
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
  participant_internal_notes: string | null;
}

export interface DriverVolunteerWithParticipant extends DriverVolunteer {
  participant_name: string;
  participant_email: string;
  participant_phone: string;
  participant_bag_number: string | null;
  participant_driver_liability: number;
  participant_driver_status: "active" | "inactive";
  participant_waiver_signed_at: string | null;
}

export interface VolunteerDelivery {
  meal_signup_id: number;
  delivery_date: string;
  delivery_day: string;
  recipient_name: string;
  recipient_phone: string;
  recipient_address: string;
  comments: string | null;
}

export interface VolunteerSignupWithDeliveries extends DriverVolunteerWithParticipant {
  deliveries: VolunteerDelivery[];
}

export interface VolunteerDashboard {
  signups: VolunteerSignupWithDeliveries[];
}

export interface MealSignupWithAssignment extends MealSignupWithParticipant {
  assignment_id: number | null;
  driver_id: number | null;
  driver_name: string | null;
  driver_phone: string | null;
}

export interface AssignedRecipient {
  meal_signup_id: number;
  recipient_name: string;
  recipient_phone: string;
  address: string;
  regular_quantity: number;
  vegan_quantity: number;
  comments: string | null;
}

export interface DeliverySignupOverview {
  driver_volunteer_id: number;
  driver_name: string;
  driver_phone: string;
  delivery_day: DeliveryDay;
  delivery_date: string;
  assigned_count: number;
  assigned_recipients: AssignedRecipient[];
}

export type WaitlistStatus = "waiting" | "notified" | "converted" | "expired";

export interface WaitlistEntry {
  id: number;
  participant_id: number;
  delivery_date: string;
  regular_quantity: number;
  vegan_quantity: number;
  comments: string | null;
  status: WaitlistStatus;
  created_at: string;
}

export interface WaitlistEntryWithParticipant extends WaitlistEntry {
  participant_name: string;
  participant_email: string;
  participant_phone: string;
  participant_address1: string;
  participant_address2: string | null;
  participant_city: string;
  participant_state: string;
  participant_zip_code: string;
}

export const WaitlistSchema = z.object({
  deliveryDates: z.array(z.string()),
});

export interface Event {
  id: number;
  title: string;
  description: string | null;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  url: string | null;
  created_at: string;
}

export const EventSchema = z.object({
  title: z.string().min(1, { message: "Title is required." }).trim(),
  event_date: z.string().min(1, { message: "Date is required." }),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  location: z.string().optional(),
  description: z.string().optional(),
  url: z.union([z.string().url({ message: "Please enter a valid URL." }), z.literal("")]).optional(),
});

export interface NewsArticle {
  id: number;
  title: string;
  source: string;
  url: string;
  published_at: string;
  excerpt: string | null;
  created_at: string;
}

export const NewsArticleSchema = z.object({
  title: z.string().min(1, { message: "Title is required." }).trim(),
  source: z.string().min(1, { message: "Source is required." }).trim(),
  url: z.string().url({ message: "Please enter a valid URL." }),
  published_at: z.string().min(1, { message: "Published date is required." }),
  excerpt: z.string().optional(),
});

export const NEWSLETTER_STATUS_VALUES = ["draft", "published", "sent"] as const;
export type NewsletterStatus = (typeof NEWSLETTER_STATUS_VALUES)[number];

export const NewsletterSchema = z.object({
  title: z.string().min(1, { message: "Title is required." }).trim(),
  slug: z
    .string()
    .min(1, { message: "Slug is required." })
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: "Use lowercase letters, numbers, and hyphens." })
    .trim(),
  body: z.string().default(""),
  excerpt: z.string().optional(),
  status: z.enum(NEWSLETTER_STATUS_VALUES).default("draft"),
});

export interface Newsletter {
  id: number;
  title: string;
  slug: string;
  body: string;
  excerpt: string | null;
  status: NewsletterStatus;
  published_at: string | null;
  sent_at: string | null;
  recipient_count: number;
  author_user_id: number | null;
  created_at: string;
  updated_at: string;
}

export const NewsletterSubscriberSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }).trim(),
  name: z.string().optional(),
  tags: z.string().optional(),
});

export type NewsletterSubscriberStatus = "pending" | "confirmed" | "unsubscribed";

export interface NewsletterSubscriber {
  id: number;
  email: string;
  name: string | null;
  status: NewsletterSubscriberStatus;
  tags: string;
  confirm_token: string;
  unsubscribe_token: string;
  confirmed_at: string | null;
  unsubscribed_at: string | null;
  created_at: string;
  updated_at: string;
}

export const LegalObserverSignupSchema = z.object({
  name: z.string().min(1, { message: "Name is required." }).trim(),
  email: z.string().email({ message: "Please enter a valid email." }).trim(),
  phone: z.string().regex(phoneRegex, { message: "Please enter a valid phone number." }).trim(),
  background: z.string().optional(),
  motivation: z.string().optional(),
  skills: z.string().optional(),
});

export const LegalObserverRequestSchema = z.object({
  contact_name: z.string().min(1, { message: "Contact name is required." }).trim(),
  contact_email: z.string().email({ message: "Please enter a valid email." }).trim(),
  contact_phone: z.string().regex(phoneRegex, { message: "Please enter a valid phone number." }).trim(),
  event_date: z.string().min(1, { message: "Event date is required." }),
  event_time: z.string().optional(),
  event_location: z.string().min(1, { message: "Event location is required." }).trim(),
  event_type: z.string().optional(),
  special_notes: z.string().optional(),
});

export type LegalObserverSignupFormState =
  | { errors?: { name?: string[]; email?: string[]; phone?: string[]; background?: string[]; motivation?: string[]; skills?: string[] }; message?: string }
  | undefined;

export type LegalObserverRequestFormState =
  | { errors?: { contact_name?: string[]; contact_email?: string[]; contact_phone?: string[]; event_date?: string[]; event_time?: string[]; event_location?: string[]; event_type?: string[]; special_notes?: string[] }; message?: string }
  | undefined;

export interface LegalObserverSignup {
  id: number;
  name: string;
  email: string;
  phone: string;
  background: string | null;
  motivation: string | null;
  skills: string | null;
  created_at: string;
}

export type LoRequestStatus = "pending" | "working" | "fulfilled" | "partial" | "unable" | "cancelled";

export const LO_REQUEST_STATUS_OPTIONS: { value: LoRequestStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "working", label: "Working" },
  { value: "fulfilled", label: "Fulfilled" },
  { value: "partial", label: "Partial" },
  { value: "unable", label: "Unable" },
  { value: "cancelled", label: "Cancelled" },
];

export interface LegalObserverRequest {
  id: number;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  event_date: string;
  event_time: string | null;
  event_location: string;
  event_type: string | null;
  special_notes: string | null;
  status: LoRequestStatus;
  internal_notes: string | null;
  created_at: string;
  updated_at: string;
}

export const ANIMAL_STATUS_VALUES = ["draft", "accepting", "funded", "closed"] as const;

export type AnimalStatus = (typeof ANIMAL_STATUS_VALUES)[number];

export const ANIMAL_STATUS_OPTIONS: { value: AnimalStatus; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "accepting", label: "Accepting sponsors" },
  { value: "funded", label: "Funded" },
  { value: "closed", label: "Closed" },
];

export const SPONSORSHIP_STATUS_VALUES = ["succeeded", "refunded", "failed"] as const;

export type SponsorshipStatus = (typeof SPONSORSHIP_STATUS_VALUES)[number];

export const NEED_CADENCE_OPTIONS: { value: string; label: string }[] = [
  { value: "one_time", label: "One-time" },
  { value: "monthly", label: "Monthly" },
];

/**
 * A single line on a pet's needs list, stored in `animals.needs_json`.
 * `cost_cents` is what that line actually costs, so the page can show real
 * numbers instead of a round goal. `cadence` stays a free string because an
 * admin may type "weekly" or "as needed" and a closed enum would silently
 * drop the whole need.
 */
export const AnimalNeedSchema = z.object({
  label: z.string().min(1, { message: "Label is required." }).trim(),
  cost_cents: z.coerce.number().int().nonnegative({ message: "Cost cannot be negative." }),
  cadence: z.string().min(1).trim().default("one_time"),
});

export type AnimalNeed = z.infer<typeof AnimalNeedSchema>;

export const AnimalNeedListSchema = z.array(AnimalNeedSchema);

/**
 * `needs_json` is free text written by an admin, so a bad value must not throw
 * on a public page. Null, invalid JSON, or a shape that does not match all
 * degrade to an empty list.
 */
export function parseAnimalNeeds(raw: string | null | undefined): AnimalNeed[] {
  if (!raw) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  const result = AnimalNeedListSchema.safeParse(parsed);
  return result.success ? result.data : [];
}

const booleanField = z
  .union([z.boolean(), z.literal("on"), z.literal("true"), z.literal("false"), z.literal("")])
  .transform((value) => value === true || value === "on" || value === "true");

export const AnimalSchema = z.object({
  slug: z
    .string()
    .min(1, { message: "Slug is required." })
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: "Use lowercase letters, numbers, and hyphens." })
    .trim(),
  name: z.string().min(1, { message: "Name is required." }).trim(),
  species: z.string().min(1, { message: "Species is required." }).trim(),
  breed: z.string().optional(),
  age_text: z.string().optional(),
  sex: z.string().optional(),
  tagline: z.string().optional(),
  bio: z.string().min(1, { message: "Bio is required." }).trim(),
  story: z.string().optional(),
  needs_json: z.string().optional(),
  goal_cents: z.coerce.number().int().min(0).default(0),
  gb_campaign_code: z.string().optional(),
  gb_campaign_url: z.union([z.string().url({ message: "Please enter a valid URL." }), z.literal("")]).optional(),
  status: z.enum(ANIMAL_STATUS_VALUES).default("draft"),
  is_published: booleanField.default(false),
  owner_consent_at: z.string().optional(),
  owner_consent_note: z.string().optional(),
  sort_order: z.coerce.number().int().default(0),
});

export type AnimalFormData = z.infer<typeof AnimalSchema>;

export const AnimalExpenseSchema = z.object({
  label: z.string().min(1, { message: "Description is required." }).trim(),
  amount_cents: z.coerce.number().int().positive({ message: "Amount must be greater than zero." }),
  vendor: z.string().optional(),
  spent_on: z.string().optional(),
});

export const AnimalPhotoSchema = z.object({
  photo_key: z.string().min(1, { message: "Photo key is required." }).trim(),
  alt: z.string().optional(),
  sort_order: z.coerce.number().int().default(0),
});

export interface Animal {
  id: number;
  slug: string;
  name: string;
  species: string;
  breed: string | null;
  age_text: string | null;
  sex: string | null;
  tagline: string | null;
  bio: string;
  story: string | null;
  needs_json: string | null;
  goal_cents: number;
  gb_campaign_code: string | null;
  gb_campaign_url: string | null;
  gb_raised_cents: number;
  gb_supporters: number;
  gb_synced_at: string | null;
  status: AnimalStatus;
  is_published: number;
  owner_consent_at: string | null;
  owner_consent_note: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface AnimalPhoto {
  id: number;
  animal_id: number;
  photo_key: string;
  alt: string | null;
  sort_order: number;
  created_at: string;
}

export interface AnimalWithPhotos extends Animal {
  photos: AnimalPhoto[];
}

export interface AnimalExpense {
  id: number;
  animal_id: number;
  label: string;
  amount_cents: number;
  vendor: string | null;
  spent_on: string | null;
  created_at: string;
}

export interface AnimalSponsorship {
  id: number;
  animal_id: number | null;
  gb_transaction_id: string;
  gb_plan_id: string | null;
  gb_campaign_code: string | null;
  amount_cents: number;
  fee_cents: number | null;
  donated_cents: number | null;
  is_recurring: number;
  donor_first_name: string | null;
  donor_last_name: string | null;
  donor_email: string | null;
  display_name: string | null;
  show_publicly: number;
  status: SponsorshipStatus;
  occurred_at: string | null;
  created_at: string;
}

/**
 * Admin-only: one sponsorship row joined to its animal. Carries donor PII
 * (`donor_email`), so it must never be passed into a public page, a public
 * component, or a public route handler. Only the admin sponsors table reads it.
 *
 * `animal_name` and `animal_slug` are null when the row has no `animal_id`, or
 * when the pet was deleted, so the donor ledger keeps the transaction either way.
 */
export interface AnimalSponsorshipWithAnimal extends AnimalSponsorship {
  animal_name: string | null;
  animal_slug: string | null;
}

/**
 * Writable animal fields. Cached Givebutter totals and timestamps are owned by
 * `updateGivebutterTotals()`, not by the admin form.
 */
export interface AnimalInput {
  slug: string;
  name: string;
  species: string;
  breed?: string | null;
  age_text?: string | null;
  sex?: string | null;
  tagline?: string | null;
  bio: string;
  story?: string | null;
  needs_json?: string | null;
  goal_cents?: number;
  gb_campaign_code?: string | null;
  gb_campaign_url?: string | null;
  status?: AnimalStatus;
  is_published?: boolean;
  owner_consent_at?: string | null;
  owner_consent_note?: string | null;
  sort_order?: number;
}

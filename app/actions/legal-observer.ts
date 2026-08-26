"use server";

import { LegalObserverSignupSchema, LegalObserverRequestSchema, type LegalObserverSignupFormState, type LegalObserverRequestFormState } from "@/app/lib/definitions";
import { createLegalObserverSignup, createLegalObserverRequest } from "@/app/lib/db";
import { checkRateLimit } from "@/app/lib/rate-limit";

function getErrorMessage(): string {
  return "An unexpected error occurred. Please try again.";
}

export async function submitLegalObserverSignup(
  _state: LegalObserverSignupFormState,
  formData: FormData
): Promise<LegalObserverSignupFormState> {
  try {
    const { allowed } = await checkRateLimit("signup:legal-observer");
    if (!allowed) {
      return { message: "Too many signup attempts. Please try again in 15 minutes." };
    }

    const validatedFields = LegalObserverSignupSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      background: formData.get("background"),
      motivation: formData.get("motivation"),
      skills: formData.get("skills"),
    });

    if (!validatedFields.success) {
      return { errors: validatedFields.error.flatten().fieldErrors };
    }

    const data = validatedFields.data;

    await createLegalObserverSignup({
      name: data.name,
      email: data.email,
      phone: data.phone,
      background: data.background,
      motivation: data.motivation,
      skills: data.skills,
    });

    return { message: "success" };
  } catch (e) {
    console.error("legal observer signup action error:", e);
    return { message: getErrorMessage() };
  }
}

export async function submitLegalObserverRequest(
  _state: LegalObserverRequestFormState,
  formData: FormData
): Promise<LegalObserverRequestFormState> {
  try {
    const { allowed } = await checkRateLimit("request:legal-observer");
    if (!allowed) {
      return { message: "Too many request attempts. Please try again in 15 minutes." };
    }

    const validatedFields = LegalObserverRequestSchema.safeParse({
      contact_name: formData.get("contact_name"),
      contact_email: formData.get("contact_email"),
      contact_phone: formData.get("contact_phone"),
      event_date: formData.get("event_date"),
      event_time: formData.get("event_time"),
      event_location: formData.get("event_location"),
      event_type: formData.get("event_type"),
      special_notes: formData.get("special_notes"),
    });

    if (!validatedFields.success) {
      return { errors: validatedFields.error.flatten().fieldErrors };
    }

    const data = validatedFields.data;

    await createLegalObserverRequest({
      contactName: data.contact_name,
      contactEmail: data.contact_email,
      contactPhone: data.contact_phone,
      eventDate: data.event_date,
      eventTime: data.event_time,
      eventLocation: data.event_location,
      eventType: data.event_type,
      specialNotes: data.special_notes,
    });

    return { message: "success" };
  } catch (e) {
    console.error("legal observer request action error:", e);
    return { message: getErrorMessage() };
  }
}

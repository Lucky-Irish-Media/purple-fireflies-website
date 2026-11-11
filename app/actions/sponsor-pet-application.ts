"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { verifySession } from "@/app/lib/dal";
import {
  PetApplicationSchema,
  type PetApplicationFormState,
} from "@/app/lib/definitions";
import {
  createPetApplication,
  getPetApplications,
  getPetApplicationById,
  updatePetApplication,
} from "@/app/lib/db";
import { createAnimal } from "@/app/lib/db";
import { checkRateLimit } from "@/app/lib/rate-limit";
import {
  sendPetApplicationAdminEmail,
  sendPetApplicationConfirmationEmail,
} from "@/app/lib/email";
import { PET_WAIVER_VERSION } from "@/app/lib/pet-waiver";

function getErrorMessage(): string {
  return "An unexpected error occurred. Please try again.";
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function submitPetApplication(
  _state: PetApplicationFormState,
  formData: FormData,
): Promise<PetApplicationFormState> {
  try {
    const { allowed } = await checkRateLimit("signup:pet-application");
    if (!allowed) {
      return { message: "Too many signup attempts. Please try again in 15 minutes." };
    }

    const validatedFields = PetApplicationSchema.safeParse({
      applicant_name: formData.get("applicant_name"),
      applicant_email: formData.get("applicant_email"),
      applicant_phone: formData.get("applicant_phone"),
      applicant_address: formData.get("applicant_address"),
      pet_name: formData.get("pet_name"),
      species: formData.get("species"),
      breed: formData.get("breed"),
      age_text: formData.get("age_text"),
      sex: formData.get("sex"),
      story: formData.get("story"),
      needs: formData.get("needs"),
      signature: formData.get("signature") ?? undefined,
      waiverAcknowledged: formData.get("waiverAcknowledged") ?? undefined,
    });

    if (!validatedFields.success) {
      return { errors: validatedFields.error.flatten().fieldErrors };
    }

    const data = validatedFields.data;

    const signature = data.signature?.trim();
    if (!signature) {
      return { errors: { signature: ["Signature is required."] } };
    }
    if (data.waiverAcknowledged !== true) {
      return { errors: { waiverAcknowledged: ["You must acknowledge the waiver terms."] } };
    }

    const hdrs = await headers();
    const ipAddress =
      hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      hdrs.get("x-real-ip") ||
      null;
    const userAgent = hdrs.get("user-agent") || null;

    const application = await createPetApplication({
      applicantName: data.applicant_name,
      applicantEmail: data.applicant_email,
      applicantPhone: data.applicant_phone,
      applicantAddress: data.applicant_address,
      petName: data.pet_name,
      species: data.species,
      breed: data.breed,
      ageText: data.age_text,
      sex: data.sex,
      story: data.story,
      needs: data.needs,
      status: "submitted",
      waiverSignedAt: new Date().toISOString(),
      waiverSignerName: signature,
      waiverVersion: PET_WAIVER_VERSION,
      waiverIp: ipAddress,
      waiverUserAgent: userAgent,
    });

    try {
      await sendPetApplicationAdminEmail({
        applicantName: data.applicant_name,
        applicantEmail: data.applicant_email,
        applicantPhone: data.applicant_phone,
        applicantAddress: data.applicant_address,
        petName: data.pet_name,
        species: data.species,
        breed: data.breed,
        ageText: data.age_text,
        sex: data.sex,
        story: data.story,
        needs: data.needs,
      });
    } catch (e) {
      console.error("pet application admin email error:", e);
    }

    try {
      await sendPetApplicationConfirmationEmail({
        to: data.applicant_email,
        applicantName: data.applicant_name,
        petName: data.pet_name,
      });
    } catch (e) {
      console.error("pet application confirmation email error:", e);
    }

    return { message: "success", success: true };
  } catch (e) {
    console.error("pet application action error:", e);
    return { message: getErrorMessage() };
  }
}

export async function updatePetApplicationAction(
  id: number,
  status: string,
  internalNotes: string | null,
): Promise<{ success: boolean; message: string; applications?: Awaited<ReturnType<typeof getPetApplications>> }> {
  try {
    await verifySession();
    const validStatuses = ["submitted", "contacted", "approved", "declined", "converted"];
    if (!validStatuses.includes(status)) {
      return { success: false, message: "Invalid status." };
    }
    await updatePetApplication(id, {
      status: status as any,
      internal_notes: internalNotes,
    });
    const applications = await getPetApplications();
    revalidatePath("/admin/programs/community-pets");
    return { success: true, message: "Application updated.", applications };
  } catch (e) {
    console.error("updatePetApplicationAction error:", e);
    return { success: false, message: "Failed to update application." };
  }
}

export async function convertPetApplicationAction(
  id: number,
): Promise<{ success: boolean; message: string; applications?: Awaited<ReturnType<typeof getPetApplications>> }> {
  try {
    await verifySession();
    const application = await getPetApplicationById(id);
    if (!application) {
      return { success: false, message: "Application not found." };
    }
    if (application.status === "converted" && application.converted_animal_id) {
      return { success: true, message: "Already converted.", applications: await getPetApplications() };
    }

    const slugBase = slugify(application.pet_name) || `pet-${application.id}`;
    let slug = slugBase;
    let animal;
    try {
      animal = await createAnimal({
        slug,
        name: application.pet_name,
        species: application.species,
        breed: application.breed,
        age_text: application.age_text,
        sex: application.sex,
        bio: application.story || "Pending details from application.",
        story: application.story,
        needs_json: null,
        status: "draft",
        is_published: false,
        owner_consent_at: application.waiver_signed_at,
        owner_consent_note: `Converted from application #${application.id} (${application.applicant_name}).`,
        sort_order: 0,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      if (msg.includes("UNIQUE")) {
        slug = `${slugBase}-${application.id}`;
        animal = await createAnimal({
          slug,
          name: application.pet_name,
          species: application.species,
          breed: application.breed,
          age_text: application.age_text,
          sex: application.sex,
          bio: application.story || "Pending details from application.",
          story: application.story,
          needs_json: null,
          status: "draft",
          is_published: false,
          owner_consent_at: application.waiver_signed_at,
          owner_consent_note: `Converted from application #${application.id} (${application.applicant_name}).`,
          sort_order: 0,
        });
      } else {
        throw e;
      }
    }

    await updatePetApplication(id, {
      status: "converted",
      converted_animal_id: animal.id,
    });

    revalidatePath("/admin/programs/community-pets");
    revalidatePath("/programs/sponsor-a-pet");
    const applications = await getPetApplications();
    return {
      success: true,
      message: `Converted to draft pet "${animal.name}". Edit it in the Animals tab.`,
      applications,
    };
  } catch (e) {
    console.error("convertPetApplicationAction error:", e);
    return { success: false, message: "Failed to convert application." };
  }
}
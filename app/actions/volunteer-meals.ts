"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { VolunteerSignupSchema, type VolunteerSignupFormState } from "@/app/lib/definitions";
import {
  getVolunteerDay,
  getSlotUsageForDayRole,
  createVolunteerSignup,
  getVolunteerSignupsByEmail,
  updateVolunteerDay,
  createVolunteerDay,
  deleteVolunteerDay,
  updateVolunteerSignup,
  cancelVolunteerSignup,
  getParticipantByEmail,
  createParticipant,
  updateParticipant,
  upsertParticipantProgram,
  getUserByEmail,
  createUser,
} from "@/app/lib/db";
import { checkRateLimit } from "@/app/lib/rate-limit";
import { generateRandomPassword } from "@/app/lib/password";
import { sendVolunteerAccountEmail } from "@/app/lib/email";
import { sendVolunteerMealConfirmation, sendVolunteerMealCoordinatorNotification } from "@/app/lib/email";
import { verifySession } from "@/app/lib/dal";

function getErrorMessage(): string {
  return "An unexpected error occurred. Please try again.";
}

export async function submitVolunteerSignup(
  _state: VolunteerSignupFormState,
  formData: FormData
): Promise<VolunteerSignupFormState> {
  try {
    const { allowed } = await checkRateLimit("signup:volunteer-meal");
    if (!allowed) {
      return { message: "Too many signup attempts. Please try again in 15 minutes." };
    }

    const isGroupRaw = formData.get("isGroup");
    const isGroup = isGroupRaw === "true" || isGroupRaw === "on" || isGroupRaw === "1";

    const validated = VolunteerSignupSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      contactMethod: formData.get("contactMethod") || "email",
      dayId: formData.get("dayId"),
      role: formData.get("role"),
      isGroup,
      groupName: formData.get("groupName") || undefined,
      headcount: formData.get("headcount") || (isGroup ? undefined : 1),
      notes: formData.get("notes") || undefined,
    });

    if (!validated.success) {
      return { errors: validated.error.flatten().fieldErrors as Record<string, string[]> };
    }

    const data = validated.data;

    if (data.isGroup && (!data.groupName || data.groupName.trim() === "")) {
      return { errors: { groupName: ["Group name is required for group signups."] } };
    }

    const day = await getVolunteerDay(data.dayId);
    if (!day) return { message: "Volunteer day not found." };
    if (day.status !== "open") return { message: "This volunteer day is closed to new signups." };

    // capacity check
    const used = await getSlotUsageForDayRole(day.id, data.role);
    const remaining = 5 - used;
    if (data.headcount > remaining) {
      return { message: `Only ${remaining} slot(s) remaining for ${data.role}.` };
    }

    let participant = await getParticipantByEmail(data.email);
    if (participant) {
      participant = await updateParticipant(participant.id, {
        name: data.name,
        email: data.email,
        phone: data.phone,
        address1: participant.address1 || "",
        city: participant.city || "",
        state: participant.state || "OH",
        zipCode: participant.zip_code || "",
        contactMethod: data.contactMethod,
      }, { actor: data.email, source: "volunteer_meals_public" });
    } else {
      participant = await createParticipant({
        name: data.name,
        email: data.email,
        phone: data.phone,
        address1: "",
        city: "",
        state: "OH",
        zipCode: "",
        contactMethod: data.contactMethod,
      });
    }
    await upsertParticipantProgram(participant.id, "kitchen-volunteer");

    const createdSignup = await createVolunteerSignup({
      day_id: day.id,
      participant_id: participant.id,
      role: data.role,
      is_group: data.isGroup,
      group_name: data.isGroup ? (data.groupName ?? null) : null,
      headcount: data.headcount,
      notes: data.notes ?? null,
    });
    if (!createdSignup) {
      return { message: `Not enough slots remaining for ${data.role}, or the day is closed.` };
    }

    // account creation (auto-approved, active)
    let tempPassword: string | null = null;
    const existingUser = await getUserByEmail(data.email);
    if (!existingUser) {
      tempPassword = generateRandomPassword();
      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(tempPassword, salt);
      await createUser({
        email: data.email,
        name: data.name,
        passwordHash,
        role: "volunteer",
        status: "active",
      });
      await sendVolunteerAccountEmail(data.email, data.name, tempPassword);
    }

    try {
      await sendVolunteerMealConfirmation({
        to: participant.email,
        name: participant.name,
        date: day.date,
        role: data.role,
        isGroup: data.isGroup,
        groupName: data.isGroup ? (data.groupName ?? null) : null,
        headcount: data.headcount,
        tempPassword,
      });
    } catch (e) {
      console.error("volunteer meal confirmation email error:", e);
    }
    try {
      await sendVolunteerMealCoordinatorNotification({
        volunteerName: participant.name,
        volunteerEmail: participant.email,
        volunteerPhone: participant.phone,
        date: day.date,
        role: data.role,
        isGroup: data.isGroup,
        groupName: data.isGroup ? (data.groupName ?? null) : null,
        headcount: data.headcount,
      });
    } catch (e) {
      console.error("volunteer meal coordinator email error:", e);
    }

    revalidatePath("/programs/winter-food-drive/volunteer");
    revalidatePath("/programs/winter-food-drive");
    revalidatePath("/admin/programs/winter-food-drive");

    const formatted = new Date(day.date + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
    return { message: "success", success: true, selectedDate: formatted };
  } catch (e) {
    console.error("volunteer meal signup action error:", e);
    return { message: getErrorMessage() };
  }
}

// ---- Admin actions ----

export async function createVolunteerDayAction(formData: FormData): Promise<{ success: boolean; message: string }> {
  try {
    await verifySession();
    const date = String(formData.get("date") || "").trim();
    const title = (formData.get("title") as string) || null;
    const notes = (formData.get("notes") as string) || null;
    if (!date) return { success: false, message: "Date is required." };
    // validate Sunday or Wednesday
    const d = new Date(date + "T00:00:00");
    if (d.getDay() !== 0 && d.getDay() !== 3) {
      return { success: false, message: "Volunteer days must be a Sunday or Wednesday." };
    }
    await createVolunteerDay({ date, title: title || null, notes: notes || null });
    revalidatePath("/admin/programs/winter-food-drive");
    revalidatePath("/programs/winter-food-drive/volunteer");
    return { success: true, message: "Volunteer day created." };
  } catch (e) {
    console.error("createVolunteerDayAction error:", e);
    return { success: false, message: "Failed to create volunteer day." };
  }
}

export async function updateVolunteerDayAction(formData: FormData): Promise<{ success: boolean; message: string }> {
  try {
    await verifySession();
    const id = Number(formData.get("id"));
    if (!id) return { success: false, message: "Missing day id." };
    await updateVolunteerDay(id, {
      title: formData.has("title") ? (formData.get("title") as string) : undefined,
      notes: formData.has("notes") ? (formData.get("notes") as string) : undefined,
      date: formData.has("date") ? String(formData.get("date")) : undefined,
      status: (formData.get("status") as "open" | "closed") || undefined,
    });
    revalidatePath("/admin/programs/winter-food-drive");
    revalidatePath("/programs/winter-food-drive/volunteer");
    return { success: true, message: "Volunteer day updated." };
  } catch (e) {
    console.error("updateVolunteerDayAction error:", e);
    return { success: false, message: "Failed to update volunteer day." };
  }
}

export async function closeVolunteerDayAction(formData: FormData): Promise<{ success: boolean; message: string }> {
  try {
    await verifySession();
    const id = Number(formData.get("id"));
    if (!id) return { success: false, message: "Missing day id." };
    await updateVolunteerDay(id, { status: "closed" });
    revalidatePath("/admin/programs/winter-food-drive");
    revalidatePath("/programs/winter-food-drive/volunteer");
    return { success: true, message: "Volunteer day closed." };
  } catch (e) {
    console.error("closeVolunteerDayAction error:", e);
    return { success: false, message: "Failed to close volunteer day." };
  }
}

export async function reopenVolunteerDayAction(formData: FormData): Promise<{ success: boolean; message: string }> {
  try {
    await verifySession();
    const id = Number(formData.get("id"));
    if (!id) return { success: false, message: "Missing day id." };
    await updateVolunteerDay(id, { status: "open" });
    revalidatePath("/admin/programs/winter-food-drive");
    revalidatePath("/programs/winter-food-drive/volunteer");
    return { success: true, message: "Volunteer day reopened." };
  } catch (e) {
    console.error("reopenVolunteerDayAction error:", e);
    return { success: false, message: "Failed to reopen volunteer day." };
  }
}

export async function deleteVolunteerDayAction(formData: FormData): Promise<{ success: boolean; message: string }> {
  try {
    await verifySession();
    const id = Number(formData.get("id"));
    if (!id) return { success: false, message: "Missing day id." };
    await deleteVolunteerDay(id);
    revalidatePath("/admin/programs/winter-food-drive");
    revalidatePath("/programs/winter-food-drive/volunteer");
    return { success: true, message: "Volunteer day deleted." };
  } catch (e) {
    console.error("deleteVolunteerDayAction error:", e);
    return { success: false, message: "Failed to delete volunteer day." };
  }
}

export async function updateVolunteerSignupAction(formData: FormData): Promise<{ success: boolean; message: string }> {
  try {
    await verifySession();
    const id = Number(formData.get("id"));
    if (!id) return { success: false, message: "Missing signup id." };
    await updateVolunteerSignup(id, {
      role: (formData.get("role") as string) || undefined,
      is_group: formData.has("is_group") ? formData.get("is_group") === "true" : undefined,
      group_name: formData.has("group_name") ? (formData.get("group_name") as string) : undefined,
      headcount: formData.has("headcount") ? Number(formData.get("headcount")) : undefined,
      status: (formData.get("status") as "active" | "cancelled") || undefined,
      notes: formData.has("notes") ? (formData.get("notes") as string) : undefined,
    });
    revalidatePath("/admin/programs/winter-food-drive");
    revalidatePath("/programs/winter-food-drive/volunteer");
    return { success: true, message: "Signup updated." };
  } catch (e) {
    console.error("updateVolunteerSignupAction error:", e);
    return { success: false, message: "Failed to update signup." };
  }
}

export async function cancelVolunteerSignupAdminAction(formData: FormData): Promise<{ success: boolean; message: string }> {
  try {
    await verifySession();
    const id = Number(formData.get("id"));
    if (!id) return { success: false, message: "Missing signup id." };
    await cancelVolunteerSignup(id);
    revalidatePath("/admin/programs/winter-food-drive");
    revalidatePath("/programs/winter-food-drive/volunteer");
    return { success: true, message: "Signup cancelled." };
  } catch (e) {
    console.error("cancelVolunteerSignupAdminAction error:", e);
    return { success: false, message: "Failed to cancel signup." };
  }
}

// volunteer portal cancel
export async function cancelMyVolunteerSignupAction(formData: FormData): Promise<{ success: boolean; message: string }> {
  try {
    const session = await verifySession();
    const id = Number(formData.get("id"));
    if (!id) return { success: false, message: "Missing signup id." };
    // verify ownership
    const signups = await getVolunteerSignupsByEmail(session.email);
    if (!signups.some((s) => s.id === id)) {
      return { success: false, message: "Signup not found." };
    }
    await cancelVolunteerSignup(id);
    revalidatePath("/volunteer");
    revalidatePath("/programs/winter-food-drive/volunteer");
    return { success: true, message: "Signup cancelled." };
  } catch (e) {
    console.error("cancelMyVolunteerSignupAction error:", e);
    return { success: false, message: "Failed to cancel signup." };
  }
}

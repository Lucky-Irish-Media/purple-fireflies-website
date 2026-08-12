"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { verifySession } from "@/app/lib/dal";
import { createSession } from "@/app/lib/session";
import {
  deleteDriverVolunteer,
  getDriverById,
  getParticipantByEmail,
  getUserByEmail,
  updateParticipant,
  updateUserEmail,
  updateUserPassword,
  updateVolunteerSignupContact,
} from "@/app/lib/db";
import {
  VolunteerProfileSchema,
  VolunteerPasswordSchema,
  type VolunteerProfileFormState,
  type VolunteerPasswordFormState,
  type CancelVolunteerSignupState,
} from "@/app/lib/definitions";

export async function cancelVolunteerSignup(
  _prevState: CancelVolunteerSignupState,
  formData: FormData
): Promise<CancelVolunteerSignupState> {
  try {
    const session = await verifySession();

    const signupId = Number(formData.get("signupId"));
    if (!signupId) {
      return { message: "Invalid signup." };
    }

    const signup = await getDriverById(signupId);
    if (!signup) {
      return { message: "Signup not found." };
    }

    if (signup.participant_email.toLowerCase() !== session.email.toLowerCase()) {
      return { message: "You can only cancel your own signups." };
    }

    await deleteDriverVolunteer(signupId);

    revalidatePath("/volunteer");

    return { message: "Signup cancelled.", success: true };
  } catch (e) {
    console.error("cancelVolunteerSignup error:", e);
    return { message: "Failed to cancel signup. Please try again." };
  }
}

export async function updateVolunteerProfile(
  _prevState: VolunteerProfileFormState,
  formData: FormData
): Promise<VolunteerProfileFormState> {
  try {
    const session = await verifySession();
    const regions = formData.getAll("regions") as string[];

    const validated = VolunteerProfileSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      onSignal: formData.get("onSignal"),
      regions,
    });

    if (!validated.success) {
      return { errors: validated.error.flatten().fieldErrors };
    }

    const data = validated.data;

    const participant = await getParticipantByEmail(session.email);
    if (!participant) {
      return { message: "No volunteer profile found for your account." };
    }

    if (data.email.toLowerCase() !== session.email.toLowerCase()) {
      const existingUser = await getUserByEmail(data.email);
      if (existingUser && existingUser.id !== session.userId) {
        return { errors: { email: ["A user with this email already exists."] } };
      }
    }

    await updateParticipant(participant.id, {
      name: data.name,
      email: data.email,
      phone: data.phone,
      address1: participant.address1,
      address2: participant.address2 || undefined,
      city: participant.city,
      state: participant.state,
      zipCode: participant.zip_code,
      contactMethod: participant.contact_method,
      internalNotes: participant.internal_notes || undefined,
    });

    await updateVolunteerSignupContact(
      participant.id,
      data.onSignal,
      data.regions.join(", ")
    );

    const user = await getUserByEmail(session.email);
    if (user && data.email.toLowerCase() !== session.email.toLowerCase()) {
      await updateUserEmail(user.id, data.email);
      await createSession(user.id, data.email.toLowerCase(), user.role);
    }

    revalidatePath("/volunteer");

    return { message: "Profile updated successfully.", success: true };
  } catch (e) {
    console.error("updateVolunteerProfile error:", e);
    return { message: "Failed to update profile. Please try again." };
  }
}

export async function changeVolunteerPassword(
  _prevState: VolunteerPasswordFormState,
  formData: FormData
): Promise<VolunteerPasswordFormState> {
  try {
    const session = await verifySession();

    const validated = VolunteerPasswordSchema.safeParse({
      currentPassword: formData.get("currentPassword"),
      newPassword: formData.get("newPassword"),
      confirmPassword: formData.get("confirmPassword"),
    });

    if (!validated.success) {
      return { errors: validated.error.flatten().fieldErrors };
    }

    const { currentPassword, newPassword } = validated.data;

    const user = await getUserByEmail(session.email);
    if (!user?.password_hash) {
      return { message: "Account not found." };
    }

    const match = await bcrypt.compare(currentPassword, user.password_hash);
    if (!match) {
      return { errors: { currentPassword: ["Current password is incorrect."] } };
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(newPassword, salt);
    await updateUserPassword(user.id, passwordHash);

    revalidatePath("/volunteer");

    return { message: "Password updated successfully.", success: true };
  } catch (e) {
    console.error("changeVolunteerPassword error:", e);
    return { message: "Failed to change password. Please try again." };
  }
}

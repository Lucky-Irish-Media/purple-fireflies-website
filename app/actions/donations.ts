"use server";

import { revalidatePath } from "next/cache";
import { DonationPledgeSchema, DonationRequestSchema } from "@/app/lib/definitions";
import {
  getDonationRequest,
  getPledgedTotalByRequest,
  createDonationRequest,
  updateDonationRequest,
  deleteDonationRequest,
  createDonationSignupsTransactional,
  updateDonationSignup,
  cancelDonationSignup,
  getParticipantByEmail,
  createParticipant,
  updateParticipant,
  upsertParticipantProgram,
} from "@/app/lib/db";
import { checkRateLimit } from "@/app/lib/rate-limit";
import { sendDonationPledgeConfirmation, sendDonationCoordinatorNotification } from "@/app/lib/email";
import { verifySession } from "@/app/lib/dal";

export type DonationPledgeFormState =
  | { errors?: Record<string, string[]>; message?: string; success?: boolean }
  | undefined;

export async function submitDonationPledge(
  _state: DonationPledgeFormState,
  formData: FormData,
): Promise<DonationPledgeFormState> {
  try {
    const { allowed } = await checkRateLimit("pledge:donation");
    if (!allowed) {
      return { message: "Too many pledge attempts. Please try again in 15 minutes." };
    }

    const name = formData.get("name");
    const email = formData.get("email");
    const phone = formData.get("phone");
    const contactMethod = formData.get("contactMethod");
    const notes = formData.get("notes");

    const requestIds = formData.getAll("request_id");
    const quantities = formData.getAll("quantity");
    const lines = requestIds.map((rid, i) => ({
      request_id: Number(rid),
      quantity: Number(quantities[i]),
    }));

    const validated = DonationPledgeSchema.safeParse({
      name,
      email,
      phone,
      contactMethod: contactMethod || "email",
      notes: notes || undefined,
      lines,
    });

    if (!validated.success) {
      return { errors: validated.error.flatten().fieldErrors as Record<string, string[]> };
    }

    const data = validated.data;

    const requests = await Promise.all(data.lines.map((l) => getDonationRequest(l.request_id)));
    for (let i = 0; i < data.lines.length; i++) {
      const req = requests[i];
      if (!req) return { message: "One of the requested items was not found." };
      const pledged = await getPledgedTotalByRequest(req.id);
      // received_qty is walk-in/extras; remaining = requested - pledged - received.
      const remaining = req.requested_qty - pledged - (req.received_qty ?? 0);
      const effectiveRemaining = Math.max(0, remaining);
      if (data.lines[i].quantity > effectiveRemaining) {
        return { message: `Quantity for ${req.item_name} exceeds remaining (${effectiveRemaining}).` };
      }
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
      }, { actor: data.email, source: "donation_pledge_public" });
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
    await upsertParticipantProgram(participant.id, "donor");

    const pledgeLines: { item_name: string; quantity: number; unit: string }[] = [];
    try {
      await createDonationSignupsTransactional(
        data.lines.map((l, i) => ({
          request_id: requests[i]!.id,
          participant_id: participant.id,
          quantity_pledged: l.quantity,
          notes: data.notes ?? null,
        })),
      );
    } catch (e) {
      if (e instanceof Error && e.message === "CAPACITY_EXCEEDED") {
        return { message: "One or more items no longer have enough remaining quantity. Please refresh and try again." };
      }
      throw e;
    }
    for (let i = 0; i < data.lines.length; i++) {
      const req = requests[i]!;
      pledgeLines.push({ item_name: req.item_name, quantity: data.lines[i].quantity, unit: req.unit });
    }

    try {
      await sendDonationPledgeConfirmation({
        to: participant.email,
        name: participant.name,
        weekTitle: null,
        dropoffLocation: null,
        dropoffHours: null,
        lines: pledgeLines,
      });
    } catch (e) {
      console.error("donation confirmation email error:", e);
    }
    try {
      await sendDonationCoordinatorNotification({
        donorName: participant.name,
        donorEmail: participant.email,
        donorPhone: participant.phone,
        weekTitle: null,
        lines: pledgeLines,
      });
    } catch (e) {
      console.error("donation coordinator email error:", e);
    }

    revalidatePath("/programs/winter-food-drive");
    revalidatePath("/programs/winter-food-drive/donate");
    revalidatePath("/admin/programs/winter-food-drive");

    return { message: "success", success: true };
  } catch (e) {
    console.error("submitDonationPledge error:", e);
    return { message: "An unexpected error occurred. Please try again." };
  }
}

// ---- Admin actions ----

export async function createDonationRequestAction(formData: FormData): Promise<{ success: boolean; message: string }> {
  try {
    await verifySession();
    const parsed = DonationRequestSchema.safeParse({
      item_name: formData.get("item_name"),
      requested_qty: formData.get("requested_qty"),
      unit: formData.get("unit") || undefined,
      notes: formData.get("notes") || undefined,
    });
    if (!parsed.success) {
      return { success: false, message: "Invalid request data." };
    }
    const d = parsed.data;
    await createDonationRequest({
      item_name: d.item_name,
      requested_qty: d.requested_qty,
      unit: d.unit ?? "items",
      notes: d.notes ?? null,
    });
    revalidatePath("/admin/programs/winter-food-drive");
    revalidatePath("/programs/winter-food-drive");
    return { success: true, message: "Request added." };
  } catch (e) {
    console.error("createDonationRequestAction error:", e);
    return { success: false, message: "Failed to add request." };
  }
}

export async function updateDonationRequestAction(formData: FormData): Promise<{ success: boolean; message: string }> {
  try {
    await verifySession();
    const id = Number(formData.get("id"));
    if (!id) return { success: false, message: "Missing request id." };
    await updateDonationRequest(id, {
      item_name: formData.get("item_name") ? String(formData.get("item_name")) : undefined,
      requested_qty: formData.get("requested_qty") ? Number(formData.get("requested_qty")) : undefined,
      unit: formData.get("unit") ? String(formData.get("unit")) : undefined,
      notes: formData.get("notes") ? String(formData.get("notes")) : null,
      received_qty: formData.has("received_qty") ? Number(formData.get("received_qty")) : undefined,
    });
    revalidatePath("/admin/programs/winter-food-drive");
    revalidatePath("/programs/winter-food-drive");
    return { success: true, message: "Request updated." };
  } catch (e) {
    console.error("updateDonationRequestAction error:", e);
    return { success: false, message: "Failed to update request." };
  }
}

export async function deleteDonationRequestAction(formData: FormData): Promise<{ success: boolean; message: string }> {
  try {
    await verifySession();
    const id = Number(formData.get("id"));
    if (!id) return { success: false, message: "Missing request id." };
    await deleteDonationRequest(id);
    revalidatePath("/admin/programs/winter-food-drive");
    revalidatePath("/programs/winter-food-drive");
    return { success: true, message: "Request deleted." };
  } catch (e) {
    console.error("deleteDonationRequestAction error:", e);
    return { success: false, message: "Failed to delete request." };
  }
}

export async function updateDonationReceivedAction(formData: FormData): Promise<{ success: boolean; message: string }> {
  try {
    await verifySession();
    const id = Number(formData.get("id"));
    const received = Number(formData.get("received_qty"));
    if (!id) return { success: false, message: "Missing request id." };
    await updateDonationRequest(id, { received_qty: received });
    revalidatePath("/admin/programs/winter-food-drive");
    revalidatePath("/programs/winter-food-drive");
    return { success: true, message: "Pickup quantity updated." };
  } catch (e) {
    console.error("updateDonationReceivedAction error:", e);
    return { success: false, message: "Failed to update pickup quantity." };
  }
}

export async function updateDonationSignupAction(formData: FormData): Promise<{ success: boolean; message: string }> {
  try {
    await verifySession();
    const id = Number(formData.get("id"));
    if (!id) return { success: false, message: "Missing signup id." };
    const qty = formData.get("quantity_pledged");
    await updateDonationSignup(id, {
      quantity_pledged: qty ? Number(qty) : undefined,
      status: (formData.get("status") as "active" | "cancelled") || undefined,
      notes: formData.get("notes") ? String(formData.get("notes")) : null,
    });
    revalidatePath("/admin/programs/winter-food-drive");
    revalidatePath("/programs/winter-food-drive");
    return { success: true, message: "Signup updated." };
  } catch (e) {
    console.error("updateDonationSignupAction error:", e);
    return { success: false, message: "Failed to update signup." };
  }
}

export async function cancelDonationSignupAction(formData: FormData): Promise<{ success: boolean; message: string }> {
  try {
    await verifySession();
    const id = Number(formData.get("id"));
    if (!id) return { success: false, message: "Missing signup id." };
    await cancelDonationSignup(id);
    revalidatePath("/admin/programs/winter-food-drive");
    revalidatePath("/programs/winter-food-drive");
    return { success: true, message: "Signup cancelled." };
  } catch (e) {
    console.error("cancelDonationSignupAction error:", e);
    return { success: false, message: "Failed to cancel signup." };
  }
}
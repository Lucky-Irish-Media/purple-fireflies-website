"use server";

import { revalidatePath } from "next/cache";
import { DonationPledgeSchema, DonationWeekSchema, DonationRequestSchema } from "@/app/lib/definitions";
import {
  getDonationWeek,
  getDonationRequest,
  getDonationRequests,
  getPledgedTotalByRequest,
  createDonationWeek,
  updateDonationWeek,
  deleteDonationWeek,
  createDonationRequest,
  updateDonationRequest,
  deleteDonationRequest,
  createDonationSignup,
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

    // Server-side remaining validation
    const requests = await Promise.all(data.lines.map((l) => getDonationRequest(l.request_id)));
    for (let i = 0; i < data.lines.length; i++) {
      const req = requests[i];
      if (!req) return { message: "One of the requested items was not found." };
      const week = await getDonationWeek(req.week_id);
      if (!week || week.status !== "open") {
        return { message: "This donation week is closed." };
      }
      const pledged = await getPledgedTotalByRequest(req.id);
      const remaining = req.requested_qty - pledged;
      if (data.lines[i].quantity > remaining && remaining >= 0) {
        return { message: `Quantity for ${req.item_name} exceeds remaining (${remaining}).` };
      }
    }

    // Participant upsert
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
      });
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

    const week = await getDonationWeek(requests[0]!.week_id);

    const pledgeLines: { item_name: string; quantity: number; unit: string }[] = [];
    for (let i = 0; i < data.lines.length; i++) {
      const req = requests[i]!;
      await createDonationSignup({
        request_id: req.id,
        participant_id: participant.id,
        quantity_pledged: data.lines[i].quantity,
        notes: data.notes ?? null,
      });
      pledgeLines.push({ item_name: req.item_name, quantity: data.lines[i].quantity, unit: req.unit });
    }

    // Emails
    try {
      await sendDonationPledgeConfirmation({
        to: participant.email,
        name: participant.name,
        weekTitle: week?.title ?? null,
        dropoffLocation: week?.dropoff_location ?? null,
        dropoffHours: week?.dropoff_hours ?? null,
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
        weekTitle: week?.title ?? null,
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

export async function createDonationWeekAction(formData: FormData): Promise<{ success: boolean; message: string }> {
  try {
    await verifySession();
    const weekStartDate = String(formData.get("week_start_date") || "").trim();
    if (!weekStartDate) return { success: false, message: "Week start date is required." };

    const week = await createDonationWeek({
      week_start_date: weekStartDate,
      title: null,
      notes: null,
      status: "open",
      dropoff_location: null,
      dropoff_hours: null,
    });

    const itemName = String(formData.get("item_name") || "").trim();
    const requestedQty = Number(formData.get("requested_qty"));
    const unit = String(formData.get("unit") || "items").trim() || "items";
    const notes = formData.get("notes") ? String(formData.get("notes")) : null;
    if (itemName && requestedQty >= 1) {
      await createDonationRequest({
        week_id: week.id,
        item_name: itemName,
        requested_qty: requestedQty,
        unit,
        notes,
      });
    }

    revalidatePath("/admin/programs/winter-food-drive");
    revalidatePath("/programs/winter-food-drive");
    return { success: true, message: "Week created." };
  } catch (e) {
    console.error("createDonationWeekAction error:", e);
    return { success: false, message: "Failed to create week." };
  }
}

export async function updateDonationWeekAction(formData: FormData): Promise<{ success: boolean; message: string }> {
  try {
    await verifySession();
    const id = Number(formData.get("id"));
    if (!id) return { success: false, message: "Missing week id." };
    await updateDonationWeek(id, {
      week_start_date: (formData.get("week_start_date") as string) || undefined,
      title: formData.get("title") ? String(formData.get("title")) : null,
      notes: formData.get("notes") ? String(formData.get("notes")) : null,
      status: (formData.get("status") as "open" | "closed") || undefined,
      dropoff_location: formData.get("dropoff_location") ? String(formData.get("dropoff_location")) : null,
      dropoff_hours: formData.get("dropoff_hours") ? String(formData.get("dropoff_hours")) : null,
    });
    revalidatePath("/admin/programs/winter-food-drive");
    revalidatePath("/programs/winter-food-drive");
    return { success: true, message: "Week updated." };
  } catch (e) {
    console.error("updateDonationWeekAction error:", e);
    return { success: false, message: "Failed to update week." };
  }
}

export async function toggleDonationWeekStatusAction(formData: FormData): Promise<{ success: boolean; message: string }> {
  try {
    await verifySession();
    const id = Number(formData.get("id"));
    const status = formData.get("status") as "open" | "closed";
    if (!id) return { success: false, message: "Missing week id." };
    await updateDonationWeek(id, { status });
    revalidatePath("/admin/programs/winter-food-drive");
    revalidatePath("/programs/winter-food-drive");
    return { success: true, message: "Week status updated." };
  } catch (e) {
    console.error("toggleDonationWeekStatusAction error:", e);
    return { success: false, message: "Failed to update week status." };
  }
}

export async function deleteDonationWeekAction(formData: FormData): Promise<{ success: boolean; message: string }> {
  try {
    await verifySession();
    const id = Number(formData.get("id"));
    if (!id) return { success: false, message: "Missing week id." };
    await deleteDonationWeek(id);
    revalidatePath("/admin/programs/winter-food-drive");
    revalidatePath("/programs/winter-food-drive");
    return { success: true, message: "Week deleted." };
  } catch (e) {
    console.error("deleteDonationWeekAction error:", e);
    return { success: false, message: "Failed to delete week." };
  }
}

export async function createDonationRequestAction(formData: FormData): Promise<{ success: boolean; message: string }> {
  try {
    await verifySession();
    const parsed = DonationRequestSchema.safeParse({
      week_id: formData.get("week_id"),
      item_name: formData.get("item_name"),
      requested_qty: formData.get("requested_qty"),
      unit: formData.get("unit") || undefined,
      notes: formData.get("notes") || undefined,
    });
    if (!parsed.success) return { success: false, message: "Invalid request data." };
    const d = parsed.data;
    await createDonationRequest({
      week_id: d.week_id,
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
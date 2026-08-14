"use server";

import { revalidatePath } from "next/cache";
import { verifySession } from "@/app/lib/dal";
import { closeDeliveryDate, reopenDeliveryDate, isDeliveryDateClosed } from "@/app/lib/db";

function isValidDate(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const d = new Date(dateStr + "T00:00:00");
  return !isNaN(d.getTime()) && d.toISOString().split("T")[0] === dateStr;
}

export async function setDeliveryDateClosedAction(formData: FormData): Promise<{ success: boolean; message: string }> {
  try {
    await verifySession();

    const deliveryDate = formData.get("deliveryDate") as string;
    const closed = formData.get("closed") === "true";

    if (!isValidDate(deliveryDate)) {
      return { success: false, message: "Invalid delivery date." };
    }

    if (closed) {
      if (await isDeliveryDateClosed(deliveryDate)) {
        return { success: false, message: `${deliveryDate} is already closed.` };
      }
      await closeDeliveryDate(deliveryDate);
    } else {
      await reopenDeliveryDate(deliveryDate);
    }

    revalidatePath("/admin/programs/meal-delivery");

    return {
      success: true,
      message: closed ? `${deliveryDate} closed to new signups.` : `${deliveryDate} reopened.`,
    };
  } catch (e) {
    console.error("setDeliveryDateClosed action error:", e);
    return { success: false, message: "Failed to update delivery date. Please try again." };
  }
}

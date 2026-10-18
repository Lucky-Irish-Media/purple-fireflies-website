"use server";

import { headers } from "next/headers";

import bcrypt from "bcryptjs";
import { DriverVolunteerSchema, type DriverVolunteerFormState } from "@/app/lib/definitions";
import { createDriverVolunteer, getParticipantByEmail, createParticipant, updateParticipant, getDriverVolunteersByEmailOrPhone, getUserByEmail, createUser, createWaiverSignature, getWaiverSignatureByParticipantId, updateDriverParticipantStatus } from "@/app/lib/db";
import { checkRateLimit } from "@/app/lib/rate-limit";
import { generateRandomPassword } from "@/app/lib/password";
import { sendVolunteerAccountEmail } from "@/app/lib/email";
import { isStandardDeliveryDay } from "@/app/lib/delivery-day";
import { WAIVER_VERSION } from "@/app/lib/waiver";

function getErrorMessage(): string {
  return "An unexpected error occurred. Please try again.";
}

export async function submitDriverVolunteer(
  _state: DriverVolunteerFormState,
  formData: FormData
): Promise<DriverVolunteerFormState> {
  try {
    const { allowed } = await checkRateLimit("signup:driver");
    if (!allowed) {
      return { message: "Too many signup attempts. Please try again in 15 minutes." };
    }

    const deliveryDates = formData.getAll("deliveryDates") as string[];
    const regions = formData.getAll("regions") as string[];

    const validatedFields = DriverVolunteerSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      onSignal: formData.get("onSignal"),
      deliveryDates,
      regions,
    });

    if (!validatedFields.success) {
      return { errors: validatedFields.error.flatten().fieldErrors };
    }

    const data = validatedFields.data;

    const nonStandardDates = data.deliveryDates.filter((d) => !isStandardDeliveryDay(d));
    if (nonStandardDates.length > 0) {
      return { message: "Driver volunteer signups are only available on Wednesdays and Thursdays." };
    }

    let participant = await getParticipantByEmail(data.email);
    if (participant) {
      participant = await updateParticipant(participant.id, {
        name: data.name,
        email: data.email,
        phone: data.phone,
        address1: "",
        city: "",
        state: "OH",
        zipCode: "",
        contactMethod: "call",
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
        contactMethod: "call",
      });
    }

    let hasSigned = participant.driver_liability === 1;
    if (!hasSigned) {
      const existingSig = await getWaiverSignatureByParticipantId(participant.id);
      if (existingSig) {
        hasSigned = true;
      }
    }

    if (!hasSigned) {
      const signature = data.signature?.trim();
      if (!signature) {
        return { errors: { signature: ["Signature is required."] } };
      }
      if (data.waiverAcknowledged !== true) {
        return { errors: { waiverAcknowledged: ["You must acknowledge the waiver terms."] } };
      }
      const emergencyPhone = data.emergencyContactPhone?.trim();
      if (emergencyPhone && emergencyPhone !== "") {
        const phoneTest = /^(\+1[-\s.]?)?\(?\d{3}\)?[-\s.]?\d{3}[-\s.]?\d{4}$/;
        if (!phoneTest.test(emergencyPhone)) {
          return { errors: { emergencyContactPhone: ["Please enter a valid phone number."] } };
        }
      }
      const hdrs = await headers();
      const ipAddress = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() || hdrs.get("x-real-ip") || null;
      const userAgent = hdrs.get("user-agent") || null;
      await createWaiverSignature({
        participantId: participant.id,
        signerName: data.name,
        email: data.email,
        ipAddress,
        userAgent,
        waiverVersion: WAIVER_VERSION,
        driverLicenseNumber: data.driverLicenseNumber?.trim() || null,
        licenseState: data.licenseState?.trim() || null,
        vehicle: data.vehicle?.trim() || null,
        licensePlate: data.licensePlate?.trim() || null,
        emergencyContactName: data.emergencyContactName?.trim() || null,
        emergencyContactPhone: emergencyPhone || null,
      });
      await updateDriverParticipantStatus(participant.id, { driver_liability: 1 });
      hasSigned = true;
    }

    const existingVolunteers = await getDriverVolunteersByEmailOrPhone(data.email, data.phone);
    const existingDates = new Set(
      existingVolunteers.map((v) => v.delivery_date)
    );

    const newDates = data.deliveryDates.filter((d) => !existingDates.has(d));
    const duplicateDates = data.deliveryDates.filter((d) => existingDates.has(d));

    const signups = [];
    for (const deliveryDate of newDates) {
      const signup = await createDriverVolunteer({
        participantId: participant.id,
        onSignal: data.onSignal,
        regions: data.regions.join(", "),
        deliveryDate,
      });
      signups.push(signup);
    }

    let accountCreated = false;
    const existingUser = await getUserByEmail(data.email);
    if (!existingUser) {
      const tempPassword = generateRandomPassword();
      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(tempPassword, salt);
      await createUser({
        email: data.email,
        name: data.name,
        passwordHash,
        role: "volunteer",
        status: "pending",
      });
      await sendVolunteerAccountEmail(data.email, data.name, tempPassword);
      accountCreated = true;
    }

    let message = "success";
    let selectedDates = newDates
      .map((d) => new Date(d).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" }))
      .join(", ");

    if (duplicateDates.length > 0) {
      const dupFormatted = duplicateDates
        .map((d) => new Date(d).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" }))
        .join(", ");
      if (newDates.length > 0) {
        message = `Added: ${selectedDates}. Already signed up: ${dupFormatted}.`;
      } else {
        message = `You were already signed up for: ${dupFormatted}.`;
      }
      selectedDates = data.deliveryDates
        .map((d) => new Date(d).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" }))
        .join(", ");
    }

    return { message, selectedDates, accountCreated };
  } catch (e) {
    console.error("driver volunteer action error:", e);
    return { message: getErrorMessage() };
  }
}

export async function checkDriverWaiverStatus(email: string): Promise<{ signed: boolean }> {
  try {
    // Deliberately not rate-limited. This is a read-only lookup that decides whether the
    // waiver section is shown, so a throttled "not signed" answer would ask a Signed driver
    // to sign again. It also must not share the `signup:driver` budget: checks on email blur
    // used to consume the same 5-attempts-per-15-minutes global counter as submissions, so a
    // few visitors could both show the waiver to Signed drivers and block signups entirely.
    // The mutation path (submitDriverVolunteer) stays rate-limited.
    const participant = await getParticipantByEmail(email);
    if (!participant) {
      return { signed: false };
    }
    if (participant.driver_liability === 1) {
      return { signed: true };
    }
    const sig = await getWaiverSignatureByParticipantId(participant.id);
    if (sig) {
      return { signed: true };
    }
    return { signed: false };
  } catch (e) {
    console.error("checkDriverWaiverStatus error:", e);
    return { signed: false };
  }
}

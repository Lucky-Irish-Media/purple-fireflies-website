"use server";

import { getMealSignupsByEmail, getDriverVolunteersByEmail, getDonationSignupsByEmail, getVolunteerSignupsByEmail } from "@/app/lib/db";

export async function getMyMealSignups(email: string) {
  try {
    const signups = await getMealSignupsByEmail(email);
    return { signups, error: null };
  } catch (e) {
    console.error("lookup meal signups error:", e);
    return { signups: [], error: "Failed to look up signups. Please try again." };
  }
}

export async function getMyDriverVolunteerSignups(email: string) {
  try {
    const signups = await getDriverVolunteersByEmail(email);
    return { signups, error: null };
  } catch (e) {
    console.error("lookup driver volunteer signups error:", e);
    return { signups: [], error: "Failed to look up signups. Please try again." };
  }
}

export async function getMyDonationSignups(email: string) {
  try {
    const signups = await getDonationSignupsByEmail(email);
    return { signups, error: null };
  } catch (e) {
    console.error("lookup donation signups error:", e);
    return { signups: [], error: "Failed to look up signups. Please try again." };
  }
}
export async function getMyVolunteerMealSignups(email: string) {
  try {
    const signups = await getVolunteerSignupsByEmail(email);
    return { signups, error: null };
  } catch (e) {
    console.error("lookup volunteer meal signups error:", e);
    return { signups: [], error: "Failed to look up signups. Please try again." };
  }
}

"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { LoginFormSchema, type LoginFormState } from "@/app/lib/definitions";
import { createSession, deleteSession } from "@/app/lib/session";
import { getUserByEmail } from "@/app/lib/db";

function getErrorMessage(e: unknown): string {
  if (e instanceof Error) {
    if (e.message.includes("SESSION_SECRET")) {
      return "Server configuration error: SESSION_SECRET is not set. Please check your environment variables.";
    }
    if (e.message.includes("D1") || e.message.includes("database") || e.message.includes("getCloudflareContext")) {
      return "Database connection error. Please try again later.";
    }
    if (e.message.includes("bcrypt")) {
      return "Authentication error. Please try again.";
    }
    return e.message;
  }
  return "An unexpected error occurred. Please try again.";
}

export async function login(
  _state: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  try {
    const validatedFields = LoginFormSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    if (!validatedFields.success) {
      return { errors: validatedFields.error.flatten().fieldErrors };
    }

    const { email, password } = validatedFields.data;

    const user = await getUserByEmail(email);
    if (!user || !user.password_hash) {
      return { message: "Invalid email or password." };
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return { message: "Invalid email or password." };
    }

    await createSession(user.id, user.email, user.role);
  } catch (e) {
    console.error("login action error:", e);
    return { message: getErrorMessage(e) };
  }

  redirect("/admin");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}

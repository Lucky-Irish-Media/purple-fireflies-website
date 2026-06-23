"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { LoginFormSchema, type LoginFormState } from "@/app/lib/definitions";
import { createSession, deleteSession } from "@/app/lib/session";
import { getAdminByEmail } from "@/app/lib/db";

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

    const admin = await getAdminByEmail(email);
    if (!admin) {
      return { message: "Invalid email or password." };
    }

    const passwordMatch = await bcrypt.compare(password, admin.password_hash);
    if (!passwordMatch) {
      return { message: "Invalid email or password." };
    }

    await createSession(admin.id, admin.email, admin.role);
  } catch (e) {
    console.error("login action error:", e);
    return { message: "An unexpected error occurred. Please try again." };
  }

  redirect("/admin");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}

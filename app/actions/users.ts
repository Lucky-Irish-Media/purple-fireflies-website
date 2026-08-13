"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { verifySession } from "@/app/lib/dal";
import { createUser, deleteUserRecord, getUserByEmail, getUserById, updateUserPassword, updateUserRecord, updateUserStatus, getUsers, type User } from "@/app/lib/db";
import { generateRandomPassword } from "@/app/lib/password";
import { sendInviteEmail } from "@/app/lib/email";

const CreateUserSchema = z.object({
  name: z.string().min(1, "Name is required.").trim(),
  email: z.string().email("Please enter a valid email.").trim(),
  role: z.enum(["admin", "member", "volunteer"], "Please select a role."),
});

export type UsersActionState = {
  errors?: Record<string, string[]>;
  message?: string;
  generatedPassword?: string;
  users?: User[];
} | undefined;

const UpdateUserSchema = z.object({
  id: z.coerce.number(),
  name: z.string().min(1, "Name is required.").trim(),
  email: z.string().email("Please enter a valid email.").trim(),
  role: z.enum(["admin", "member", "volunteer"], "Please select a role."),
});

export async function updateUserAction(
  _prevState: UsersActionState,
  formData: FormData,
): Promise<UsersActionState> {
  try {
    const session = await verifySession();
    if (session.role !== "admin") {
      return { message: "Unauthorized. Only admins can manage users." };
    }

    const validated = UpdateUserSchema.safeParse({
      id: formData.get("id"),
      name: formData.get("name"),
      email: formData.get("email"),
      role: formData.get("role"),
    });

    if (!validated.success) {
      return { errors: validated.error.flatten().fieldErrors };
    }

    const { id, name, email, role } = validated.data;

    await updateUserRecord(id, { name, email, role });

    const users = await getUsers();

    revalidatePath("/admin/users");

    return { message: `User "${name}" updated successfully.`, users };
  } catch (e) {
    console.error("updateUser action error:", e);
    return { message: "Failed to update user." };
  }
}

export async function createUserAction(
  _prevState: UsersActionState,
  formData: FormData,
): Promise<UsersActionState> {
  try {
    const session = await verifySession();
    if (session.role !== "admin") {
      return { message: "Unauthorized. Only admins can manage users." };
    }

    const validated = CreateUserSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      role: formData.get("role"),
    });

    if (!validated.success) {
      return { errors: validated.error.flatten().fieldErrors };
    }

    const { name, email, role } = validated.data;

    const existing = await getUserByEmail(email);
    if (existing) {
      return { errors: { email: ["A user with this email already exists."] } };
    }

    const plainPassword = generateRandomPassword();
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(plainPassword, salt);

    await createUser({ email, name, passwordHash, role });

    const users = await getUsers();

    revalidatePath("/admin/users");

    return {
      message: `User "${name}" created successfully.`,
      generatedPassword: plainPassword,
      users,
    };
  } catch (e) {
    console.error("createUser action error:", e);
    return { message: "Failed to create user." };
  }
}

export async function approveUserAction(
  _prevState: UsersActionState,
  formData: FormData,
): Promise<UsersActionState> {
  try {
    const session = await verifySession();
    if (session.role !== "admin") {
      return { message: "Unauthorized. Only admins can manage users." };
    }

    const userId = Number(formData.get("userId"));
    if (!userId) {
      return { message: "Invalid user ID." };
    }

    await updateUserStatus(userId, "active");

    const users = await getUsers();

    revalidatePath("/admin/users");

    return { message: "User approved successfully.", users };
  } catch (e) {
    console.error("approveUser action error:", e);
    return { message: "Failed to approve user." };
  }
}

export async function resetPasswordAction(
  _prevState: UsersActionState,
  formData: FormData,
): Promise<UsersActionState> {
  try {
    const session = await verifySession();
    if (session.role !== "admin") {
      return { message: "Unauthorized. Only admins can manage users." };
    }

    const userId = Number(formData.get("userId"));
    if (!userId) {
      return { message: "Invalid user ID." };
    }

    const plainPassword = generateRandomPassword();
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(plainPassword, salt);

    await updateUserPassword(userId, passwordHash);

    revalidatePath("/admin/users");

    return {
      message: "Password reset successfully.",
      generatedPassword: plainPassword,
    };
  } catch (e) {
    console.error("resetPassword action error:", e);
    return { message: "Failed to reset password." };
  }
}

export async function resendInviteAction(
  _prevState: UsersActionState,
  formData: FormData,
): Promise<UsersActionState> {
  try {
    const session = await verifySession();
    if (session.role !== "admin") {
      return { message: "Unauthorized. Only admins can manage users." };
    }

    const userId = Number(formData.get("userId"));
    if (!userId) {
      return { message: "Invalid user ID." };
    }

    const user = await getUserById(userId);
    if (!user) {
      return { message: "User not found." };
    }

    const plainPassword = generateRandomPassword();
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(plainPassword, salt);

    await updateUserPassword(userId, passwordHash);

    let message = `Invite re-sent to "${user.name}".`;
    try {
      await sendInviteEmail(user.email, user.name, plainPassword, user.status);
    } catch (e) {
      console.error("resendInvite email error:", e);
      message = `Invite email failed to send to "${user.name}". Share the password below manually.`;
    }

    revalidatePath("/admin/users");

    return { message, generatedPassword: plainPassword };
  } catch (e) {
    console.error("resendInvite action error:", e);
    return { message: "Failed to resend invite." };
  }
}

export async function deleteUserAction(
  _prevState: UsersActionState,
  formData: FormData,
): Promise<UsersActionState> {
  try {
    const session = await verifySession();
    if (session.role !== "admin") {
      return { message: "Unauthorized. Only admins can manage users." };
    }

    const userId = Number(formData.get("userId"));
    if (!userId) {
      return { message: "Invalid user ID." };
    }

    await deleteUserRecord(userId);

    const users = await getUsers();

    revalidatePath("/admin/users");

    return { message: "User deleted successfully.", users };
  } catch (e) {
    console.error("deleteUser action error:", e);
    return { message: "Failed to delete user." };
  }
}

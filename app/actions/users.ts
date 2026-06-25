"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { createUser, deleteUserRecord, getUserByEmail, updateUserPassword, updateUserRecord, getUsers, type User } from "@/app/lib/db";

const CreateUserSchema = z.object({
  name: z.string().min(1, "Name is required.").trim(),
  email: z.string().email("Please enter a valid email.").trim(),
  role: z.enum(["admin", "member"], "Please select a role."),
});

export type UsersActionState = {
  errors?: Record<string, string[]>;
  message?: string;
  generatedPassword?: string;
  users?: User[];
} | undefined;

function generateRandomPassword(): string {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const digits = "0123456789";
  const special = "!@#$%^&*()_+-=";
  const all = uppercase + lowercase + digits + special;

  const array = new Uint8Array(20);
  crypto.getRandomValues(array);

  const password: string[] = [];
  password.push(uppercase[array[0] % uppercase.length]);
  password.push(lowercase[array[1] % lowercase.length]);
  password.push(digits[array[2] % digits.length]);
  password.push(special[array[3] % special.length]);

  for (let i = 4; i < 20; i++) {
    password.push(all[array[i] % all.length]);
  }

  for (let i = password.length - 1; i > 0; i--) {
    const j = array[i] % (i + 1);
    [password[i], password[j]] = [password[j], password[i]];
  }

  return password.join("");
}

const UpdateUserSchema = z.object({
  id: z.coerce.number(),
  name: z.string().min(1, "Name is required.").trim(),
  email: z.string().email("Please enter a valid email.").trim(),
  role: z.enum(["admin", "member"], "Please select a role."),
});

export async function updateUserAction(
  _prevState: UsersActionState,
  formData: FormData,
): Promise<UsersActionState> {
  try {
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

export async function resetPasswordAction(
  _prevState: UsersActionState,
  formData: FormData,
): Promise<UsersActionState> {
  try {
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

export async function deleteUserAction(
  _prevState: UsersActionState,
  formData: FormData,
): Promise<UsersActionState> {
  try {
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

"use client";

import { useActionState } from "react";
import { changeVolunteerPassword } from "@/app/actions/volunteer";
import type { VolunteerPasswordFormState } from "@/app/lib/definitions";

export function PasswordForm() {
  const [state, action, pending] = useActionState(
    changeVolunteerPassword,
    undefined as VolunteerPasswordFormState
  );

  return (
    <form action={action} className="space-y-4 rounded-lg border border-primary/10 bg-card p-6 max-w-md">
      <div>
        <label htmlFor="currentPassword" className="block text-sm font-medium text-foreground mb-1">
          Current Password
        </label>
        <input
          id="currentPassword"
          name="currentPassword"
          type="password"
          required
          autoComplete="current-password"
          className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {state?.errors?.currentPassword && (
          <p className="mt-1 text-sm text-red-500">{state.errors.currentPassword[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="newPassword" className="block text-sm font-medium text-foreground mb-1">
          New Password
        </label>
        <input
          id="newPassword"
          name="newPassword"
          type="password"
          required
          autoComplete="new-password"
          className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {state?.errors?.newPassword && (
          <p className="mt-1 text-sm text-red-500">{state.errors.newPassword[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-1">
          Confirm New Password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          autoComplete="new-password"
          className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {state?.errors?.confirmPassword && (
          <p className="mt-1 text-sm text-red-500">{state.errors.confirmPassword[0]}</p>
        )}
      </div>

      {state?.message && (
        <p
          className={`text-sm ${state.success ? "text-green-600" : "text-red-500"}`}
          role={state.success ? "status" : "alert"}
        >
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        {pending ? "Updating..." : "Change Password"}
      </button>
    </form>
  );
}

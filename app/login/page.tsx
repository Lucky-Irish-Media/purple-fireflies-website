"use client";

import { useActionState } from "react";
import { login } from "@/app/actions/auth";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-xl border border-primary/10 bg-card p-8 shadow-sm">
        <h1 className="mb-6 text-2xl font-bold text-foreground text-center">
          Admin Login
        </h1>

        <form action={action} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-foreground mb-1"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              className="w-full rounded-lg border border-primary/20 bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            {state?.errors?.email && (
              <p className="mt-1 text-xs text-red-600">{state.errors.email[0]}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-foreground mb-1"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              className="w-full rounded-lg border border-primary/20 bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            {state?.errors?.password && (
              <p className="mt-1 text-xs text-red-600">
                {state.errors.password[0]}
              </p>
            )}
          </div>

          {state?.message && (
            <p className="text-sm text-red-600 text-center">{state.message}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white transition-all duration-200 hover:bg-primary-dark disabled:opacity-50"
          >
            {pending ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useActionState } from "react";
import { subscribeNewsletterAction, type SubscribeState } from "@/app/actions/newsletter";

export default function NewsletterSubscribeForm() {
  const [state, action, pending] = useActionState<SubscribeState, FormData>(
    async (prev, formData) => subscribeNewsletterAction(prev, formData),
    undefined,
  );

  return (
    <form action={action} className="flex flex-col sm:flex-row gap-2 w-full">
      <input
        type="text"
        name="name"
        placeholder="Your name (optional)"
        className="flex-1 rounded-lg border border-white/30 bg-white/10 px-3 py-2 text-sm text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
      />
      <input
        type="email"
        name="email"
        required
        placeholder="Your email"
        className="flex-1 rounded-lg border border-white/30 bg-white/10 px-3 py-2 text-sm text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-bold text-purple-900 transition-all hover:bg-amber-300 disabled:opacity-50"
      >
        {pending ? "Subscribing..." : "Subscribe"}
      </button>
      {state?.message && (
        <p className="text-sm text-white/90 sm:col-span-3">{state.message}</p>
      )}
      {state?.error && (
        <p className="text-sm text-red-200 sm:col-span-3">{state.error}</p>
      )}
    </form>
  );
}
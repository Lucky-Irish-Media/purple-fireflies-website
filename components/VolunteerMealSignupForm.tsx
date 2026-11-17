"use client";

import { useActionState, useState } from "react";
import { submitVolunteerSignup } from "@/app/actions/volunteer-meals";
import type { VolunteerSignupFormState } from "@/app/lib/definitions";
import { LookupModal } from "@/components/LookupModal";

type DaySlot = { day: { id: number; date: string; title: string | null; notes: string | null; status: string }; slots: Record<string, number> };

const ROLES = ["cooking", "cleaning", "packing"] as const;

export default function VolunteerMealSignupForm({ days }: { days: DaySlot[] }) {
  const [state, action, pending] = useActionState(
    submitVolunteerSignup,
    undefined as VolunteerSignupFormState
  );

  const [selectedDay, setSelectedDay] = useState<string>(days[0]?.day.id ? String(days[0].day.id) : "");
  const [selectedRole, setSelectedRole] = useState<string>("cooking");
  const [isGroup, setIsGroup] = useState(false);
  const [showLookup, setShowLookup] = useState(false);

  if (state?.success) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="rounded-lg bg-green-50 p-4 text-green-600" role="status">
          Thank you for volunteering! Your kitchen volunteer signup has been submitted. Check your email for confirmation.
        </div>
      </div>
    );
  }

  const dayObj = days.find((d) => String(d.day.id) === selectedDay);
  const remaining = dayObj ? Math.max(0, 5 - (dayObj.slots[selectedRole] || 0)) : 0;

  const inputClass = (field: string) =>
    `w-full rounded-lg border bg-background px-4 py-3 text-foreground placeholder:text-text-secondary ${
      state?.errors?.[field] ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-input focus:border-primary focus:ring-primary"
    }`;

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="mb-6 text-3xl font-bold text-foreground">Kitchen Volunteer Signup</h2>
      <p className="mb-8 text-lg text-text-secondary">
        Sign up to cook, clean, or pack for the Winter Food Drive. Five slots per role per date. Sign up as an
        individual or as a sponsor group.
      </p>

      <p className="mb-8">
        <button type="button" onClick={() => setShowLookup(true)} className="text-sm font-medium text-primary hover:underline">
          Look up my existing volunteer signups →
        </button>
      </p>

      <p className="mb-8">
        <a href="/login" className="text-sm font-medium text-primary hover:underline">
          Already have an account? Sign in to manage your signups →
        </a>
      </p>

      <form action={action} className="space-y-6" noValidate>
        {state?.message && !state?.success && (
          <div className="rounded-lg bg-red-50 p-4 text-red-600" role="alert">
            {state.message}
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="dayId" className="block text-sm font-medium text-foreground">
            Volunteer day <span className="text-red-500">*</span>
          </label>
          <select
            id="dayId"
            name="dayId"
            required
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
            className={inputClass("dayId")}
            aria-invalid={state?.errors?.dayId ? "true" : "false"}
            aria-describedby={state?.errors?.dayId ? "dayId-error" : undefined}
          >
            {days.map(({ day }) => (
              <option key={day.id} value={day.id}>
                {new Date(day.date + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" })}
                {day.title ? ` — ${day.title}` : ""}
              </option>
            ))}
          </select>
          {state?.errors?.dayId && (
            <p id="dayId-error" className="text-sm text-red-500" role="alert">
              {state.errors.dayId[0]}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="role" className="block text-sm font-medium text-foreground">
            Role <span className="text-red-500">*</span>
          </label>
          <select
            id="role"
            name="role"
            required
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className={inputClass("role")}
            aria-invalid={state?.errors?.role ? "true" : "false"}
            aria-describedby={state?.errors?.role ? "role-error" : undefined}
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r.charAt(0).toUpperCase() + r.slice(1)} ({Math.max(0, 5 - (dayObj?.slots[r] || 0))} left)
              </option>
            ))}
          </select>
          {state?.errors?.role && (
            <p id="role-error" className="text-sm text-red-500" role="alert">
              {state.errors.role[0]}
            </p>
          )}
        </div>

        <fieldset className="space-y-2">
          <legend className="block text-sm font-medium text-foreground">Signup type</legend>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isGroup}
              onChange={(e) => setIsGroup(e.target.checked)}
              className="h-4 w-4 text-primary border-input focus:ring-primary rounded"
            />
            <span className="text-foreground">Signing up as a sponsor group</span>
          </label>
          <input type="hidden" name="isGroup" value={isGroup ? "true" : "false"} />
        </fieldset>

        {isGroup && (
          <div className="space-y-2">
            <label htmlFor="groupName" className="block text-sm font-medium text-foreground">
              Group name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="groupName"
              name="groupName"
              required={isGroup}
              className={inputClass("groupName")}
              aria-invalid={state?.errors?.groupName ? "true" : "false"}
              aria-describedby={state?.errors?.groupName ? "groupName-error" : undefined}
            />
            {state?.errors?.groupName && (
              <p id="groupName-error" className="text-sm text-red-500" role="alert">
                {state.errors.groupName[0]}
              </p>
            )}
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="headcount" className="block text-sm font-medium text-foreground">
            Headcount <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="headcount"
            name="headcount"
            min={1}
            max={remaining || 5}
            defaultValue={1}
            className={inputClass("headcount")}
            aria-invalid={state?.errors?.headcount ? "true" : "false"}
            aria-describedby={state?.errors?.headcount ? "headcount-error" : undefined}
          />
          <p className="text-sm text-text-secondary">Up to {remaining} remaining for this role.</p>
          {state?.errors?.headcount && (
            <p id="headcount-error" className="text-sm text-red-500" role="alert">
              {state.errors.headcount[0]}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-medium text-foreground">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            className={inputClass("name")}
            aria-invalid={state?.errors?.name ? "true" : "false"}
            aria-describedby={state?.errors?.name ? "name-error" : undefined}
          />
          {state?.errors?.name && (
            <p id="name-error" className="text-sm text-red-500" role="alert">
              {state.errors.name[0]}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-foreground">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            className={inputClass("email")}
            aria-invalid={state?.errors?.email ? "true" : "false"}
            aria-describedby={state?.errors?.email ? "email-error" : undefined}
          />
          {state?.errors?.email && (
            <p id="email-error" className="text-sm text-red-500" role="alert">
              {state.errors.email[0]}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="phone" className="block text-sm font-medium text-foreground">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            required
            placeholder="(555) 123-4567"
            className={inputClass("phone")}
            aria-invalid={state?.errors?.phone ? "true" : "false"}
            aria-describedby={state?.errors?.phone ? "phone-error" : undefined}
          />
          {state?.errors?.phone && (
            <p id="phone-error" className="text-sm text-red-500" role="alert">
              {state.errors.phone[0]}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="contactMethod" className="block text-sm font-medium text-foreground">
            What is the best way to contact you? <span className="text-red-500">*</span>
          </label>
          <select
            id="contactMethod"
            name="contactMethod"
            required
            defaultValue="email"
            className={inputClass("contactMethod")}
            aria-invalid={state?.errors?.contactMethod ? "true" : "false"}
            aria-describedby={state?.errors?.contactMethod ? "contactMethod-error" : undefined}
          >
            <option value="call">Call</option>
            <option value="text">Text</option>
            <option value="email">Email</option>
          </select>
          {state?.errors?.contactMethod && (
            <p id="contactMethod-error" className="text-sm text-red-500" role="alert">
              {state.errors.contactMethod[0]}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="notes" className="block text-sm font-medium text-foreground">
            Additional Comments
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={4}
            className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground placeholder:text-text-secondary focus:border-primary focus:ring-primary"
          />
        </div>

        <button
          type="submit"
          disabled={pending || remaining <= 0}
          className="w-full rounded-lg bg-primary px-6 py-3 text-lg font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {pending ? "Submitting..." : "Submit Volunteer Signup"}
        </button>
      </form>

      {showLookup && <LookupModal type="volunteer-meal" onClose={() => setShowLookup(false)} />}
    </div>
  );
}

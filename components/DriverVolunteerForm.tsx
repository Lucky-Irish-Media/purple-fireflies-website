"use client";

import { useActionState, useMemo, useState } from "react";
import { submitDriverVolunteer } from "@/app/actions/driver-volunteer";
import type { DriverVolunteerFormState } from "@/app/lib/definitions";
import { LookupModal } from "@/components/LookupModal";

const regions = ["North", "South", "East", "West", "The Plains", "Chauncey", "Glouster/Jacksonville/Trimble"];

function generateDriverDateOptions() {
  const options: { value: string; label: string }[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const minDate = new Date(today);
  minDate.setDate(today.getDate());

  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + 30);

  for (let d = new Date(minDate); d <= maxDate; d.setDate(d.getDate() + 1)) {
    const dayOfWeek = d.getDay();
    if (dayOfWeek === 3) {
      const dateStr = d.toISOString().split("T")[0];
      options.push({
        value: dateStr,
        label: `Wednesday, ${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })} at 12:00 PM`,
      });
    } else if (dayOfWeek === 4) {
      const dateStr = d.toISOString().split("T")[0];
      options.push({
        value: dateStr,
        label: `Thursday, ${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })} at 5:00 PM`,
      });
    }
  }

  return options;
}

export function DriverVolunteerForm() {
  const [state, formAction, isPending] = useActionState(submitDriverVolunteer, undefined as DriverVolunteerFormState);
  const [showLookup, setShowLookup] = useState(false);

  const deliveryDateOptions = useMemo(() => generateDriverDateOptions(), []);

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="mb-6 text-3xl font-bold text-foreground">Driver Volunteer Signup</h2>
      <p className="mb-8 text-lg text-text-secondary">
        Volunteer to deliver meals on Wednesdays and Thursdays. Signup is open for a rolling 30-days.
        Select all dates you are available to drive.
      </p>

      <p className="mb-8">
        <button type="button" onClick={() => setShowLookup(true)} className="text-sm font-medium text-primary hover:underline">
          Look up my existing volunteer signups →
        </button>
      </p>

      <form action={formAction} className="space-y-6" noValidate>
        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-medium text-foreground">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            className={`w-full rounded-lg border bg-background px-4 py-3 text-foreground placeholder:text-text-secondary ${
              state?.errors?.name ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-input focus:border-primary focus:ring-primary"
            }`}
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
            className={`w-full rounded-lg border bg-background px-4 py-3 text-foreground placeholder:text-text-secondary ${
              state?.errors?.email ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-input focus:border-primary focus:ring-primary"
            }`}
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
            className={`w-full rounded-lg border bg-background px-4 py-3 text-foreground placeholder:text-text-secondary ${
              state?.errors?.phone ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-input focus:border-primary focus:ring-primary"
            }`}
            aria-invalid={state?.errors?.phone ? "true" : "false"}
            aria-describedby={state?.errors?.phone ? "phone-error" : undefined}
          />
          {state?.errors?.phone && (
            <p id="phone-error" className="text-sm text-red-500" role="alert">
              {state.errors.phone[0]}
            </p>
          )}
        </div>

        <fieldset className="space-y-2">
          <legend className="block text-sm font-medium text-foreground">
            Are you on Signal? If not, would you be willing to join? <span className="text-red-500">*</span>
          </legend>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="onSignal"
                value="yes"
                required
                className="h-4 w-4 text-primary border-input focus:ring-primary"
              />
              <span className="text-foreground">Yes, I'm on Signal</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="onSignal"
                value="willing"
                className="h-4 w-4 text-primary border-input focus:ring-primary"
              />
              <span className="text-foreground">No, but willing to join</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="onSignal"
                value="no"
                className="h-4 w-4 text-primary border-input focus:ring-primary"
              />
              <span className="text-foreground">No</span>
            </label>
          </div>
          {state?.errors?.onSignal && (
            <p className="text-sm text-red-500" role="alert">
              {state.errors.onSignal[0]}
            </p>
          )}
        </fieldset>

        <fieldset className="space-y-2">
          <legend className="block text-sm font-medium text-foreground">
            Available Delivery Dates <span className="text-red-500">*</span>
          </legend>
          <p className="text-sm text-text-secondary">Select all Wednesdays and Thursdays you can volunteer (next 30 days)</p>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {deliveryDateOptions.map((option) => (
              <label key={option.value} className="flex items-center gap-2 cursor-pointer block">
                <input
                  type="checkbox"
                  name="deliveryDates"
                  value={option.value}
                  className="h-4 w-4 text-primary border-input focus:ring-primary rounded"
                />
                <span className="text-foreground">{option.label}</span>
              </label>
            ))}
          </div>
          {state?.errors?.deliveryDates && (
            <p className="text-sm text-red-500" role="alert">
              {state.errors.deliveryDates[0]}
            </p>
          )}
        </fieldset>

        <fieldset className="space-y-2">
          <legend className="block text-sm font-medium text-foreground">
            Available Regions <span className="text-red-500">*</span>
          </legend>
          <p className="text-sm text-text-secondary">Select all regions you can deliver to</p>
          <div className="space-y-2">
            {regions.map((region) => (
              <label key={region} className="flex items-center gap-2 cursor-pointer block">
                <input
                  type="checkbox"
                  name="regions"
                  value={region}
                  className="h-4 w-4 text-primary border-input focus:ring-primary rounded"
                />
                <span className="text-foreground">{region}</span>
              </label>
            ))}
          </div>
          {state?.errors?.regions && (
            <p className="text-sm text-red-500" role="alert">
              {state.errors.regions[0]}
            </p>
          )}
        </fieldset>

        {state?.message && state.message !== "success" && (
          <div className="rounded-lg bg-red-50 p-4 text-red-600" role="alert">
            {state.message}
          </div>
        )}

        {state?.message === "success" && (
          <div className="rounded-lg bg-green-50 p-4 text-green-600" role="status">
            Thank you for volunteering! You&apos;re signed up for: {state.selectedDates}. We&apos;ll be in touch soon with details.
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-lg bg-primary px-6 py-3 text-lg font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "Submitting..." : "Submit Volunteer Signup"}
        </button>
      </form>

      {showLookup && <LookupModal type="driver" onClose={() => setShowLookup(false)} />}
    </div>
  );
}
"use client";

import { useActionState, useState } from "react";
import { updateVolunteerProfile } from "@/app/actions/volunteer";
import type { Participant, VolunteerProfileFormState } from "@/app/lib/definitions";

const regions = [
  "North",
  "South",
  "East",
  "West",
  "The Plains",
  "Chauncey",
  "Glouster/Jacksonville/Trimble",
];

export function ProfileForm({
  participant,
  initialRegions,
  initialOnSignal,
}: {
  participant: Participant | null;
  initialRegions: string[];
  initialOnSignal: string;
}) {
  const [state, action, pending] = useActionState(
    updateVolunteerProfile,
    undefined as VolunteerProfileFormState
  );
  const [selectedRegions, setSelectedRegions] = useState<string[]>(initialRegions);

  function toggleRegion(region: string) {
    setSelectedRegions((prev) =>
      prev.includes(region)
        ? prev.filter((r) => r !== region)
        : [...prev, region]
    );
  }

  return (
    <form action={action} className="space-y-5 rounded-lg border border-primary/10 bg-card p-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
            Full Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={participant?.name || ""}
            className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {state?.errors?.name && (
            <p className="mt-1 text-sm text-red-500">{state.errors.name[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            defaultValue={participant?.email || ""}
            className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {state?.errors?.email && (
            <p className="mt-1 text-sm text-red-500">{state.errors.email[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-1">
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            placeholder="(555) 123-4567"
            defaultValue={participant?.phone || ""}
            className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {state?.errors?.phone && (
            <p className="mt-1 text-sm text-red-500">{state.errors.phone[0]}</p>
          )}
        </div>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-foreground">
          Are you on Signal? If not, would you be willing to join?
        </legend>
        <div className="flex gap-6">
          {(["yes", "willing", "no"] as const).map((value) => (
            <label key={value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="onSignal"
                value={value}
                defaultChecked={initialOnSignal === value}
                className="h-4 w-4 text-primary border-input focus:ring-primary"
              />
              <span className="text-foreground">
                {value === "yes"
                  ? "Yes, I'm on Signal"
                  : value === "willing"
                  ? "No, but willing to join"
                  : "No"}
              </span>
            </label>
          ))}
        </div>
        {state?.errors?.onSignal && (
          <p className="text-sm text-red-500">{state.errors.onSignal[0]}</p>
        )}
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-foreground">
          Available Regions
        </legend>
        <div className="space-y-2">
          {regions.map((region) => (
            <label key={region} className="flex items-center gap-2 cursor-pointer block">
              <input
                type="checkbox"
                name="regions"
                value={region}
                checked={selectedRegions.includes(region)}
                onChange={() => toggleRegion(region)}
                className="h-4 w-4 text-primary border-input focus:ring-primary rounded"
              />
              <span className="text-foreground">{region}</span>
            </label>
          ))}
        </div>
        {state?.errors?.regions && (
          <p className="text-sm text-red-500">{state.errors.regions[0]}</p>
        )}
      </fieldset>

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
        {pending ? "Saving..." : "Update Profile"}
      </button>
    </form>
  );
}

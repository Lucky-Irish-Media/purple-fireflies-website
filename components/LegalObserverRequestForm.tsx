"use client";

import { useActionState } from "react";
import { submitLegalObserverRequest } from "@/app/actions/legal-observer";
import type { LegalObserverRequestFormState } from "@/app/lib/definitions";

const eventTypeOptions = [
  "Protest / March",
  "Rally",
  "Direct Action",
  "Community Event",
  "Voter Registration",
  "Other",
];

export function LegalObserverRequestForm() {
  const [state, formAction, isPending] = useActionState(submitLegalObserverRequest, undefined as LegalObserverRequestFormState);

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="mb-6 text-3xl font-bold text-foreground">Request Legal Observer Coverage</h2>
      <p className="mb-8 text-lg text-text-secondary">
        Fill out the form below to request Legal Observer coverage for your event. We&apos;ll review your
        request and get back to you as soon as possible to confirm coverage availability.
      </p>

      <form action={formAction} className="space-y-6" noValidate>
        <div className="space-y-2">
          <label htmlFor="contact_name" className="block text-sm font-medium text-foreground">
            Contact Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="contact_name"
            name="contact_name"
            required
            className={`w-full rounded-lg border bg-background px-4 py-3 text-foreground placeholder:text-text-secondary ${
              state?.errors?.contact_name ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-input focus:border-primary focus:ring-primary"
            }`}
            aria-invalid={state?.errors?.contact_name ? "true" : "false"}
            aria-describedby={state?.errors?.contact_name ? "contact_name-error" : undefined}
          />
          {state?.errors?.contact_name && (
            <p id="contact_name-error" className="text-sm text-red-500" role="alert">
              {state.errors.contact_name[0]}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="contact_email" className="block text-sm font-medium text-foreground">
            Contact Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="contact_email"
            name="contact_email"
            required
            className={`w-full rounded-lg border bg-background px-4 py-3 text-foreground placeholder:text-text-secondary ${
              state?.errors?.contact_email ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-input focus:border-primary focus:ring-primary"
            }`}
            aria-invalid={state?.errors?.contact_email ? "true" : "false"}
            aria-describedby={state?.errors?.contact_email ? "contact_email-error" : undefined}
          />
          {state?.errors?.contact_email && (
            <p id="contact_email-error" className="text-sm text-red-500" role="alert">
              {state.errors.contact_email[0]}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="contact_phone" className="block text-sm font-medium text-foreground">
            Contact Phone <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            id="contact_phone"
            name="contact_phone"
            required
            placeholder="(555) 123-4567"
            className={`w-full rounded-lg border bg-background px-4 py-3 text-foreground placeholder:text-text-secondary ${
              state?.errors?.contact_phone ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-input focus:border-primary focus:ring-primary"
            }`}
            aria-invalid={state?.errors?.contact_phone ? "true" : "false"}
            aria-describedby={state?.errors?.contact_phone ? "contact_phone-error" : undefined}
          />
          {state?.errors?.contact_phone && (
            <p id="contact_phone-error" className="text-sm text-red-500" role="alert">
              {state.errors.contact_phone[0]}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="event_date" className="block text-sm font-medium text-foreground">
              Event Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="event_date"
              name="event_date"
              required
              className={`w-full rounded-lg border bg-background px-4 py-3 text-foreground ${
                state?.errors?.event_date ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-input focus:border-primary focus:ring-primary"
              }`}
              aria-invalid={state?.errors?.event_date ? "true" : "false"}
              aria-describedby={state?.errors?.event_date ? "event_date-error" : undefined}
            />
            {state?.errors?.event_date && (
              <p id="event_date-error" className="text-sm text-red-500" role="alert">
                {state.errors.event_date[0]}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="event_time" className="block text-sm font-medium text-foreground">
              Event Time (Optional)
            </label>
            <input
              type="time"
              id="event_time"
              name="event_time"
              className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground focus:border-primary focus:ring-primary"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="event_location" className="block text-sm font-medium text-foreground">
            Event Location <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="event_location"
            name="event_location"
            required
            placeholder="Address or location description"
            className={`w-full rounded-lg border bg-background px-4 py-3 text-foreground placeholder:text-text-secondary ${
              state?.errors?.event_location ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-input focus:border-primary focus:ring-primary"
            }`}
            aria-invalid={state?.errors?.event_location ? "true" : "false"}
            aria-describedby={state?.errors?.event_location ? "event_location-error" : undefined}
          />
          {state?.errors?.event_location && (
            <p id="event_location-error" className="text-sm text-red-500" role="alert">
              {state.errors.event_location[0]}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="event_type" className="block text-sm font-medium text-foreground">
            Event Type
          </label>
          <select
            id="event_type"
            name="event_type"
            className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground focus:border-primary focus:ring-primary"
          >
            <option value="">Select event type</option>
            {eventTypeOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="special_notes" className="block text-sm font-medium text-foreground">
            Special Notes
          </label>
          <textarea
            id="special_notes"
            name="special_notes"
            rows={4}
            placeholder="Any additional information about the event — expected attendance, specific concerns, route details, etc."
            className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground placeholder:text-text-secondary focus:border-primary focus:ring-primary"
          />
        </div>

        {state?.message && state.message !== "success" && (
          <div className="rounded-lg bg-red-50 p-4 text-red-600" role="alert">
            {state.message}
          </div>
        )}

        {state?.message === "success" && (
          <div className="rounded-lg bg-green-50 p-4 text-green-600" role="status">
            Thank you for your coverage request! We&apos;ll review it and get back to you as soon as possible to confirm observer availability.
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-lg bg-primary px-6 py-3 text-lg font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "Submitting..." : "Submit Coverage Request"}
        </button>
      </form>
    </div>
  );
}

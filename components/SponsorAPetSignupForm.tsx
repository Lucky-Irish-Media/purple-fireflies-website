"use client";

import { useState } from "react";
import { useActionState } from "react";
import { submitPetApplication } from "@/app/actions/sponsor-pet-application";
import type { PetApplicationFormState } from "@/app/lib/definitions";
import {
  PET_WAIVER_TEXT,
  PET_WAIVER_VERSION,
  PET_WAIVER_TITLE,
} from "@/app/lib/pet-waiver";

const fieldClass = (hasError?: boolean) =>
  `w-full rounded-lg border bg-background px-4 py-3 text-foreground placeholder:text-text-secondary focus:outline-none focus:ring-2 ${
    hasError
      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
      : "border-input focus:border-primary focus:ring-primary"
  }`;

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors || errors.length === 0) return null;
  return (
    <p className="text-sm text-red-500" role="alert">
      {errors[0]}
    </p>
  );
}

export function SponsorAPetSignupForm() {
  const [state, formAction, isPending] = useActionState(
    submitPetApplication,
    undefined as PetApplicationFormState,
  );
  const [waiverOpen, setWaiverOpen] = useState(false);

  if (state?.message === "success") {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="rounded-lg bg-green-50 p-6 text-green-700" role="status">
          <h2 className="text-xl font-bold mb-2">Application received</h2>
          <p>
            Thank you for submitting your pet to the Sponsor a Pet Program. We
            have sent a confirmation email and our team will follow up with you.
            Nothing is published without your written consent.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="mb-2 text-3xl font-bold text-foreground">
        Sponsor a Pet - Application
      </h2>
      <p className="mb-8 text-lg text-text-secondary">
        Tell us about you and your pet. We will follow up, and nothing is
        published without your written consent.
      </p>

      <form action={formAction} className="space-y-6" noValidate>
        <fieldset className="space-y-4">
          <legend className="text-lg font-semibold text-foreground">Your contact info</legend>

          <div className="space-y-2">
            <label htmlFor="applicant_name" className="block text-sm font-medium text-foreground">
              Your name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="applicant_name"
              name="applicant_name"
              required
              className={fieldClass(!!state?.errors?.applicant_name)}
            />
            <FieldError errors={state?.errors?.applicant_name} />
          </div>

          <div className="space-y-2">
            <label htmlFor="applicant_email" className="block text-sm font-medium text-foreground">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="applicant_email"
              name="applicant_email"
              required
              className={fieldClass(!!state?.errors?.applicant_email)}
            />
            <FieldError errors={state?.errors?.applicant_email} />
          </div>

          <div className="space-y-2">
            <label htmlFor="applicant_phone" className="block text-sm font-medium text-foreground">
              Phone <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              id="applicant_phone"
              name="applicant_phone"
              required
              placeholder="(555) 123-4567"
              className={fieldClass(!!state?.errors?.applicant_phone)}
            />
            <FieldError errors={state?.errors?.applicant_phone} />
          </div>

          <div className="space-y-2">
            <label htmlFor="applicant_address" className="block text-sm font-medium text-foreground">
              Address
            </label>
            <input
              type="text"
              id="applicant_address"
              name="applicant_address"
              className={fieldClass(!!state?.errors?.applicant_address)}
            />
            <FieldError errors={state?.errors?.applicant_address} />
          </div>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="text-lg font-semibold text-foreground">Pet details</legend>

          <div className="space-y-2">
            <label htmlFor="pet_name" className="block text-sm font-medium text-foreground">
              Pet name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="pet_name"
              name="pet_name"
              required
              className={fieldClass(!!state?.errors?.pet_name)}
            />
            <FieldError errors={state?.errors?.pet_name} />
          </div>

          <div className="space-y-2">
            <label htmlFor="species" className="block text-sm font-medium text-foreground">
              Species <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="species"
              name="species"
              required
              placeholder="Dog, cat, etc."
              className={fieldClass(!!state?.errors?.species)}
            />
            <FieldError errors={state?.errors?.species} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="breed" className="block text-sm font-medium text-foreground">
                Breed
              </label>
              <input
                type="text"
                id="breed"
                name="breed"
                className={fieldClass(!!state?.errors?.breed)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="age_text" className="block text-sm font-medium text-foreground">
                Age
              </label>
              <input
                type="text"
                id="age_text"
                name="age_text"
                placeholder="3 years"
                className={fieldClass(!!state?.errors?.age_text)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="sex" className="block text-sm font-medium text-foreground">
              Sex
            </label>
            <input
              type="text"
              id="sex"
              name="sex"
              className={fieldClass(!!state?.errors?.sex)}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="story" className="block text-sm font-medium text-foreground">
              Tell us about your pet <span className="text-red-500">*</span>
            </label>
            <textarea
              id="story"
              name="story"
              rows={5}
              required
              className={fieldClass(!!state?.errors?.story)}
            />
            <FieldError errors={state?.errors?.story} />
          </div>

          <div className="space-y-2">
            <label htmlFor="needs" className="block text-sm font-medium text-foreground">
              Needs (vet bills, food, supplies)
            </label>
            <textarea
              id="needs"
              name="needs"
              rows={3}
              className={fieldClass(!!state?.errors?.needs)}
            />
          </div>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="text-lg font-semibold text-foreground">
            Availability
          </legend>
          <p className="text-sm text-text-secondary">
            When are you generally available for a photo visit or follow-up?
            Check all that apply.
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { day: "Friday", key: "friday" },
              { day: "Saturday", key: "saturday" },
              { day: "Sunday", key: "sunday" },
            ].map(({ day, key }) => (
              <div key={key} className="space-y-2 rounded-lg border border-primary/10 p-3">
                <div className="font-medium text-foreground">{day}</div>
                <label className="flex items-center gap-2 text-sm text-foreground">
                  <input type="checkbox" name="availability" value={`${key}_afternoon`} />
                  Afternoon
                </label>
                <label className="flex items-center gap-2 text-sm text-foreground">
                  <input type="checkbox" name="availability" value={`${key}_evening`} />
                  Evening
                </label>
              </div>
            ))}
          </div>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="text-lg font-semibold text-foreground">
            Owner consent waiver
          </legend>
          <p className="text-sm text-text-secondary">
            Please read the waiver below. Version {PET_WAIVER_VERSION}.
          </p>
          <button
            type="button"
            onClick={() => setWaiverOpen((v) => !v)}
            className="rounded-lg border border-primary/10 px-3 py-1.5 text-sm font-medium text-foreground hover:bg-primary/5"
          >
            {waiverOpen ? "Hide waiver text" : "Read waiver text"}
          </button>
          {waiverOpen && (
            <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded-lg border border-primary/10 bg-background p-4 text-xs text-text-secondary">
              {PET_WAIVER_TEXT}
            </pre>
          )}

          <div className="space-y-2">
            <label htmlFor="signature" className="block text-sm font-medium text-foreground">
              Typed signature (your full name) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="signature"
              name="signature"
              required
              className={fieldClass(!!state?.errors?.signature)}
            />
            <FieldError errors={state?.errors?.signature} />
          </div>

          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="waiverAcknowledged"
              name="waiverAcknowledged"
              value="on"
              className="mt-1"
            />
            <label htmlFor="waiverAcknowledged" className="text-sm text-foreground">
              I have read and agree to the owner consent waiver.{" "}
              <span className="text-red-500">*</span>
            </label>
          </div>
          <FieldError errors={state?.errors?.waiverAcknowledged} />
        </fieldset>

        {state?.message && state.message !== "success" && (
          <div className="rounded-lg bg-red-50 p-4 text-red-600" role="alert">
            {state.message}
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-lg bg-primary px-6 py-3 text-lg font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "Submitting..." : "Submit application"}
        </button>
      </form>
    </div>
  );
}
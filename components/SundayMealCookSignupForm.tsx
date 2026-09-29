"use client";

import { useActionState } from "react";
import { submitSundayMealCookSignup } from "@/app/actions/sunday-meals";
import {
  SUNDAY_MEAL_AVAILABILITY_OPTIONS,
  type SundayMealCookSignupFormState,
} from "@/app/lib/definitions";

const inputClass = (hasError: string[] | undefined) =>
  `w-full rounded-lg border bg-background px-4 py-3 text-foreground placeholder:text-text-secondary ${
    hasError
      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
      : "border-input focus:border-primary focus:ring-primary"
  }`;

export function SundayMealCookSignupForm() {
  const [state, formAction, isPending] = useActionState(
    submitSundayMealCookSignup,
    undefined as SundayMealCookSignupFormState
  );

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="mb-6 text-3xl font-bold text-foreground">Sunday Meals Cook Signup</h2>
      <p className="mb-8 text-lg text-text-secondary">
        Tell us a little about you and which Sunday of the month works for you. After
        submitting, we&apos;ll follow up to confirm dates and answer any questions about
        the commitment.
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
            className={inputClass(state?.errors?.name)}
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
            className={inputClass(state?.errors?.email)}
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
            className={inputClass(state?.errors?.phone)}
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
            Which Sunday of the month generally works for you?{" "}
            <span className="text-red-500">*</span>
          </legend>
          <p className="text-xs text-text-secondary">
            Pick every option that could work. We&apos;ll confirm the actual date with you
            each month.
          </p>
          <div className="space-y-2 pt-1">
            {SUNDAY_MEAL_AVAILABILITY_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                htmlFor={`availability-${opt.value}`}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-primary/10 bg-background px-4 py-2.5 text-sm text-foreground hover:bg-primary/5 transition-colors"
              >
                <input
                  type="checkbox"
                  id={`availability-${opt.value}`}
                  name="availability"
                  value={opt.value}
                  className="h-4 w-4 rounded border-input accent-[#7C3AED] focus:ring-primary"
                />
                {opt.label}
              </label>
            ))}
          </div>
          {state?.errors?.availability && (
            <p className="text-sm text-red-500" role="alert">
              {state.errors.availability[0]}
            </p>
          )}
        </fieldset>

        <div className="space-y-2">
          <label htmlFor="cooking_details" className="block text-sm font-medium text-foreground">
            What kind of food do you cook?
          </label>
          <textarea
            id="cooking_details"
            name="cooking_details"
            rows={3}
            placeholder="e.g. Southern food, soups and stews, baking, Caribbean and Haitian dishes, big-batch pasta..."
            className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground placeholder:text-text-secondary focus:border-primary focus:ring-primary"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="dietary_notes" className="block text-sm font-medium text-foreground">
            Dietary needs you can work with
          </label>
          <textarea
            id="dietary_notes"
            name="dietary_notes"
            rows={3}
            placeholder="e.g. I can make gluten-free easily, I avoid pork, I can do vegetarian and vegan plates..."
            className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground placeholder:text-text-secondary focus:border-primary focus:ring-primary"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="servings" className="block text-sm font-medium text-foreground">
            How many plates can you realistically make?
          </label>
          <input
            type="number"
            id="servings"
            name="servings"
            min={1}
            max={200}
            placeholder="15"
            className={inputClass(state?.errors?.servings)}
            aria-invalid={state?.errors?.servings ? "true" : "false"}
            aria-describedby={
              state?.errors?.servings ? "servings-error" : "servings-hint"
            }
          />
          <p id="servings-hint" className="text-xs text-text-secondary">
            The program target is 15 individually made plates. Include yourself in the count.
          </p>
          {state?.errors?.servings && (
            <p id="servings-error" className="text-sm text-red-500" role="alert">
              {state.errors.servings[0]}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="notes" className="block text-sm font-medium text-foreground">
            Anything else we should know?
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            placeholder="Months you are unavailable, people who will help you cook, questions about the commitment..."
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
            Thank you for signing up to cook for Sunday Meals! We&apos;ll be in touch soon
            to confirm your first Sunday.
          </div>
        )}

        <div className="rounded-lg bg-primary/5 p-4 text-sm text-text-secondary">
          <p className="font-medium text-foreground">By submitting you are committing to:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Cooking once a month for six months</li>
            <li>Making enough food for 15 individually served plates each month</li>
          </ul>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-lg bg-primary px-6 py-3 text-lg font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "Submitting..." : "Sign Up to Cook"}
        </button>
      </form>
    </div>
  );
}

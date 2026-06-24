"use client";

import { useActionState, useMemo } from "react";
import { submitMealSignup } from "@/app/actions/meal-signup";
import type { MealSignupFormState } from "@/app/lib/definitions";

const stateOptions = [
  { value: "AL", label: "AL" }, { value: "AK", label: "AK" }, { value: "AZ", label: "AZ" }, { value: "AR", label: "AR" },
  { value: "CA", label: "CA" }, { value: "CO", label: "CO" }, { value: "CT", label: "CT" }, { value: "DE", label: "DE" },
  { value: "FL", label: "FL" }, { value: "GA", label: "GA" }, { value: "HI", label: "HI" }, { value: "ID", label: "ID" },
  { value: "IL", label: "IL" }, { value: "IN", label: "IN" }, { value: "IA", label: "IA" }, { value: "KS", label: "KS" },
  { value: "KY", label: "KY" }, { value: "LA", label: "LA" }, { value: "ME", label: "ME" }, { value: "MD", label: "MD" },
  { value: "MA", label: "MA" }, { value: "MI", label: "MI" }, { value: "MN", label: "MN" }, { value: "MS", label: "MS" },
  { value: "MO", label: "MO" }, { value: "MT", label: "MT" }, { value: "NE", label: "NE" }, { value: "NV", label: "NV" },
  { value: "NH", label: "NH" }, { value: "NJ", label: "NJ" }, { value: "NM", label: "NM" }, { value: "NY", label: "NY" },
  { value: "NC", label: "NC" }, { value: "ND", label: "ND" }, { value: "OH", label: "OH" }, { value: "OK", label: "OK" },
  { value: "OR", label: "OR" }, { value: "PA", label: "PA" }, { value: "RI", label: "RI" }, { value: "SC", label: "SC" },
  { value: "SD", label: "SD" }, { value: "TN", label: "TN" }, { value: "TX", label: "TX" }, { value: "UT", label: "UT" },
  { value: "VT", label: "VT" }, { value: "VA", label: "VA" }, { value: "WA", label: "WA" }, { value: "WV", label: "WV" },
  { value: "WI", label: "WI" }, { value: "WY", label: "WY" },
];

function generateDeliveryDateOptions() {
  const options: { value: string; label: string }[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const minDate = new Date(today);
  minDate.setDate(today.getDate() + 7);

  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + 14);

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

export function MealSignupForm() {
  const [state, formAction, isPending] = useActionState(submitMealSignup, undefined as MealSignupFormState);

  const deliveryDateOptions = useMemo(() => generateDeliveryDateOptions(), []);

  const mealTypeOptions = [
    { value: "regular", label: "Regular" },
    { value: "vegan", label: "Vegan" },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="mb-6 text-3xl font-bold text-foreground">Meal Delivery Signup</h2>
      <p className="mb-8 text-lg text-text-secondary">
        Sign up to receive free meal deliveries. We deliver on Wednesdays at 12:00 PM and Thursdays at 5:00 PM.
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

        <div className="space-y-2">
          <label htmlFor="address1" className="block text-sm font-medium text-foreground">
            Address Line 1 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="address1"
            name="address1"
            required
            placeholder="123 Main Street"
            className={`w-full rounded-lg border bg-background px-4 py-3 text-foreground placeholder:text-text-secondary ${
              state?.errors?.address1 ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-input focus:border-primary focus:ring-primary"
            }`}
            aria-invalid={state?.errors?.address1 ? "true" : "false"}
            aria-describedby={state?.errors?.address1 ? "address1-error" : undefined}
          />
          {state?.errors?.address1 && (
            <p id="address1-error" className="text-sm text-red-500" role="alert">
              {state.errors.address1[0]}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="address2" className="block text-sm font-medium text-foreground">
            Address Line 2 (Optional)
          </label>
          <input
            type="text"
            id="address2"
            name="address2"
            placeholder="Apartment, suite, unit, etc."
            className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground placeholder:text-text-secondary focus:border-primary focus:ring-primary"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label htmlFor="city" className="block text-sm font-medium text-foreground">
              City <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="city"
              name="city"
              required
              placeholder="City"
              className={`w-full rounded-lg border bg-background px-4 py-3 text-foreground placeholder:text-text-secondary ${
                state?.errors?.city ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-input focus:border-primary focus:ring-primary"
              }`}
              aria-invalid={state?.errors?.city ? "true" : "false"}
              aria-describedby={state?.errors?.city ? "city-error" : undefined}
            />
            {state?.errors?.city && (
              <p id="city-error" className="text-sm text-red-500" role="alert">
                {state.errors.city[0]}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="state" className="block text-sm font-medium text-foreground">
              State <span className="text-red-500">*</span>
            </label>
            <select
              id="state"
              name="state"
              required
              defaultValue="OH"
              className={`w-full rounded-lg border bg-background px-4 py-3 text-foreground ${
                state?.errors?.state ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-input focus:border-primary focus:ring-primary"
              }`}
              aria-invalid={state?.errors?.state ? "true" : "false"}
              aria-describedby={state?.errors?.state ? "state-error" : undefined}
            >
              <option value="" disabled>Select State</option>
              {stateOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {state?.errors?.state && (
              <p id="state-error" className="text-sm text-red-500" role="alert">
                {state.errors.state[0]}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="zipCode" className="block text-sm font-medium text-foreground">
              ZIP Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="zipCode"
              name="zipCode"
              required
              placeholder="12345"
              maxLength={10}
              className={`w-full rounded-lg border bg-background px-4 py-3 text-foreground placeholder:text-text-secondary ${
                state?.errors?.zipCode ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-input focus:border-primary focus:ring-primary"
              }`}
              aria-invalid={state?.errors?.zipCode ? "true" : "false"}
              aria-describedby={state?.errors?.zipCode ? "zipCode-error" : undefined}
            />
            {state?.errors?.zipCode && (
              <p id="zipCode-error" className="text-sm text-red-500" role="alert">
                {state.errors.zipCode[0]}
              </p>
            )}
          </div>
        </div>

        <fieldset className="space-y-2">
          <legend className="block text-sm font-medium text-foreground">
            Meal Type <span className="text-red-500">*</span>
          </legend>
          <div className="flex gap-6">
            {mealTypeOptions.map((option) => (
              <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="mealType"
                  value={option.value}
                  required
                  className="h-4 w-4 text-primary border-input focus:ring-primary"
                />
                <span className="text-foreground">{option.label}</span>
              </label>
            ))}
          </div>
          {state?.errors?.mealType && (
            <p className="text-sm text-red-500" role="alert">
              {state.errors.mealType[0]}
            </p>
          )}
        </fieldset>

        <fieldset className="space-y-2">
          <legend className="block text-sm font-medium text-foreground">
            Delivery Dates <span className="text-red-500">*</span>
          </legend>
          <p className="text-sm text-text-secondary">Select one or more delivery dates</p>
          <div className="space-y-2">
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

        <div className="space-y-2">
          <label htmlFor="comments" className="block text-sm font-medium text-foreground">
            Additional Comments
          </label>
          <textarea
            id="comments"
            name="comments"
            rows={4}
            placeholder="Any dietary restrictions, delivery instructions, or other notes..."
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
            Thank you for signing up! Your delivery is scheduled for {state.selectedDate ? new Date(state.selectedDate).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" }) : "the selected date"}. We&apos;ll be in touch soon with delivery details.
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-lg bg-primary px-6 py-3 text-lg font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "Submitting..." : "Submit Signup"}
        </button>
      </form>
    </div>
  );
}
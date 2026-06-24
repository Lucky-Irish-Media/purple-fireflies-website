"use client";

import { useActionState, useMemo } from "react";
import { submitMealSignup } from "@/app/actions/meal-signup";
import type { MealSignupFormState } from "@/app/lib/definitions";

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
          <label htmlFor="address" className="block text-sm font-medium text-foreground">
            Full Address <span className="text-red-500">*</span>
          </label>
          <textarea
            id="address"
            name="address"
            required
            rows={3}
            placeholder="Street address, city, state, ZIP"
            className={`w-full rounded-lg border bg-background px-4 py-3 text-foreground placeholder:text-text-secondary ${
              state?.errors?.address ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-input focus:border-primary focus:ring-primary"
            }`}
            aria-invalid={state?.errors?.address ? "true" : "false"}
            aria-describedby={state?.errors?.address ? "address-error" : undefined}
          />
          {state?.errors?.address && (
            <p id="address-error" className="text-sm text-red-500" role="alert">
              {state.errors.address[0]}
            </p>
          )}
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
            Delivery Date <span className="text-red-500">*</span>
          </legend>
          <div className="space-y-2">
            {deliveryDateOptions.map((option) => (
              <label key={option.value} className="flex items-center gap-2 cursor-pointer block">
                <input
                  type="radio"
                  name="deliveryDate"
                  value={option.value}
                  required
                  className="h-4 w-4 text-primary border-input focus:ring-primary"
                />
                <span className="text-foreground">{option.label}</span>
              </label>
            ))}
          </div>
          {state?.errors?.deliveryDate && (
            <p className="text-sm text-red-500" role="alert">
              {state.errors.deliveryDate[0]}
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
"use client";

import { useActionState, useMemo, useState } from "react";
import { submitDriverVolunteer, checkDriverWaiverStatus } from "@/app/actions/driver-volunteer";
import type { DriverVolunteerFormState } from "@/app/lib/definitions";
import { WAIVER_TEXT, WAIVER_CERTIFICATION_BULLETS, WAIVER_VERSION, WAIVER_SOURCE_URL } from "@/app/lib/waiver";
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
  const [waiverChecked, setWaiverChecked] = useState(false);
  const [waiverSigned, setWaiverSigned] = useState(false);

  const deliveryDateOptions = useMemo(() => generateDriverDateOptions(), []);

  async function handleEmailBlur(e: React.FocusEvent<HTMLInputElement>) {
    const email = e.target.value.trim();
    if (!email || !email.includes("@")) return;
    setWaiverChecked(false);
    const result = await checkDriverWaiverStatus(email);
    setWaiverSigned(result.signed);
    setWaiverChecked(true);
  }

  const showWaiver = waiverChecked && !waiverSigned;

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

      <p className="mb-8">
        <a href="/login" className="text-sm font-medium text-primary hover:underline">
          Already have an account? Sign in to manage your signups →
        </a>
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
            onBlur={handleEmailBlur}
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

        {showWaiver && (
          <fieldset className="space-y-4 rounded-lg border border-primary/20 p-6">
            <legend className="px-2 text-sm font-medium text-foreground">
              Liability Waiver and Acknowledgment <span className="text-red-500">*</span>
            </legend>

            <div className="max-h-64 overflow-y-auto rounded-lg border border-primary/10 bg-background p-4">
              <p className="whitespace-pre-line text-sm text-text-secondary">{WAIVER_TEXT}</p>
              <p className="mt-2 text-xs text-text-secondary">
                Version {WAIVER_VERSION} - Source:{" "}
                <a href={WAIVER_SOURCE_URL} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  signed PDF
                </a>
              </p>
            </div>

            <ul className="list-disc space-y-1 pl-5 text-sm text-text-secondary">
              {WAIVER_CERTIFICATION_BULLETS.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="driverLicenseNumber" className="block text-sm font-medium text-foreground">
                  Driver&apos;s License Number
                </label>
                <input
                  type="text"
                  id="driverLicenseNumber"
                  name="driverLicenseNumber"
                  className={`w-full rounded-lg border bg-background px-4 py-3 text-foreground placeholder:text-text-secondary ${
                    state?.errors?.driverLicenseNumber ? "border-red-500" : "border-input"
                  }`}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="licenseState" className="block text-sm font-medium text-foreground">
                  State of Issuance
                </label>
                <input
                  type="text"
                  id="licenseState"
                  name="licenseState"
                  className={`w-full rounded-lg border bg-background px-4 py-3 text-foreground placeholder:text-text-secondary ${
                    state?.errors?.licenseState ? "border-red-500" : "border-input"
                  }`}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="vehicle" className="block text-sm font-medium text-foreground">
                  Vehicle Make and Model
                </label>
                <input
                  type="text"
                  id="vehicle"
                  name="vehicle"
                  placeholder="e.g. 2019 Honda Civic"
                  className={`w-full rounded-lg border bg-background px-4 py-3 text-foreground placeholder:text-text-secondary ${
                    state?.errors?.vehicle ? "border-red-500" : "border-input"
                  }`}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="licensePlate" className="block text-sm font-medium text-foreground">
                  License Plate Number
                </label>
                <input
                  type="text"
                  id="licensePlate"
                  name="licensePlate"
                  className={`w-full rounded-lg border bg-background px-4 py-3 text-foreground placeholder:text-text-secondary ${
                    state?.errors?.licensePlate ? "border-red-500" : "border-input"
                  }`}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="emergencyContactName" className="block text-sm font-medium text-foreground">
                  Emergency Contact Name
                </label>
                <input
                  type="text"
                  id="emergencyContactName"
                  name="emergencyContactName"
                  className={`w-full rounded-lg border bg-background px-4 py-3 text-foreground placeholder:text-text-secondary ${
                    state?.errors?.emergencyContactName ? "border-red-500" : "border-input"
                  }`}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="emergencyContactPhone" className="block text-sm font-medium text-foreground">
                  Emergency Contact Phone
                </label>
                <input
                  type="tel"
                  id="emergencyContactPhone"
                  name="emergencyContactPhone"
                  placeholder="(555) 123-4567"
                  className={`w-full rounded-lg border bg-background px-4 py-3 text-foreground placeholder:text-text-secondary ${
                    state?.errors?.emergencyContactPhone ? "border-red-500" : "border-input"
                  }`}
                />
                {state?.errors?.emergencyContactPhone && (
                  <p className="text-sm text-red-500" role="alert">
                    {state.errors.emergencyContactPhone[0]}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="signature" className="block text-sm font-medium text-foreground">
                Full Name as Signature <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="signature"
                name="signature"
                required
                placeholder="Type your full legal name"
                className={`w-full rounded-lg border bg-background px-4 py-3 text-foreground placeholder:text-text-secondary ${
                  state?.errors?.signature ? "border-red-500" : "border-input"
                }`}
                aria-invalid={state?.errors?.signature ? "true" : "false"}
              />
              {state?.errors?.signature && (
                <p className="text-sm text-red-500" role="alert">
                  {state.errors.signature[0]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="waiverAcknowledged"
                  defaultChecked={false}
                  className="mt-1 h-4 w-4 text-primary border-input focus:ring-primary rounded"
                />
                <span className="text-sm text-foreground">
                  I have read and agree to the Liability Waiver and Acknowledgment above. <span className="text-red-500">*</span>
                </span>
              </label>
              {state?.errors?.waiverAcknowledged && (
                <p className="text-sm text-red-500" role="alert">
                  {state.errors.waiverAcknowledged[0]}
                </p>
              )}
            </div>
          </fieldset>
        )}

        {state?.message && state.message !== "success" && (
          <div className="rounded-lg bg-red-50 p-4 text-red-600" role="alert">
            {state.message}
          </div>
        )}

        {state?.message === "success" && (
          <div className="rounded-lg bg-green-50 p-4 text-green-600" role="status">
            Thank you for volunteering! You&apos;re signed up for: {state.selectedDates}. We&apos;ll be in touch soon with details.
            {state.accountCreated && (
              <p className="mt-2">
                We also created an account for you to manage your signups. Check your email for a temporary password — an admin must approve your account before you can sign in.
              </p>
            )}
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
"use client";

import { useActionState } from "react";
import { cancelVolunteerSignup } from "@/app/actions/volunteer";
import type {
  CancelVolunteerSignupState,
  VolunteerSignupWithDeliveries,
} from "@/app/lib/definitions";

function formatDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

export function SignupsSection({
  signups,
}: {
  signups: VolunteerSignupWithDeliveries[];
}) {
  const [state, action, pending] = useActionState<
    CancelVolunteerSignupState,
    FormData
  >(cancelVolunteerSignup, undefined);

  if (signups.length === 0) {
    return (
      <div className="rounded-lg border border-primary/10 bg-card p-6 text-text-secondary">
        No upcoming signups. Sign up on the{" "}
        <a
          href="/programs/meal-delivery/volunteer-signup"
          className="text-primary hover:underline"
        >
          volunteer page
        </a>
        .
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {state?.message && (
        <p
          className={`text-sm ${
            state.success ? "text-green-600" : "text-red-600"
          }`}
          role={state.success ? "status" : "alert"}
        >
          {state.message}
        </p>
      )}

      {signups.map((signup) => (
        <div
          key={signup.id}
          className="rounded-lg border border-primary/10 bg-card p-5"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                {formatDate(signup.delivery_date)}
              </h3>
              <p className="mt-1 text-sm text-text-secondary">
                Regions: {signup.regions}
              </p>
              <p className="text-sm text-text-secondary">
                On Signal: {signup.on_signal}
              </p>
            </div>
            <form
              action={action}
              onSubmit={(e) => {
                if (
                  !confirm("Cancel this signup date and its deliveries?")
                ) {
                  e.preventDefault();
                }
              }}
            >
              <input type="hidden" name="signupId" value={signup.id} />
              <button
                type="submit"
                disabled={pending}
                className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-50 disabled:opacity-50"
              >
                Cancel
              </button>
            </form>
          </div>

          {signup.deliveries.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-semibold text-foreground">
                Assigned Deliveries
              </h4>
              {signup.deliveries.map((delivery) => (
                <div
                  key={delivery.meal_signup_id}
                  className="rounded-md bg-background p-3 text-sm"
                >
                  <p className="font-medium text-foreground">
                    {delivery.recipient_name}
                  </p>
                  <p className="text-text-secondary">
                    {delivery.recipient_phone}
                  </p>
                  <p className="text-text-secondary">
                    {delivery.recipient_address}
                  </p>
                  {delivery.comments && (
                    <p className="mt-1 text-text-secondary">
                      Notes: {delivery.comments}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

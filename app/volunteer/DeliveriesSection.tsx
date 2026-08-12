"use client";

import type { VolunteerSignupWithDeliveries } from "@/app/lib/definitions";

function formatDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

export function DeliveriesSection({
  signups,
}: {
  signups: VolunteerSignupWithDeliveries[];
}) {
  const withDeliveries = signups
    .filter((s) => s.deliveries.length > 0)
    .sort((a, b) => a.delivery_date.localeCompare(b.delivery_date));

  if (withDeliveries.length === 0) {
    return (
      <div className="rounded-lg border border-primary/10 bg-card p-6 text-text-secondary">
        No deliveries assigned yet. Check back once deliveries are assigned to your signup dates.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {withDeliveries.map((signup) => (
        <section key={signup.id} className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">
            {formatDate(signup.delivery_date)}
          </h3>
          {signup.deliveries.map((delivery) => (
            <div
              key={delivery.meal_signup_id}
              className="rounded-lg border border-primary/10 bg-card p-4 text-sm"
            >
              <p className="font-medium text-foreground">
                {delivery.recipient_name}
              </p>
              <p className="text-text-secondary">{delivery.recipient_phone}</p>
              <p className="text-text-secondary">{delivery.recipient_address}</p>
              {delivery.comments && (
                <p className="mt-1 text-text-secondary">
                  Notes: {delivery.comments}
                </p>
              )}
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}

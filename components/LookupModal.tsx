"use client";

import { useState } from "react";
import { getMyMealSignups, getMyDriverVolunteerSignups, getMyDonationSignups, getMyVolunteerMealSignups } from "@/app/actions/lookup-signups";
import type { MealSignup, DriverVolunteer, VolunteerSignupWithDay } from "@/app/lib/definitions";

interface LookupModalProps {
  type: "meal" | "driver" | "donation" | "volunteer-meal";
  onClose: () => void;
}

export function LookupModal({ type, onClose }: LookupModalProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [mealSignups, setMealSignups] = useState<MealSignup[] | null>(null);
  const [driverSignups, setDriverSignups] = useState<DriverVolunteer[] | null>(null);
  const [donationSignups, setDonationSignups] = useState<any[] | null>(null);
  const [volunteerMealSignups, setVolunteerMealSignups] = useState<VolunteerSignupWithDay[] | null>(null);
  const [error, setError] = useState("");

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (type === "meal") {
      const result = await getMyMealSignups(email);
      if (result.error) {
        setError(result.error);
      } else {
        setMealSignups(result.signups);
      }
    } else if (type === "driver") {
      const result = await getMyDriverVolunteerSignups(email);
      if (result.error) {
        setError(result.error);
      } else {
        setDriverSignups(result.signups);
      }
    } else if (type === "volunteer-meal") {
      const result = await getMyVolunteerMealSignups(email);
      if (result.error) {
        setError(result.error);
      } else {
        setVolunteerMealSignups(result.signups as VolunteerSignupWithDay[]);
      }
    } else {
      const result = await getMyDonationSignups(email);
      if (result.error) {
        setError(result.error);
      } else {
        setDonationSignups(result.signups);
      }
    }

    setLoading(false);
  }

  const title =
    type === "meal" ? "Your Meal Delivery Signups" :
    type === "driver" ? "Your Driver Volunteer Signups" :
    type === "volunteer-meal" ? "Your Kitchen Volunteer Signups" :
    "Your Donation Pledges";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-xl bg-background p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-foreground">{title}</h3>
          <button onClick={onClose} className="text-text-secondary hover:text-foreground" aria-label="Close">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {!mealSignups && !driverSignups && !donationSignups && !volunteerMealSignups ? (
          <form onSubmit={handleLookup} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="lookup-email" className="block text-sm font-medium text-foreground">
                Enter your email address to look up your signups
              </label>
              <input
                type="email"
                id="lookup-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground placeholder:text-text-secondary focus:border-primary focus:ring-primary"
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? "Looking up..." : "Look Up My Signups"}
            </button>
          </form>
        ) : (
          <div className="space-y-3">
            {type === "meal" && mealSignups && mealSignups.length === 0 && (
              <p className="text-text-secondary">No upcoming signups found for this email.</p>
            )}
            {type === "driver" && driverSignups && driverSignups.length === 0 && (
              <p className="text-text-secondary">No upcoming volunteer signups found for this email.</p>
            )}
            {type === "donation" && donationSignups && donationSignups.length === 0 && (
              <p className="text-text-secondary">No donation pledges found for this email.</p>
            )}
            {type === "volunteer-meal" && volunteerMealSignups && volunteerMealSignups.length === 0 && (
              <p className="text-text-secondary">No kitchen volunteer signups found for this email.</p>
            )}
            {type === "meal" &&
              mealSignups?.map((signup) => (
                <div key={signup.id} className="rounded-lg border border-primary/10 p-3">
                  <p className="font-medium text-foreground">
                    {new Date(signup.delivery_date).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                  <p className="text-sm text-text-secondary">
                    {signup.regular_quantity > 0 && `${signup.regular_quantity} Regular`}
                    {signup.regular_quantity > 0 && signup.vegan_quantity > 0 && " + "}
                    {signup.vegan_quantity > 0 && `${signup.vegan_quantity} Vegan`}
                  </p>
                </div>
              ))}
            {type === "driver" &&
              driverSignups?.map((signup) => (
                <div key={signup.id} className="rounded-lg border border-primary/10 p-3">
                  <p className="font-medium text-foreground">
                    {new Date(signup.delivery_date).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                  <p className="text-sm text-text-secondary">Regions: {signup.regions}</p>
                </div>
              ))}
            {type === "donation" &&
              donationSignups?.map((signup) => (
                <div key={signup.id} className="rounded-lg border border-primary/10 p-3">
                  <p className="font-medium text-foreground">{signup.item_name}</p>
                  <p className="text-sm text-text-secondary">
                    {signup.quantity_pledged} {signup.unit} · {signup.status} · {new Date(signup.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            {type === "volunteer-meal" &&
              volunteerMealSignups?.map((signup) => (
                <div key={signup.id} className="rounded-lg border border-primary/10 p-3">
                  <p className="font-medium text-foreground">
                    {new Date(signup.day_date + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" })}
                  </p>
                  <p className="text-sm text-text-secondary">
                    Role: {signup.role} · {signup.is_group ? `Group: ${signup.group_name} (${signup.headcount})` : "Individual"} · {signup.status}
                  </p>
                </div>
              ))}
            <button
              onClick={() => {
                setMealSignups(null);
                setDriverSignups(null);
                setDonationSignups(null);
                setVolunteerMealSignups(null);
                setEmail("");
              }}
              className="w-full rounded-lg border border-input px-4 py-2 text-sm font-medium text-foreground hover:bg-primary/5"
            >
              Look Up Another Email
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

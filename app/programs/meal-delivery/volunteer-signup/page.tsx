import { DriverVolunteerForm } from "@/components/DriverVolunteerForm";

export default function VolunteerSignupPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="mb-6 text-4xl font-bold">Volunteer to Deliver Meals</h1>

      <div className="space-y-6 text-lg text-text-secondary">
        <p>
          Help deliver meals to those who can&apos;t get to town. We need volunteer drivers for Wednesdays and Thursdays
          to pick up meals in Athens and deliver them to surrounding communities.
        </p>

        <p>
          Deliveries typically take about 1 hour. You&apos;ll pick up meals from our partner locations and deliver to
          households in Athens, The Plains, Chauncey, Canaanville, New Marshfield, and Athens Township.
        </p>

        <p>
          Sign up for the dates you&apos;re available below. We&apos;ll confirm your schedule and provide details.
        </p>
      </div>

      <div className="mt-10">
        <DriverVolunteerForm />
      </div>
    </main>
  );
}
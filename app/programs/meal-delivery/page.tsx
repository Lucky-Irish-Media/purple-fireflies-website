export default function MealDeliveryPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="mb-6 text-4xl font-bold">Meal Delivery</h1>

      <div className="space-y-6 text-lg text-text-secondary">
        <p>
          In our county, there&apos;s a stark divide: a wealthy university town surrounded by
          communities facing deep poverty. While the town has multiple organizations offering
          free meals, these resources primarily serve students and those with transportation
          to get there.
        </p>

        <p>
          For many residents throughout the county, lack of transportation creates an
          insurmountable barrier. They can&apos;t access the free meals available just miles away,
          leaving them without options for nutritious food.
        </p>

        <h2 className="mt-8 mb-4 text-2xl font-semibold text-foreground">
          Our Solution
        </h2>

        <p>
          The Meal Delivery program bridges this gap. We recruit volunteers who travel to
          the free meal organizations in town, pick up meals, and deliver them directly to
          people in need throughout the county.
        </p>

        <h2 className="mt-8 mb-4 text-2xl font-semibold text-foreground">
          Delivery Regions
        </h2>

        <p>
          We deliver up to 20 minutes from Athens Uptown. If you are more than 20 minutes from the meal pickup location, we may contact you to let you know we do not have a driver available that can accommodate the request.
        </p>

        <h2 className="mt-8 mb-4 text-2xl font-semibold text-foreground">
          Get Involved
        </h2>

        <p>
          This program relies entirely on community solidarity. Whether you need meals
          delivered or you can volunteer to make deliveries, we&apos;re building a network
          of mutual aid to ensure no one goes hungry.
        </p>

        <div className="mt-8 flex gap-4">
          <div className="flex-1 rounded-lg border bg-background p-6">
            <h3 className="mb-2 text-xl font-semibold text-foreground">
              Receive a Meal
            </h3>
            <p className="mb-4 text-sm">
              Sign up to receive meal deliveries in your area. We deliver on Wednesdays at 12:00 PM and Thursdays at 5:00 PM.
            </p>
            <a
              href="/programs/meal-delivery/delivery-signup"
              className="inline-block text-sm font-medium text-primary hover:underline"
            >
              Sign Up for Meal Delivery →
            </a>
          </div>

          <div className="flex-1 rounded-lg border bg-background p-6">
            <h3 className="mb-2 text-xl font-semibold text-foreground">
              Deliver Meals
            </h3>
            <p className="mb-4 text-sm">
              Help deliver meals to those who can&apos;t get to town.
            </p>
            <a
              href="/programs/meal-delivery/volunteer-signup"
              className="inline-block text-sm font-medium text-primary hover:underline"
            >
              Sign Up to Volunteer →
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}

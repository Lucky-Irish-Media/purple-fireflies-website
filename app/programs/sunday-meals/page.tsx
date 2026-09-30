import Link from "next/link";

export const metadata = {
  title: "Sunday Meals | Purple Fireflies",
  description:
    "A meal made by neighbors, for neighbors. Sign up to cook once a month for six months and serve 15 individually made plates.",
};

export default function SundayMealsPage() {
  return (
    <div className="flex flex-col flex-1 font-sans">
      {/* Hero */}
      <section
        style={{ background: "linear-gradient(160deg, #3b0764 0%, #5B21B6 45%, #7C3AED 100%)" }}
      >
        <div className="px-4 pt-16 pb-0 text-center">
          <div className="max-w-2xl mx-auto">
            <span
              className="inline-block rounded-full px-4 py-1.5 text-sm font-semibold text-white mb-5"
              style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)" }}
            >
              Programs
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white leading-tight mb-4">
              Sunday Meals
            </h1>
            <p className="text-lg leading-8 mb-10" style={{ color: "rgba(255,255,255,0.75)", maxWidth: 560, margin: "0 auto 2.5rem" }}>
              A meal made by neighbors, for neighbors. Cook once a month, serve fifteen
              plates, and put something real on the table for people who need it.
            </p>
          </div>
        </div>
      </section>

      {/* Body content */}
      <section className="px-4 py-16 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground mb-3">What Sunday Meals Is</h2>
          <div className="space-y-5 text-lg text-text-secondary leading-relaxed mb-12">
            <p>
              Most of our food programs move meals that were made somewhere else. Meal
              Delivery picks up prepared food from partner organizations in town.
              Springfield Neighbors collects donated shelf-stable goods and gets them to
              families who cannot come out for them.
            </p>
            <p>
              Sunday Meals is different. The food is cooked by people in this community, for
              people in this community. There is no partner kitchen and nothing picked up
              from a shelf. Neighbors make a meal, and they serve it to their neighbors.
            </p>
            <p>
              Because home kitchens have limits, every cook serves fifteen plates rather
              than trying to feed a crowd. The food is made in individually portioned
              plates, so someone taking one plate is getting a real, complete meal and not
              a share of a communal pot.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-3">The Commitment</h2>
          <div className="space-y-5 text-lg text-text-secondary leading-relaxed mb-12">
            <p>
              This is a real commitment, and we want to be upfront about it before you sign
              up. Cooking for Sunday Meals means:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong className="text-foreground">Once a month, for six months.</strong> You
                cook one Sunday each month for a six-month term. After that we check in with
                you about continuing.
              </li>
              <li>
                <strong className="text-foreground">Fifteen individually made plates.</strong> Enough
                food for fifteen people, plated up individually rather than served from one
                shared dish.
              </li>
              <li>
                <strong className="text-foreground">One Sunday of the month that works for you.</strong>{" "}
                You tell us which Sunday is usually good and we build the calendar around
                the cooks we have.
              </li>
            </ul>
            <p>
              We are asking for a six-month term because that is what makes a program like
              this dependable. Knowing a cook is committed for half a year is what lets us
              tell our neighbors there will be a meal on the first Sunday of next month with
              confidence.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-3">How It Works</h2>
          <div className="space-y-4 text-lg text-text-secondary leading-relaxed mb-12">
            <ol className="list-decimal pl-6 space-y-2">
              <li>
                You sign up once and tell us which Sunday of the month generally works for
                you.
              </li>
              <li>
                We build the monthly calendar and confirm your specific date with you ahead
                of time.
              </li>
              <li>
                You cook, plate up fifteen meals, and bring them to the agreed location. We
                confirm logistics and timing when we schedule your first Sunday.
              </li>
              <li>
                Your neighbors come, get a plate, and eat a meal someone in this community
                made for them.
              </li>
            </ol>
            <p>
              You are not committing to a specific date right now. Sundays move around month
              to month, so we confirm each one with you rather than asking you to hold a date
              months in advance.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-3">Who Can Cook</h2>
          <div className="space-y-5 text-lg text-text-secondary leading-relaxed mb-12">
            <p>
              Anyone with a kitchen and a willingness to cook for fifteen people can join
              this. You do not need a culinary background, a restaurant license, or any
              experience feeding people at scale. A home kitchen making a pot of stew, a
              tray of baked sides, and a dessert is exactly the scale this program is built
              for.
            </p>
            <p>
              A few things we do ask:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Tell us honestly about what you can cook and any allergies or diets you can
                accommodate. We plan around real constraints rather than finding out the day
                of.
              </li>
              <li>
                Cook within basic food safety practice. If you are not sure, ask us. We would
                rather answer the question than have you guess.
              </li>
              <li>
                Let us know early if a month is going to be hard. Missing a month is a
                conversation, not a failure, and we would much rather hear from you than
                have a gap on the calendar.
              </li>
            </ul>
            <p>
              Family members, friends, and whole households can cook together. If two cooks
              each commit to fifteen plates, that is thirty neighbors fed. Extra hands in a
              kitchen are always welcome.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-3">Common Questions</h2>
          <div className="space-y-5 text-lg text-text-secondary leading-relaxed mb-12">
            <div>
              <p className="font-medium text-foreground">Do I need a commercial kitchen?</p>
              <p>
                No. A normal home kitchen is what this program is designed around. We will
                confirm the location and setup when we schedule your first Sunday.
              </p>
            </div>
            <div>
              <p className="font-medium text-foreground">What if I miss a month?</p>
              <p>
                Tell us as early as you can. We keep a roster of cooks, so if you need a
                given month we can look for someone else to cover it rather than leaving a
                gap.
              </p>
            </div>
            <div>
              <p className="font-medium text-foreground">Can I bring someone to help?</p>
              <p>
                Yes, and please say so on the signup. More hands means the fifteen plates
                are less work for you.
              </p>
            </div>
            <div>
              <p className="font-medium text-foreground">Do I need to provide ingredients?</p>
              <p>
                Not to start. Some cooks buy their own ingredients, some donate, and we have
                discussed covering costs. We will be clear about what applies when we confirm
                your first date.
              </p>
            </div>
            <div>
              <p className="font-medium text-foreground">What happens after six months?</p>
              <p>
                We check in and ask if you want to keep cooking. Some people continue
                indefinitely, some take a break, and some bring a new cook in their place.
                There is no pressure either way.
              </p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-6">Get Involved</h2>
          <div className="max-w-md">
            <div
              className="rounded-xl p-6 flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
              style={{
                background: "#fff",
                border: "1px solid rgba(124,58,237,0.12)",
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              }}
            >
              <div
                className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl text-xl"
                style={{ background: "rgba(124,58,237,0.08)" }}
              >
                🍳
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Sign Up to Cook</h3>
              <p className="text-sm text-text-secondary leading-relaxed flex-1">
                Commit to cooking once a month for six months and serving fifteen
                individually made plates. Tell us which Sunday works for you.
              </p>
              <Link
                href="/programs/sunday-meals/signup"
                className="mt-5 inline-flex items-center gap-1 text-sm font-semibold transition-colors"
                style={{ color: "#7C3AED" }}
              >
                Sign up to cook →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

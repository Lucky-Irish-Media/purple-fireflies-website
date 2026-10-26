export const metadata = {
  title: "About Us | Purple Fireflies",
  description:
    "The story of Purple Fireflies: how a November SNAP pause and the November Grocery Buddy led to meal and pet programs in Athens County, Ohio, and why we are named Purple Fireflies.",
};

export default function AboutPage() {
  return (
    <div className="flex flex-col flex-1 font-sans">
      {/* Hero */}
      <section
        style={{ background: "linear-gradient(160deg, #3b0764 0%, #5B21B6 45%, #7C3AED 100%)" }}
      >
        <div className="px-4 pt-16 pb-12 text-center">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white leading-tight mb-4">
              About Purple Fireflies
            </h1>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="px-4 py-16 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="space-y-6 text-lg text-text-secondary leading-relaxed">
            <p>
              Purple Fireflies believe in community helping community. We operate on the belief that we all need help at times, and we each want to do our part to help our community.
            </p>
            <p>
              The idea of Purple Fireflies came about in November of 2025, when SNAP benefits were paused for the month. The Link family started the November Grocery Buddy that helped feed 150 households that month. We noticed that many families were unable to secure transportation to access the extra food or free meals offered in Athens city limits. This led us to start this nonprofit organization to continue to get meals to people that would be unable to easily access these services, hence the Meal Program.
            </p>
            <p>
              While delivering meals and getting to know people in our community, we noticed that many were caring for pets or neighborhood cats/dogs. As a pet owner ourselves, we talked about the challenges of paying for vet bills and pet food. Many of those involved with Purple Fireflies were talking about how we could help people care for their pets since individually we were unable to financially help. The Pet Program was started to help each other care for our furry loved ones.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-foreground mt-16 mb-6">
            Why the name Purple Fireflies?
          </h2>
          <div className="space-y-6 text-lg text-text-secondary leading-relaxed">
            <p>
              Purple is a favorite color and doesn't identify with any group, which was important since our organization's goal is to embrace the diversity of our community while bridging what may divide us. Fireflies has a special meaning that is tied to Ohio specifically for us. We were new to Athens, Ohio, previously living on the west side of the country, and our first summer here was magical. It was the first time we had seen fireflies. So, fireflies will always in our heart be associated with Ohio.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

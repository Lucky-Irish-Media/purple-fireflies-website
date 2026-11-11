import { SponsorAPetSignupForm } from "@/components/SponsorAPetSignupForm";

export const metadata = {
  title: "Apply to Sponsor a Pet | Purple Fireflies",
  description: "Apply to have your pet considered for the Sponsor a Pet Program.",
};

export default function SponsorAPetApplyPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <SponsorAPetSignupForm />
    </main>
  );
}
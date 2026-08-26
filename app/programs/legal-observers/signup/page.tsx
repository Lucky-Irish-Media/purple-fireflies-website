import { LegalObserverSignupForm } from "@/components/LegalObserverSignupForm";

export const metadata = {
  title: "Legal Observer Signup | Purple Fireflies",
  description: "Sign up to become a trained Legal Observer and help document government conduct at protests.",
};

export default function LegalObserverSignupPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <LegalObserverSignupForm />
    </main>
  );
}

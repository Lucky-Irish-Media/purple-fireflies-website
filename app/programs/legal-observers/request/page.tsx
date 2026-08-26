import { LegalObserverRequestForm } from "@/components/LegalObserverRequestForm";

export const metadata = {
  title: "Request Legal Observer Coverage | Purple Fireflies",
  description: "Request Legal Observer coverage for your protest, action, or community event.",
};

export default function LegalObserverRequestPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <LegalObserverRequestForm />
    </main>
  );
}

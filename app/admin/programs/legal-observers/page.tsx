import { getLegalObserverSignups, getLegalObserverRequests } from "@/app/lib/db";
import LegalObserverTabs from "./LegalObserverTabs";

export default async function AdminLegalObserversPage() {
  const [signups, requests] = await Promise.all([
    getLegalObserverSignups(),
    getLegalObserverRequests(),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-foreground">Legal Observers</h1>
      <LegalObserverTabs signups={signups} requests={requests} />
    </div>
  );
}

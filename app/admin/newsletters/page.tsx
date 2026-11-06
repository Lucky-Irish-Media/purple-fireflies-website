import { getNewsletters, getConfirmedSubscribers, getNewsletterSubscribers, getSubscriberCounts } from "@/app/lib/db";
import { verifySession } from "@/app/lib/dal";
import NewslettersTabs from "./NewslettersTabs";

export default async function AdminNewslettersPage() {
  const session = await verifySession();
  const [newsletters, confirmedSubscribers, subscribers, counts] = await Promise.all([
    getNewsletters(),
    getConfirmedSubscribers(),
    getNewsletterSubscribers(),
    getSubscriberCounts(),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-foreground">Newsletters</h1>
      <NewslettersTabs
        newsletters={newsletters}
        canSend={session.role === "admin"}
        canEdit={session.role === "admin" || session.role === "content_editor"}
        confirmedSubscriberCount={confirmedSubscribers.length}
        subscribers={subscribers}
        counts={counts}
        canManageSubscribers={session.role === "admin"}
      />
    </div>
  );
}

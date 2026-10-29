import { getNewsletters } from "@/app/lib/db";
import { verifySession } from "@/app/lib/dal";
import NewslettersTable from "@/app/admin/NewslettersTable";

export default async function AdminNewslettersPage() {
  const session = await verifySession();
  const newsletters = await getNewsletters();

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-foreground">Newsletters</h1>
      <NewslettersTable
        initialNewsletters={newsletters}
        canSend={session.role === "admin"}
        canEdit={session.role === "admin" || session.role === "content_editor"}
      />
    </div>
  );
}
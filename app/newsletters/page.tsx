import Link from "next/link";
import { getPublishedNewsletters } from "@/app/lib/db";
import type { Newsletter } from "@/app/lib/definitions";
import NewsletterSubscribeForm from "@/components/NewsletterSubscribeForm";

export const dynamic = "force-dynamic";

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr.includes("T") ? dateStr : dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default async function NewslettersPage() {
  const newsletters = await getPublishedNewsletters();

  return (
    <div className="flex flex-col flex-1 font-sans">
      <section
        style={{ background: "linear-gradient(160deg, #3b0764 0%, #5B21B6 45%, #7C3AED 100%)" }}
      >
        <div className="px-4 py-16 text-center">
          <div className="max-w-2xl mx-auto">
            <span
              className="inline-block rounded-full px-4 py-1.5 text-sm font-semibold text-white mb-5"
              style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)" }}
            >
              Stay connected
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white leading-tight mb-4">
              Newsletters
            </h1>
            <p className="text-lg leading-8 mb-10" style={{ color: "rgba(255,255,255,0.75)", maxWidth: 520, margin: "0 auto" }}>
              Semi-regular updates from Purple Fireflies. Subscribe to receive them in your inbox.
            </p>
            <div className="max-w-md mx-auto">
              <NewsletterSubscribeForm />
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground mb-6">Past Issues</h2>
          {newsletters.length === 0 ? (
            <p className="text-sm text-text-secondary">No newsletters published yet. Check back soon.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {newsletters.map((n: Newsletter) => (
                <Link
                  key={n.id}
                  href={`/newsletters/${n.slug}`}
                  className="rounded-xl p-6 flex flex-col transition-all hover:-translate-y-1 hover:shadow-md"
                  style={{
                    background: "#fff",
                    border: "1px solid rgba(124,58,237,0.12)",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                  }}
                >
                  <h3 className="text-lg font-bold text-foreground mb-1">{n.title}</h3>
                  <p className="text-sm text-text-secondary mb-2">{formatDate(n.published_at || n.created_at)}</p>
                  {n.excerpt && <p className="text-sm text-text-secondary leading-relaxed">{n.excerpt}</p>}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
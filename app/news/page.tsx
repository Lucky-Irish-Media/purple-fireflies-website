import Link from "next/link";
import { getNewsArticles, getPublishedNewsletters } from "@/app/lib/db";
import type { NewsArticle, Newsletter } from "@/app/lib/definitions";
import NewsletterSubscribeForm from "@/components/NewsletterSubscribeForm";

export const dynamic = "force-dynamic";

function formatPublishDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-");
  return `${month}/${day}/${year}`;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr.includes("T") ? dateStr : dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function ArticleCard({ article }: { article: NewsArticle }) {
  return (
    <div
      className="rounded-xl p-6 flex flex-col"
      style={{
        background: "#fff",
        border: "1px solid rgba(124,58,237,0.12)",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-lg font-bold text-foreground mb-1">
          <Link
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#7C3AED" }}
            className="hover:underline"
          >
            {article.title}
          </Link>
        </h3>
      </div>

      <div className="mb-3 space-y-1 text-sm text-text-secondary">
        <p>
          <span className="font-medium text-foreground">{article.source}</span>
          {" · "}
          {formatPublishDate(article.published_at)}
        </p>
      </div>

      {article.excerpt && (
        <p className="text-sm text-text-secondary leading-relaxed">{article.excerpt}</p>
      )}
    </div>
  );
}

function NewsletterCard({ newsletter }: { newsletter: Newsletter }) {
  return (
    <Link
      href={`/newsletters/${newsletter.slug}`}
      className="rounded-xl p-6 flex flex-col transition-all hover:-translate-y-1 hover:shadow-md"
      style={{
        background: "#fff",
        border: "1px solid rgba(124,58,237,0.12)",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      }}
    >
      <h3 className="text-lg font-bold text-foreground mb-1">{newsletter.title}</h3>
      <p className="text-sm text-text-secondary mb-2">{formatDate(newsletter.published_at || newsletter.created_at)}</p>
      {newsletter.excerpt && <p className="text-sm text-text-secondary leading-relaxed">{newsletter.excerpt}</p>}
    </Link>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div
      className="rounded-xl p-8 text-center text-sm text-text-secondary"
      style={{
        background: "#fff",
        border: "1px solid rgba(124,58,237,0.12)",
      }}
    >
      {message}
    </div>
  );
}

export default async function NewsPage() {
  const [articles, newsletters] = await Promise.all([
    getNewsArticles(),
    getPublishedNewsletters(),
  ]);

  return (
    <div className="flex flex-col flex-1 font-sans">
      {/* Hero */}
      <section
        style={{ background: "linear-gradient(160deg, #3b0764 0%, #5B21B6 45%, #7C3AED 100%)" }}
      >
        <div className="px-4 py-16 text-center">
          <div className="max-w-2xl mx-auto">
            <span
              className="inline-block rounded-full px-4 py-1.5 text-sm font-semibold text-white mb-5"
              style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)" }}
            >
              News & Updates
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white leading-tight mb-4">
              News & Updates
            </h1>
            <p className="text-lg leading-8 mb-10" style={{ color: "rgba(255,255,255,0.75)", maxWidth: 520, margin: "0 auto" }}>
              Articles and coverage about Purple Fireflies, plus our latest newsletter issues.
            </p>
            <div className="max-w-md mx-auto">
              <NewsletterSubscribeForm />
            </div>
          </div>
        </div>
      </section>

      {/* News Articles */}
      <section className="px-4 py-16 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground mb-6">News Articles</h2>

          {articles.length === 0 ? (
            <EmptyState message="No news articles yet. Check back soon." />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletters */}
      <section id="newsletters" className="px-4 py-16 bg-gray-50 border-t border-primary/10">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground mb-6">Newsletters</h2>
          {newsletters.length === 0 ? (
            <p className="text-sm text-text-secondary">No newsletters published yet. Check back soon.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {newsletters.map((n: Newsletter) => (
                <NewsletterCard key={n.id} newsletter={n} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
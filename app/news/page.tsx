import Link from "next/link";
import { getNewsArticles } from "@/app/lib/db";
import type { NewsArticle } from "@/app/lib/definitions";

export const dynamic = "force-dynamic";

function formatPublishDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-");
  return `${month}/${day}/${year}`;
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

function EmptyState() {
  return (
    <div
      className="rounded-xl p-8 text-center text-sm text-text-secondary"
      style={{
        background: "#fff",
        border: "1px solid rgba(124,58,237,0.12)",
      }}
    >
      No news articles yet. Check back soon.
    </div>
  );
}

export default async function NewsPage() {
  const articles = await getNewsArticles();

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
              Community
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white leading-tight mb-4">
              News
            </h1>
            <p className="text-lg leading-8 mb-10" style={{ color: "rgba(255,255,255,0.75)", maxWidth: 520, margin: "0 auto" }}>
              Articles and coverage about Purple Fireflies and our work around Athens County.
            </p>
          </div>
        </div>
      </section>

      {/* Body content */}
      <section className="px-4 py-16 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground mb-6">Latest Articles</h2>

          {articles.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

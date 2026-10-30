import Link from "next/link";
import { notFound } from "next/navigation";
import { getNewsletterBySlug } from "@/app/lib/db";

export const dynamic = "force-dynamic";

export default async function NewsletterDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const newsletter = await getNewsletterBySlug(slug);
  if (!newsletter || (newsletter.status !== "published" && newsletter.status !== "sent")) {
    notFound();
  }

  return (
    <div className="flex flex-col flex-1 font-sans">
      <section
        style={{ background: "linear-gradient(160deg, #3b0764 0%, #5B21B6 45%, #7C3AED 100%)" }}
      >
        <div className="px-4 py-12 text-center">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight mb-3">
              {newsletter.title}
            </h1>
            {newsletter.published_at && (
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.75)" }}>
                {new Date(newsletter.published_at.includes("T") ? newsletter.published_at : newsletter.published_at + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="px-4 py-12 bg-white">
        <div className="max-w-3xl mx-auto">
          <div
            className="prose max-w-none text-foreground"
            dangerouslySetInnerHTML={{ __html: newsletter.body || "" }}
          />
          <div className="mt-8">
            <Link href="/newsletters" className="text-primary hover:underline">
              ← Back to newsletters
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
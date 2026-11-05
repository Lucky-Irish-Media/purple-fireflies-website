import Link from "next/link";
import { notFound } from "next/navigation";
import { getEventBySlug } from "@/app/lib/db";
import type { Event } from "@/app/lib/definitions";

export const dynamic = "force-dynamic";

function formatEventDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-");
  return `${month}/${day}/${year}`;
}

function formatTimeRange(event: Event): string {
  if (event.start_time && event.end_time) {
    return `${event.start_time} – ${event.end_time}`;
  }
  return event.start_time || event.end_time || "";
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event || event.status !== "published") {
    notFound();
  }

  const time = formatTimeRange(event);

  return (
    <div className="flex flex-col flex-1 font-sans">
      {/* Hero */}
      <section
        style={{ background: "linear-gradient(160deg, #3b0764 0%, #5B21B6 45%, #7C3AED 100%)" }}
      >
        <div className="px-4 py-12 text-center">
          <div className="max-w-3xl mx-auto">
            <Link
              href="/events"
              className="text-sm font-semibold text-white/70 transition-colors hover:text-white"
            >
              ← Back to events
            </Link>
            <h1 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight mb-3">
              {event.title}
            </h1>
            <div className="space-y-1 text-sm" style={{ color: "rgba(255,255,255,0.75)" }}>
              <p>
                <span className="font-medium">{formatEventDate(event.event_date)}</span>
                {time && ` at ${time}`}
              </p>
              {event.location && <p>{event.location}</p>}
            </div>
            {event.url && (
              <div className="mt-4">
                <Link
                  href={event.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block rounded-full px-4 py-1.5 text-sm font-semibold text-white"
                  style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)" }}
                >
                  Event Details →
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="px-4 py-12 bg-white">
        <div className="max-w-3xl mx-auto">
          {event.description && (
            <p className="text-lg text-text-secondary leading-relaxed mb-6">{event.description}</p>
          )}
          {event.body && (
            <div
              className="prose max-w-none text-foreground"
              dangerouslySetInnerHTML={{ __html: event.body }}
            />
          )}
          <div className="mt-8">
            <Link href="/events" className="text-primary hover:underline">
              ← Back to events
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
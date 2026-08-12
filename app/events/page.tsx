import Link from "next/link";
import { getUpcomingEvents, getPastEvents } from "@/app/lib/db";
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

function EventCard({ event }: { event: Event }) {
  const time = formatTimeRange(event);

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
        <h3 className="text-lg font-bold text-foreground mb-1">{event.title}</h3>
        {event.url && (
          <Link
            href={event.url}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 text-sm font-semibold transition-colors"
            style={{ color: "#7C3AED" }}
          >
            Event Details →
          </Link>
        )}
      </div>

      <div className="mb-3 space-y-1 text-sm text-text-secondary">
        <p>
          <span className="font-medium text-foreground">{formatEventDate(event.event_date)}</span>
          {time && ` at ${time}`}
        </p>
        {event.location && <p>{event.location}</p>}
      </div>

      {event.description && (
        <p className="text-sm text-text-secondary leading-relaxed">{event.description}</p>
      )}
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div
      className="rounded-xl p-8 text-center text-sm text-text-secondary"
      style={{
        background: "#fff",
        border: "1px solid rgba(124,58,237,0.12)",
      }}
    >
      No {label} yet. Check back soon.
    </div>
  );
}

export default async function EventsPage() {
  const [upcoming, past] = await Promise.all([getUpcomingEvents(), getPastEvents()]);

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
              Events
            </h1>
            <p className="text-lg leading-8 mb-10" style={{ color: "rgba(255,255,255,0.75)", maxWidth: 520, margin: "0 auto" }}>
              Find community gatherings, meetings, and activities happening around Athens County.
            </p>
          </div>
        </div>
      </section>

      {/* Body content */}
      <section className="px-4 py-16 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground mb-6">Upcoming Events</h2>

          {upcoming.length === 0 ? (
            <EmptyState label="upcoming events" />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {upcoming.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}

          <details className="mt-12 rounded-xl" style={{ border: "1px solid rgba(124,58,237,0.12)" }}>
            <summary className="cursor-pointer px-6 py-4 text-lg font-bold text-foreground hover:bg-primary/5 transition-colors rounded-xl">
              Past Events
            </summary>
            <div className="px-6 pb-6 space-y-4">
              {past.length === 0 ? (
                <EmptyState label="past events" />
              ) : (
                past.map((event) => (
                  <div
                    key={event.id}
                    className="rounded-xl p-5"
                    style={{
                      background: "#fff",
                      border: "1px solid rgba(124,58,237,0.12)",
                    }}
                  >
                    <h3 className="font-bold text-foreground mb-1">{event.title}</h3>
                    <div className="mb-2 space-y-1 text-sm text-text-secondary">
                      <p>
                        <span className="font-medium text-foreground">{formatEventDate(event.event_date)}</span>
                        {formatTimeRange(event) && ` at ${formatTimeRange(event)}`}
                      </p>
                      {event.location && <p>{event.location}</p>}
                    </div>
                    {event.description && (
                      <p className="text-sm text-text-secondary leading-relaxed">{event.description}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </details>
        </div>
      </section>
    </div>
  );
}

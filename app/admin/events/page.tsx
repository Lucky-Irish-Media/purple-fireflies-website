import { getEvents } from "@/app/lib/db";
import EventsTable from "@/app/admin/EventsTable";

export default async function AdminEventsPage() {
  const events = await getEvents();

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-foreground">Events</h1>
      <EventsTable initialEvents={events} />
    </div>
  );
}

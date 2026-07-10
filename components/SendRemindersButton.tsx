"use client";

import { useActionState } from "react";
import { sendDriverReminders, type SendRemindersState } from "@/app/actions/send-reminders";

function formatDateLabel(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function SendRemindersButton({ dates }: { dates: string[] }) {
  const [state, formAction, isPending] = useActionState<SendRemindersState | null, FormData>(
    sendDriverReminders,
    null,
  );

  return (
    <div>
      <form action={formAction} className="flex items-center gap-3">
        <select
          name="date"
          defaultValue={dates[0] ?? ""}
          className="rounded-lg border border-primary/20 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        >
          {dates.map((d) => (
            <option key={d} value={d}>
              {formatDateLabel(d)}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={isPending || dates.length === 0}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "Sending Reminder Emails..." : "Send Reminder Emails"}
        </button>
      </form>

      {state && (
        <div
          className={`mt-4 rounded-lg border p-4 ${
            state.success
              ? "bg-green-50 border-green-200"
              : "bg-red-50 border-red-200"
          }`}
        >
          <p
            className={`font-medium ${
              state.success ? "text-green-800" : "text-red-800"
            }`}
          >
            {state.success ? "✓" : "✗"} {state.message}
          </p>
          {state.results && state.results.length > 0 && (
            <ul className="mt-2 space-y-1 text-sm text-green-700">
              {state.results.map((r) => (
                <li key={r.email}>
                  <span className="font-medium">{r.driver}</span> — {r.email} —{" "}
                  {r.deliveries} delivery(ies) — {r.status}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

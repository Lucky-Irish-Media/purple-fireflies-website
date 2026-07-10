"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { sendDriverReminders, type SendRemindersState } from "@/app/actions/send-reminders";
import type { ReminderLog } from "@/app/lib/db";
import { formatDateTime } from "@/app/admin/lib/utils";

function formatDateLabel(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function SendRemindersButton({
  dates,
  logs,
}: {
  dates: string[];
  logs: ReminderLog[];
}) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState<SendRemindersState | null, FormData>(
    sendDriverReminders,
    null,
  );

  useEffect(() => {
    if (state?.success) {
      router.refresh();
    }
  }, [state, router]);

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

      {logs.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-foreground mb-2">Reminder History</h3>
          <div className="overflow-x-auto rounded-lg border border-primary/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-primary/10 bg-card">
                  <th className="px-3 py-2 text-left text-xs font-medium text-text-secondary">Sent At</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-text-secondary">Delivery Date</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-text-secondary">Sent</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-text-secondary">Failed</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-primary/5 last:border-0">
                    <td className="px-3 py-2 text-text-secondary">{formatDateTime(log.created_at)}</td>
                    <td className="px-3 py-2 text-foreground font-medium">{formatDateLabel(log.delivery_date)}</td>
                    <td className="px-3 py-2 text-foreground">{log.sent_count}</td>
                    <td className="px-3 py-2 text-foreground">{log.failed_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatPhone } from "@/app/admin/lib/utils";
import type { VolunteerSignupWithParticipant } from "@/app/lib/definitions";
import { updateVolunteerSignupAction, cancelVolunteerSignupAdminAction } from "@/app/actions/volunteer-meals";

export default function VolunteerSignupsTable({ initialData }: { initialData: VolunteerSignupWithParticipant[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<{ message: string; success: boolean } | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  function run(fd: FormData, action: (f: FormData) => Promise<{ success: boolean; message: string }>) {
    startTransition(async () => {
      const res = await action(fd);
      setStatus(res);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      {status && <p className={`text-sm ${status.success ? "text-green-600" : "text-red-500"}`}>{status.message}</p>}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-text-secondary border-b border-primary/10">
              <th className="py-2 pr-4">Date</th>
              <th className="py-2 pr-4">Role</th>
              <th className="py-2 pr-4">Name</th>
              <th className="py-2 pr-4">Email</th>
              <th className="py-2 pr-4">Phone</th>
              <th className="py-2 pr-4">Type</th>
              <th className="py-2 pr-4">Group</th>
              <th className="py-2 pr-4">Headcount</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {initialData.map((s) => (
              <tr key={s.id} className="border-b border-primary/5">
                <td className="py-2 pr-4 text-text-secondary">
                  {new Date(s.day_date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </td>
                <td className="py-2 pr-4 text-foreground font-medium">{s.role}</td>
                <td className="py-2 pr-4 text-foreground font-medium">{s.participant_name}</td>
                <td className="py-2 pr-4 text-text-secondary">{s.participant_email}</td>
                <td className="py-2 pr-4 text-text-secondary">{formatPhone(s.participant_phone)}</td>
                <td className="py-2 pr-4 text-text-secondary">{s.is_group ? "Group" : "Individual"}</td>
                <td className="py-2 pr-4 text-text-secondary">{s.group_name || "—"}</td>
                <td className="py-2 pr-4 text-text-secondary">{s.headcount}</td>
                <td className="py-2 pr-4 text-text-secondary">{s.status}</td>
                <td className="py-2 pr-4">
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => setEditingId(editingId === s.id ? null : s.id)}
                      className="rounded-lg border border-primary/10 px-3 py-1.5 text-xs font-medium"
                    >
                      Edit
                    </button>
                    {s.status === "active" && (
                      <form action={(fd) => run(fd, cancelVolunteerSignupAdminAction)}>
                        <input type="hidden" name="id" value={s.id} />
                        <button type="submit" disabled={pending} className="rounded-lg border border-red-200 text-red-600 px-3 py-1.5 text-xs font-medium">
                          Cancel
                        </button>
                      </form>
                    )}
                  </div>
                  {editingId === s.id && (
                    <form action={(fd) => run(fd, updateVolunteerSignupAction)} className="mt-2 space-y-1">
                      <input type="hidden" name="id" value={s.id} />
                      <select name="role" defaultValue={s.role} className="rounded border border-primary/10 bg-background px-1 py-0.5 text-xs">
                        <option value="cooking">cooking</option>
                        <option value="cleaning">cleaning</option>
                        <option value="packing">packing</option>
                      </select>
                      <input name="headcount" type="number" min={1} defaultValue={s.headcount} className="w-16 rounded border border-primary/10 bg-background px-1 py-0.5 text-xs" />
                      <input name="group_name" defaultValue={s.group_name || ""} placeholder="Group name" className="rounded border border-primary/10 bg-background px-1 py-0.5 text-xs" />
                      <select name="status" defaultValue={s.status} className="rounded border border-primary/10 bg-background px-1 py-0.5 text-xs">
                        <option value="active">active</option>
                        <option value="cancelled">cancelled</option>
                      </select>
                      <button type="submit" disabled={pending} className="text-xs text-primary">Save</button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
            {initialData.length === 0 && (
              <tr>
                <td colSpan={10} className="py-4 text-center text-text-secondary">No volunteer signups yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

"use client";

import { useState, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { MealSignupWithAssignmentDb } from "@/app/lib/db";
import type { DriverVolunteer } from "@/app/lib/definitions";
import { assignDriverAction } from "@/app/actions/assignments";

function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  return `${month}/${day}/${year}`;
}

function todayLocal(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11 && digits.startsWith("1")) {
    return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return phone;
}

type SortKey = keyof MealSignupWithAssignmentDb;
type SortDir = "asc" | "desc";

function sortData(data: MealSignupWithAssignmentDb[], key: SortKey, dir: SortDir): MealSignupWithAssignmentDb[] {
  return [...data].sort((a, b) => {
    const aVal = a[key] ?? "";
    const bVal = b[key] ?? "";
    const cmp = typeof aVal === "string" ? aVal.localeCompare(String(bVal)) : Number(aVal) - Number(bVal);
    return dir === "asc" ? cmp : -cmp;
  });
}

export default function MealSignupsTable({
  initialData,
  drivers,
}: {
  initialData: MealSignupWithAssignmentDb[];
  drivers: DriverVolunteer[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({
    key: "delivery_date",
    dir: "asc",
  });
  const [futureOnly, setFutureOnly] = useState(true);

  const signups = useMemo(() => {
    const today = todayLocal();
    const filtered = futureOnly
      ? initialData.filter((s) => s.delivery_date >= today)
      : initialData;
    return sortData(filtered, sort.key, sort.dir);
  }, [initialData, sort, futureOnly]);

  const driversByDate = useMemo(() => {
    const map = new Map<string, DriverVolunteer[]>();
    for (const d of drivers) {
      const existing = map.get(d.delivery_date) || [];
      existing.push(d);
      map.set(d.delivery_date, existing);
    }
    return map;
  }, [drivers]);

  function toggleSort(key: SortKey) {
    setSort((prev) => ({
      key,
      dir: prev.key === key && prev.dir === "asc" ? "desc" : "asc",
    }));
  }

  function SortHeader({ sortKey, children }: { sortKey: SortKey; children: React.ReactNode }) {
    const isActive = sort.key === sortKey;
    return (
      <th
        className="pb-3 font-semibold text-foreground cursor-pointer select-none hover:text-primary"
        onClick={() => toggleSort(sortKey)}
      >
        {children}
        {isActive ? (sort.dir === "asc" ? " ▲" : " ▼") : null}
      </th>
    );
  }

  function handleAssignment(mealSignupId: number, driverVolunteerId: string) {
    const formData = new FormData();
    formData.set("mealSignupId", String(mealSignupId));
    formData.set("driverVolunteerId", driverVolunteerId);
    startTransition(async () => {
      await assignDriverAction(formData);
      router.refresh();
    });
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Meal Delivery Signups</h2>
        <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
          <input
            type="checkbox"
            checked={futureOnly}
            onChange={(e) => setFutureOnly(e.target.checked)}
            className="accent-primary"
          />
          Show future dates only
        </label>
      </div>
      <p className="text-text-secondary">
        Total signups: {signups.length}
      </p>

      {signups.length === 0 ? (
        <p className="text-text-secondary">No meal signups yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-primary/10">
                <SortHeader sortKey="name">Name</SortHeader>
                <SortHeader sortKey="email">Email</SortHeader>
                <SortHeader sortKey="phone">Phone</SortHeader>
                <SortHeader sortKey="address1">Address</SortHeader>
                <SortHeader sortKey="meal_type">Meal Type</SortHeader>
                <SortHeader sortKey="contact_method">Contact Method</SortHeader>
                <SortHeader sortKey="delivery_day">Delivery Day</SortHeader>
                <SortHeader sortKey="delivery_date">Delivery Date</SortHeader>
                <SortHeader sortKey="comments">Comments</SortHeader>
                <SortHeader sortKey="created_at">Submitted</SortHeader>
                <th className="pb-3 font-semibold text-foreground">Assigned Driver</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/10">
              {signups.map((signup) => {
                const availableDrivers = driversByDate.get(signup.delivery_date) || [];
                return (
                  <tr key={signup.id} className="hover:bg-primary/5">
                    <td className="py-3 text-foreground">{signup.name}</td>
                    <td className="py-3 text-text-secondary">{signup.email}</td>
                    <td className="py-3 text-text-secondary">{formatPhone(signup.phone)}</td>
                    <td className="py-3 text-text-secondary max-w-xs truncate">
                      {signup.address1}
                      {signup.address2 && `, ${signup.address2}`}
                      {`, ${signup.city}, ${signup.state} ${signup.zip_code}`}
                    </td>
                    <td className="py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          signup.meal_type === "vegan"
                            ? "bg-green-100 text-green-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {signup.meal_type}
                      </span>
                    </td>
                    <td className="py-3 text-text-secondary capitalize">{signup.contact_method}</td>
                    <td className="py-3 text-text-secondary capitalize">{signup.delivery_day}</td>
                    <td className="py-3 text-text-secondary">{formatDate(signup.delivery_date)}</td>
                    <td className="py-3 text-text-secondary max-w-xs truncate">
                      {signup.comments || "—"}
                    </td>
                    <td className="py-3 text-text-secondary">
                      {new Date(signup.created_at).toLocaleString()}
                    </td>
                    <td className="py-3">
                      <select
                        value={signup.driver_id ? String(signup.driver_id) : "0"}
                        onChange={(e) => handleAssignment(signup.id, e.target.value)}
                        disabled={isPending}
                        className="text-sm border border-primary/20 rounded px-2 py-1 bg-background text-foreground max-w-[140px]"
                      >
                        <option value="0">—</option>
                        {availableDrivers.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                      {signup.driver_name && (
                        <span className="ml-1 text-xs text-text-secondary block truncate max-w-[140px]">
                          {formatPhone(signup.driver_phone || "")}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

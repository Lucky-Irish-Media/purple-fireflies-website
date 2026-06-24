"use client";

import { useState, useMemo } from "react";
import { getDriverVolunteers } from "@/app/lib/db";
import type { DriverVolunteer } from "@/app/lib/definitions";

function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  return `${month}/${day}/${year}`;
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

type SortKey = keyof DriverVolunteer;
type SortDir = "asc" | "desc";

function sortData(data: DriverVolunteer[], key: SortKey, dir: SortDir): DriverVolunteer[] {
  return [...data].sort((a, b) => {
    const aVal = a[key] ?? "";
    const bVal = b[key] ?? "";
    const cmp = typeof aVal === "string" ? aVal.localeCompare(String(bVal)) : Number(aVal) - Number(bVal);
    return dir === "asc" ? cmp : -cmp;
  });
}

async function DriverVolunteersTable() {
  const initialData = await getDriverVolunteers();

  return <DriverVolunteersTableClient initialData={initialData} />;
}

function DriverVolunteersTableClient({ initialData }: { initialData: DriverVolunteer[] }) {
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({
    key: "delivery_date",
    dir: "asc",
  });
  const [futureOnly, setFutureOnly] = useState(true);

  const volunteers = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    const filtered = futureOnly
      ? initialData.filter((v) => v.delivery_date >= today)
      : initialData;
    return sortData(filtered, sort.key, sort.dir);
  }, [initialData, sort, futureOnly]);

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

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Driver Volunteers</h2>
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
        Total volunteers: {volunteers.length}
      </p>

      {volunteers.length === 0 ? (
        <p className="text-text-secondary">No driver volunteers yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-primary/10">
                <SortHeader sortKey="name">Name</SortHeader>
                <SortHeader sortKey="email">Email</SortHeader>
                <SortHeader sortKey="phone">Phone</SortHeader>
                <SortHeader sortKey="on_signal">On Signal</SortHeader>
                <SortHeader sortKey="regions">Regions</SortHeader>
                <SortHeader sortKey="delivery_day">Delivery Day</SortHeader>
                <SortHeader sortKey="delivery_date">Delivery Date</SortHeader>
                <SortHeader sortKey="created_at">Submitted</SortHeader>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/10">
              {volunteers.map((v: DriverVolunteer) => (
                <tr key={v.id} className="hover:bg-primary/5">
                  <td className="py-3 text-foreground">{v.name}</td>
                  <td className="py-3 text-text-secondary">{v.email}</td>
                  <td className="py-3 text-text-secondary">{formatPhone(v.phone)}</td>
                  <td className="py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                        v.on_signal === "yes"
                          ? "bg-green-100 text-green-800"
                          : v.on_signal === "willing"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {v.on_signal}
                    </span>
                  </td>
                  <td className="py-3 text-text-secondary max-w-xs truncate">
                    {v.regions}
                  </td>
                  <td className="py-3 text-text-secondary capitalize">{v.delivery_day}</td>
                  <td className="py-3 text-text-secondary">{formatDate(v.delivery_date)}</td>
                  <td className="py-3 text-text-secondary">
                    {new Date(v.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default DriverVolunteersTable;

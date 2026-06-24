"use client";

import { useState, useMemo } from "react";
import { getMealSignups } from "@/app/lib/db";
import { MealSignup } from "@/app/lib/db";

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

type SortKey = keyof MealSignup;
type SortDir = "asc" | "desc";

function sortData(data: MealSignup[], key: SortKey, dir: SortDir): MealSignup[] {
  return [...data].sort((a, b) => {
    const aVal = a[key] ?? "";
    const bVal = b[key] ?? "";
    const cmp = typeof aVal === "string" ? aVal.localeCompare(String(bVal)) : Number(aVal) - Number(bVal);
    return dir === "asc" ? cmp : -cmp;
  });
}

async function MealSignupsTable() {
  const initialData = await getMealSignups();

  return <MealSignupsTableClient initialData={initialData} />;
}

function MealSignupsTableClient({ initialData }: { initialData: MealSignup[] }) {
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({
    key: "delivery_date",
    dir: "asc",
  });
  const [futureOnly, setFutureOnly] = useState(true);

  const signups = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    const filtered = futureOnly
      ? initialData.filter((s) => s.delivery_date >= today)
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
                <SortHeader sortKey="delivery_day">Delivery Day</SortHeader>
                <SortHeader sortKey="delivery_date">Delivery Date</SortHeader>
                <SortHeader sortKey="comments">Comments</SortHeader>
                <SortHeader sortKey="created_at">Submitted</SortHeader>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/10">
              {signups.map((signup: MealSignup) => (
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
                  <td className="py-3 text-text-secondary capitalize">{signup.delivery_day}</td>
                  <td className="py-3 text-text-secondary">{formatDate(signup.delivery_date)}</td>
                  <td className="py-3 text-text-secondary max-w-xs truncate">
                    {signup.comments || "—"}
                  </td>
                  <td className="py-3 text-text-secondary">
                    {new Date(signup.created_at).toLocaleString()}
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

export default MealSignupsTable;

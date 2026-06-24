import { getDriverVolunteers } from "@/app/lib/db";
import type { DriverVolunteer } from "@/app/lib/definitions";

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

async function DriverVolunteersTable() {
  const volunteers = await getDriverVolunteers();

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Driver Volunteers</h2>
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
                <th className="pb-3 font-semibold text-foreground">Name</th>
                <th className="pb-3 font-semibold text-foreground">Email</th>
                <th className="pb-3 font-semibold text-foreground">Phone</th>
                <th className="pb-3 font-semibold text-foreground">On Signal</th>
                <th className="pb-3 font-semibold text-foreground">Regions</th>
                <th className="pb-3 font-semibold text-foreground">Delivery Day</th>
                <th className="pb-3 font-semibold text-foreground">Delivery Date</th>
                <th className="pb-3 font-semibold text-foreground">Submitted</th>
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
                  <td className="py-3 text-text-secondary">{v.delivery_date}</td>
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

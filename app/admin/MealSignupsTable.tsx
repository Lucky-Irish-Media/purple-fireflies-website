import { getMealSignups } from "@/app/lib/db";
import { MealSignup } from "@/app/lib/db";

async function MealSignupsTable() {
  const signups = await getMealSignups();

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Meal Delivery Signups</h2>
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
                <th className="pb-3 font-semibold text-foreground">Name</th>
                <th className="pb-3 font-semibold text-foreground">Email</th>
                <th className="pb-3 font-semibold text-foreground">Phone</th>
                <th className="pb-3 font-semibold text-foreground">Address</th>
                <th className="pb-3 font-semibold text-foreground">Meal Type</th>
                <th className="pb-3 font-semibold text-foreground">Delivery Day</th>
                <th className="pb-3 font-semibold text-foreground">Comments</th>
                <th className="pb-3 font-semibold text-foreground">Submitted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/10">
              {signups.map((signup: MealSignup) => (
                <tr key={signup.id} className="hover:bg-primary/5">
                  <td className="py-3 text-foreground">{signup.name}</td>
                  <td className="py-3 text-text-secondary">{signup.email}</td>
                  <td className="py-3 text-text-secondary">{signup.phone}</td>
                  <td className="py-3 text-text-secondary max-w-xs truncate">{signup.address}</td>
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
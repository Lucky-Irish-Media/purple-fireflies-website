export function formatDate(isoDate: string): string {
  if (!isoDate) return "—";
  const [year, month, day] = isoDate.split("-");
  return `${month}/${day}/${year}`;
}

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11 && digits.startsWith("1")) {
    return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return phone;
}

export function todayLocal(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function deliveryDateFilterFn(row: any, columnId: string, value: string): boolean {
  const date = row.getValue(columnId);
  const today = todayLocal();
  switch (value) {
    case "future":
      return date >= today;
    case "past":
      return date < today;
    case "today":
      return date === today;
    case "nextWeek": {
      const now = new Date();
      const day = now.getDay();
      const diffToMonday = day === 0 ? 1 : 8 - day;
      const monday = new Date(now);
      monday.setDate(now.getDate() + diffToMonday);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      const mondayStr = `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, "0")}-${String(monday.getDate()).padStart(2, "0")}`;
      const sundayStr = `${sunday.getFullYear()}-${String(sunday.getMonth() + 1).padStart(2, "0")}-${String(sunday.getDate()).padStart(2, "0")}`;
      return date >= mondayStr && date <= sundayStr;
    }
    default:
      return true;
  }
}

export function formatDateTime(isoDate: string): string {
  return new Date(isoDate).toLocaleString();
}

export function formatDateOnly(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString();
}

export function getSignalBadge(signal: string) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
        signal === "yes"
          ? "bg-green-100 text-green-800"
          : signal === "willing"
          ? "bg-yellow-100 text-yellow-800"
          : "bg-gray-100 text-gray-800"
      }`}
    >
      {signal}
    </span>
  );
}

export function getMealTypeBadge(mealType: string) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        mealType === "vegan"
          ? "bg-green-100 text-green-800"
          : "bg-blue-100 text-blue-800"
      }`}
    >
      {mealType}
    </span>
  );
}

export function getRoleBadge(role: string) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        role === "admin"
          ? "bg-purple-100 text-purple-800"
          : "bg-blue-100 text-blue-800"
      }`}
    >
      {role}
    </span>
  );
}

export function getDeliveryDayBadge(day: string) {
  return (
    <span className="capitalize text-text-secondary">{day}</span>
  );
}

export function getContactMethodBadge(method: string) {
  return (
    <span className="capitalize text-text-secondary">{method}</span>
  );
}

export function DeliveryDateFilter({ column }: { column: any }) {
  const value = column.getFilterValue() as string | undefined;
  return (
    <select
      value={value || ""}
      onChange={(e) => {
        e.stopPropagation();
        column.setFilterValue(e.target.value || undefined);
      }}
      className="w-full rounded border border-primary/10 bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
    >
      <option value="">All</option>
      <option value="future">Future Dates Only</option>
      <option value="past">Past Dates Only</option>
      <option value="today">Today</option>
      <option value="nextWeek">Next Week</option>
    </select>
  );
}

export function requesterFilterFn(row: any, _columnId: string, filterValue: string): boolean {
  if (!filterValue) return true;
  const r = row.original;
  const search = String(filterValue).toLowerCase();
  return (
    r.participant_name?.toLowerCase().includes(search) ||
    r.participant_email?.toLowerCase().includes(search) ||
    r.participant_phone?.includes(search) ||
    r.participant_address1?.toLowerCase().includes(search) ||
    r.participant_address2?.toLowerCase().includes(search) ||
    r.participant_city?.toLowerCase().includes(search)
  );
}

export function mealsFilterFn(row: any, _columnId: string, filterValue: string): boolean {
  if (!filterValue) return true;
  const r = row.original;
  switch (filterValue) {
    case "regular": return r.regular_quantity > 0 && r.vegan_quantity === 0;
    case "vegan": return r.vegan_quantity > 0 && r.regular_quantity === 0;
    case "both": return r.regular_quantity > 0 && r.vegan_quantity > 0;
    default: return true;
  }
}

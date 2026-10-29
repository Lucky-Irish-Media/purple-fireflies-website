export function getHomePathForRole(role: string): string {
  if (role === "admin") return "/admin";
  if (role === "meal_coordinator") return "/admin/programs/meal-delivery";
  if (role === "content_editor") return "/admin/events";
  if (role === "reports_viewer") return "/admin/reports";
  return "/volunteer";
}
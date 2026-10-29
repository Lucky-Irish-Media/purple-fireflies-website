export function getHomePathForRole(role: string): string {
  if (role === "admin") return "/admin";
  if (role === "meal_coordinator") return "/admin/programs/meal-delivery";
  return "/volunteer";
}
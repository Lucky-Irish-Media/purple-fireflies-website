export function getHomePathForRole(role: string): string {
  return role === "admin" ? "/admin" : "/volunteer";
}

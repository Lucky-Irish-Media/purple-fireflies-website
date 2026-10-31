import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "@/app/lib/session";
import { getHomePathForRole } from "@/app/lib/auth-utils";

const protectedRoutes = ["/admin", "/volunteer"];
const publicRoutes = ["/login"];

const ADMIN_ROLES = ["admin", "meal_coordinator", "content_editor", "reports_viewer"];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  const isProtectedRoute = protectedRoutes.some((route) =>
    path.startsWith(route)
  );
  const isPublicRoute = publicRoutes.some((route) =>
    path.startsWith(route)
  );

  const cookie = req.cookies.get("session")?.value;
  const session = await decrypt(cookie);

  if (isProtectedRoute && !session?.userId) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  if (path.startsWith("/admin") && session?.userId) {
    if (!ADMIN_ROLES.includes(session.role)) {
      return NextResponse.redirect(new URL("/volunteer", req.nextUrl));
    }

    if (session.role === "meal_coordinator") {
      const allowed =
        path === "/admin/programs/meal-delivery" ||
        path.startsWith("/admin/programs/meal-delivery/");
      if (!allowed) {
        return NextResponse.redirect(
          new URL("/admin/programs/meal-delivery", req.nextUrl)
        );
      }
    }

    if (session.role === "content_editor") {
      const allowed =
        path === "/admin/events" ||
        path.startsWith("/admin/events/") ||
        path === "/admin/news" ||
        path.startsWith("/admin/news/") ||
        path === "/admin/newsletters" ||
        path.startsWith("/admin/newsletters/");
      if (!allowed) {
        return NextResponse.redirect(new URL("/admin/events", req.nextUrl));
      }
    }

    if (session.role === "reports_viewer") {
      const allowed =
        path === "/admin/reports" || path.startsWith("/admin/reports/");
      if (!allowed) {
        return NextResponse.redirect(new URL("/admin/reports", req.nextUrl));
      }
    }
  }

  if (isPublicRoute && session?.userId) {
    return NextResponse.redirect(
      new URL(getHomePathForRole(session.role), req.nextUrl)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
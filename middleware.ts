import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "@/app/lib/session";
import { getHomePathForRole } from "@/app/lib/auth-utils";

const protectedRoutes = ["/admin", "/volunteer"];
const publicRoutes = ["/login"];

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

  if (path.startsWith("/admin") && session?.userId && session.role !== "admin") {
    return NextResponse.redirect(new URL("/volunteer", req.nextUrl));
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

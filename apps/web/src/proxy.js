import { NextResponse } from "next/server";

export function proxy(request) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("accessToken")?.value;
  const website = request.cookies.get("tenantWebsite")?.value;

  const isLogin = pathname.startsWith("/login");
  const isDashboard = pathname.startsWith("/dashboard");

  // No website exists
  if (!website) {
    // Not logged → login page
    if (!token && !isLogin) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Logged in → dashboard (setup area)
    if (token && !isDashboard) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
  }

  // Website exists → allow normal app flow
  // Only block login page if user already logged in
  if (website && token && isLogin) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico).*)"],
};

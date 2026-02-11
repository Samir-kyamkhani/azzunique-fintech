import { NextResponse } from "next/server";

export function proxy(request) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("accessToken")?.value;
  const website = request.cookies.get("tenantWebsite")?.value;

  const isLogin = pathname.startsWith("/login");
  const isDashboard = pathname.startsWith("/dashboard");

  // 🔒 Protect dashboard ALWAYS
  if (isDashboard && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // No website setup yet
  if (!website) {
    if (!token && !isLogin) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (token && !isDashboard) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
  }

  // Website exists
  if (website && token && isLogin) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico).*)"],
};

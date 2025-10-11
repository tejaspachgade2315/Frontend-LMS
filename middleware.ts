import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isTokenValid } from "@/lib/token";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("authToken")?.value;
  const { pathname } = req.nextUrl;
  const isAuthPage = pathname === "/login";
  const role = req.cookies.get("role")?.value;

  const isAdminProductPage = pathname === "/admin/product";
  const isAdminSalesRepPage = pathname === "/admin/salesRepresentative";

  if (token && isAuthPage) {
    const previousPage = req.headers.get("referer") || "/";
    const redirectUrl = new URL(previousPage, req.url);
    if (redirectUrl.pathname === "/login") {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.redirect(redirectUrl);
  }
  if (!token && !isAuthPage) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  if (!isTokenValid(token, "token")) {
    if (!isAuthPage) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  if (isAdminProductPage && role === "salerep") {
    const previousPage = req.headers.get("referer") || "/";
    const redirectUrl = new URL(previousPage, req.url);
    return NextResponse.redirect(redirectUrl);
  }

  if (isAdminSalesRepPage && role === "salerep") {
    const previousPage = req.headers.get("referer") || "/";
    const redirectUrl = new URL(previousPage, req.url);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}
export const config = {
  matcher: [
    "/",
    "/activities",
    "/admin",
    "/contacts",
    "/leads/all",
    "/leads",
    "/admin/product",
    "/admin/salesRepresentative",
  ],
};

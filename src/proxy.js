import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/create-deal",
  "/delivery/dashboard",
  "/scanner",
  "/admin",
  "/deal",
  "/pay",
  "/orders",
];

export async function proxy(req) {
  const { pathname } = req.nextUrl;
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  const isAuthPage = pathname.startsWith("/auth/login") || pathname.startsWith("/auth/register");
  if (isAuthPage) {
    if (token) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  if (!token) {
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname + req.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith("/admin") && token.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (pathname.startsWith("/delivery/dashboard") && token.role !== "DELIVERY_AGENT") {
    return NextResponse.redirect(new URL("/delivery/register", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/create-deal/:path*",
    "/delivery/dashboard/:path*",
    "/scanner/:path*",
    "/admin/:path*",
    "/deal/:path*",
    "/pay/:path*",
    "/orders/:path*",
    "/auth/login",
    "/auth/register",
  ],
};
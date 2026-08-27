import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  FIRMAS_SESSION_COOKIE,
  getAuthSecret,
  verifySessionToken,
} from "@/lib/firmas-auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/firmas/login")) {
    return NextResponse.next();
  }

  const secret = getAuthSecret();
  const session = request.cookies.get(FIRMAS_SESSION_COOKIE)?.value;
  const isAuthorized = secret
    ? await verifySessionToken(session, secret)
    : false;

  if (isAuthorized) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const loginUrl = new URL("/firmas/login", request.url);
  loginUrl.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/firmas", "/firmas/:path*", "/api/generate"],
};

import { NextResponse } from "next/server";
import {
  createSessionToken,
  FIRMAS_SESSION_COOKIE,
  getAuthSecret,
  getSessionCookieOptions,
} from "@/lib/firmas-auth";

export async function POST(request: Request) {
  const secret = getAuthSecret();
  if (!secret) {
    return NextResponse.json(
      { error: "Firmas auth is not configured" },
      { status: 503 }
    );
  }

  let password = "";
  try {
    const body = (await request.json()) as { password?: string };
    password = body.password?.trim() ?? "";
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (password !== process.env.FIRMAS_PASSWORD) {
    return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(
    FIRMAS_SESSION_COOKIE,
    await createSessionToken(secret),
    getSessionCookieOptions()
  );
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(FIRMAS_SESSION_COOKIE, "", {
    ...getSessionCookieOptions(0),
    maxAge: 0,
  });
  return response;
}

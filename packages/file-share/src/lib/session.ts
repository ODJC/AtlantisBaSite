import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

const ADMIN_COOKIE = "admin_session";
const CLIENT_COOKIE = "client_session";

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET environment variable is required");
  }
  return new TextEncoder().encode(secret);
}

export type AdminSession = {
  role: "admin";
};

export type ClientSession = {
  role: "client";
  clientId: number;
  slug: string;
};

async function sign(payload: Record<string, unknown>, maxAgeSeconds: number) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${maxAgeSeconds}s`)
    .sign(getSecret());
}

async function verify<T>(token: string): Promise<T | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as T;
  } catch {
    return null;
  }
}

export async function setAdminSession() {
  const token = await sign({ role: "admin" }, 60 * 60 * 24);
  const store = await cookies();
  store.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
}

export async function clearAdminSession() {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  if (!token) return null;
  const session = await verify<AdminSession>(token);
  return session?.role === "admin" ? session : null;
}

export async function getAdminSessionFromRequest(
  request: NextRequest
): Promise<AdminSession | null> {
  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  if (!token) return null;
  const session = await verify<AdminSession>(token);
  return session?.role === "admin" ? session : null;
}

export async function setClientSession(clientId: number, slug: string) {
  const token = await sign({ role: "client", clientId, slug }, 60 * 60 * 24 * 7);
  const store = await cookies();
  store.set(CLIENT_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearClientSession() {
  const store = await cookies();
  store.delete(CLIENT_COOKIE);
}

export async function getClientSession(): Promise<ClientSession | null> {
  const store = await cookies();
  const token = store.get(CLIENT_COOKIE)?.value;
  if (!token) return null;
  const session = await verify<ClientSession>(token);
  return session?.role === "client" ? session : null;
}

export async function getClientSessionForSlug(
  slug: string
): Promise<ClientSession | null> {
  const session = await getClientSession();
  if (!session || session.slug !== slug) return null;
  return session;
}

export async function getClientSessionFromRequest(
  request: NextRequest
): Promise<ClientSession | null> {
  const token = request.cookies.get(CLIENT_COOKIE)?.value;
  if (!token) return null;
  const session = await verify<ClientSession>(token);
  return session?.role === "client" ? session : null;
}

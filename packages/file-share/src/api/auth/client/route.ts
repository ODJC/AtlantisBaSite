import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { verifyPassword } from "../../../lib/auth";
import { db } from "../../../lib/db";
import { clients } from "../../../lib/db/schema";
import { setClientSession } from "../../../lib/session";

export async function POST(request: NextRequest) {
  const { slug, password } = await request.json();

  if (!slug || !password) {
    return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
  }

  const [client] = await db
    .select()
    .from(clients)
    .where(eq(clients.slug, slug))
    .limit(1);

  if (!client) {
    return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
  }

  const valid = await verifyPassword(password, client.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 });
  }

  await setClientSession(client.id, client.slug);
  return NextResponse.json({ success: true });
}

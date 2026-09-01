import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { hashPassword } from "../../../lib/auth";
import { db } from "../../../lib/db";
import { clients } from "../../../lib/db/schema";
import { getAdminSessionFromRequest } from "../../../lib/session";
import { generatePassword } from "../../../lib/utils";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const session = await getAdminSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await context.params;
  const [client] = await db
    .select()
    .from(clients)
    .where(eq(clients.id, Number(id)))
    .limit(1);

  if (!client) {
    return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
  }

  return NextResponse.json({ client });
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const session = await getAdminSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await request.json();
  const updates: Partial<{ name: string; passwordHash: string }> = {};

  if (body.name) updates.name = body.name;
  if (body.password) updates.passwordHash = await hashPassword(body.password);

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Nada que actualizar" }, { status: 400 });
  }

  const [client] = await db
    .update(clients)
    .set(updates)
    .where(eq(clients.id, Number(id)))
    .returning();

  return NextResponse.json({ client });
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const session = await getAdminSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await context.params;
  await db.delete(clients).where(eq(clients.id, Number(id)));
  return NextResponse.json({ success: true });
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const session = await getAdminSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await context.params;
  const newPassword = generatePassword();
  const passwordHash = await hashPassword(newPassword);

  const [client] = await db
    .update(clients)
    .set({ passwordHash })
    .where(eq(clients.id, Number(id)))
    .returning();

  if (!client) {
    return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
  }

  return NextResponse.json({ client, password: newPassword });
}

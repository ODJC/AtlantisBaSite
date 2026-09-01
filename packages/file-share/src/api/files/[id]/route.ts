import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { db } from "../../../lib/db";
import { FILE_DIRECTION_OUTBOUND, files } from "../../../lib/db/schema";
import { getAdminSessionFromRequest } from "../../../lib/session";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  const session = await getAdminSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await context.params;
  const { expiresAt } = await request.json();

  if (!expiresAt) {
    return NextResponse.json(
      { error: "Fecha de expiración requerida" },
      { status: 400 }
    );
  }

  const [existing] = await db
    .select()
    .from(files)
    .where(eq(files.id, Number(id)))
    .limit(1);

  if (!existing) {
    return NextResponse.json({ error: "Archivo no encontrado" }, { status: 404 });
  }

  if (existing.direction !== FILE_DIRECTION_OUTBOUND) {
    return NextResponse.json(
      { error: "Los archivos enviados por el cliente no tienen expiración" },
      { status: 400 }
    );
  }

  const [file] = await db
    .update(files)
    .set({ expiresAt: new Date(expiresAt) })
    .where(eq(files.id, Number(id)))
    .returning();

  return NextResponse.json({ file });
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const session = await getAdminSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await context.params;
  const [file] = await db
    .select()
    .from(files)
    .where(eq(files.id, Number(id)))
    .limit(1);

  if (!file) {
    return NextResponse.json({ error: "Archivo no encontrado" }, { status: 404 });
  }

  try {
    await del(file.pathname);
  } catch {
    // Blob may already be deleted
  }

  await db.delete(files).where(eq(files.id, Number(id)));
  return NextResponse.json({ success: true });
}

export async function GET(request: NextRequest, context: RouteContext) {
  const session = await getAdminSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await context.params;
  const [file] = await db
    .select()
    .from(files)
    .where(eq(files.id, Number(id)))
    .limit(1);

  if (!file) {
    return NextResponse.json({ error: "Archivo no encontrado" }, { status: 404 });
  }

  return NextResponse.json({ file });
}

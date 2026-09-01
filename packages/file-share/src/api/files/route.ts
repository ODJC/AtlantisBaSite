import { and, desc, eq, gt, or } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "../../lib/db";
import {
  FILE_DIRECTION_INBOUND,
  FILE_DIRECTION_OUTBOUND,
  clients,
  files,
} from "../../lib/db/schema";
import {
  getAdminSessionFromRequest,
  getClientSessionFromRequest,
} from "../../lib/session";

function isZipFile(filename: string, mimeType: string | null | undefined) {
  return (
    filename.toLowerCase().endsWith(".zip") ||
    mimeType === "application/zip" ||
    mimeType === "application/x-zip-compressed"
  );
}

export async function GET(request: NextRequest) {
  const session = await getAdminSessionFromRequest(request);
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get("clientId");
  const slug = searchParams.get("slug");
  const includeExpired = searchParams.get("includeExpired") === "true";

  if (session && clientId) {
    const id = Number(clientId);
    const records = includeExpired
      ? await db
          .select()
          .from(files)
          .where(eq(files.clientId, id))
          .orderBy(desc(files.uploadedAt))
      : await db
          .select()
          .from(files)
          .where(
            and(
              eq(files.clientId, id),
              or(
                eq(files.direction, FILE_DIRECTION_INBOUND),
                and(
                  eq(files.direction, FILE_DIRECTION_OUTBOUND),
                  gt(files.expiresAt, new Date())
                )
              )
            )
          )
          .orderBy(desc(files.uploadedAt));

    return NextResponse.json({ files: records });
  }

  if (slug) {
    const [client] = await db
      .select()
      .from(clients)
      .where(eq(clients.slug, slug))
      .limit(1);

    if (!client) {
      return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
    }

    const clientSession = await getClientSessionFromRequest(request);

    if (!clientSession || clientSession.clientId !== client.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const outbound = await db
      .select()
      .from(files)
      .where(
        and(
          eq(files.clientId, client.id),
          eq(files.direction, FILE_DIRECTION_OUTBOUND),
          gt(files.expiresAt, new Date())
        )
      )
      .orderBy(desc(files.uploadedAt));

    const inbound = await db
      .select()
      .from(files)
      .where(
        and(
          eq(files.clientId, client.id),
          eq(files.direction, FILE_DIRECTION_INBOUND)
        )
      )
      .orderBy(desc(files.uploadedAt));

    return NextResponse.json({ outbound, inbound, files: outbound });
  }

  return NextResponse.json({ error: "Parámetros inválidos" }, { status: 400 });
}

export async function POST(request: NextRequest) {
  const adminSession = await getAdminSessionFromRequest(request);
  const clientSession = await getClientSessionFromRequest(request);

  let body: {
    clientId?: number;
    blobUrl?: string;
    pathname?: string;
    filename?: string;
    size?: number;
    mimeType?: string | null;
    expiresAt?: string | null;
    direction?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  const { blobUrl, pathname, filename, size, mimeType } = body;

  if (!blobUrl || !pathname || !filename || typeof size !== "number") {
    return NextResponse.json(
      { error: "Faltan campos requeridos del archivo" },
      { status: 400 }
    );
  }

  const wantsInbound = body.direction === FILE_DIRECTION_INBOUND;

  if (wantsInbound) {
    if (!clientSession) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const clientId = clientSession.clientId;
    const [client] = await db
      .select()
      .from(clients)
      .where(eq(clients.id, clientId))
      .limit(1);

    if (!client) {
      return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
    }

    if (!pathname.startsWith(`clients/${client.slug}/inbound/`)) {
      return NextResponse.json({ error: "Ruta de archivo inválida" }, { status: 400 });
    }

    const [existing] = await db
      .select({ id: files.id })
      .from(files)
      .where(eq(files.pathname, pathname))
      .limit(1);

    if (existing) {
      return NextResponse.json({ file: existing, deduped: true });
    }

    const [record] = await db
      .insert(files)
      .values({
        clientId,
        blobUrl,
        pathname,
        filename,
        size,
        mimeType: mimeType || null,
        direction: FILE_DIRECTION_INBOUND,
        expiresAt: null,
        isZip: isZipFile(filename, mimeType),
      })
      .returning();

    return NextResponse.json({ file: record });
  }

  if (!adminSession) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { clientId, expiresAt } = body;
  if (!clientId || !expiresAt) {
    return NextResponse.json(
      { error: "Faltan campos requeridos del archivo" },
      { status: 400 }
    );
  }

  const [client] = await db
    .select()
    .from(clients)
    .where(eq(clients.id, clientId))
    .limit(1);

  if (!client) {
    return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
  }

  const [existing] = await db
    .select({ id: files.id })
    .from(files)
    .where(eq(files.pathname, pathname))
    .limit(1);

  if (existing) {
    return NextResponse.json({ file: existing, deduped: true });
  }

  const expiration = new Date(expiresAt);
  if (Number.isNaN(expiration.getTime())) {
    return NextResponse.json(
      { error: "Fecha de expiración inválida" },
      { status: 400 }
    );
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(expiresAt)) {
    expiration.setUTCHours(23, 59, 59, 999);
  }

  const [record] = await db
    .insert(files)
    .values({
      clientId,
      blobUrl,
      pathname,
      filename,
      size,
      mimeType: mimeType || null,
      direction: FILE_DIRECTION_OUTBOUND,
      expiresAt: expiration,
      isZip: isZipFile(filename, mimeType),
    })
    .returning();

  return NextResponse.json({ file: record });
}

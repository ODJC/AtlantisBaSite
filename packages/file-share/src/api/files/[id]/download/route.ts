import { eq } from "drizzle-orm";
import { get } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import {
  FILE_DIRECTION_INBOUND,
  FILE_DIRECTION_OUTBOUND,
  clients,
  files,
} from "../../../../lib/db/schema";
import {
  getAdminSessionFromRequest,
  getClientSessionFromRequest,
} from "../../../../lib/session";

type RouteContext = { params: Promise<{ id: string }> };

export const runtime = "nodejs";

export async function GET(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const fileId = Number(id);

  const [row] = await db
    .select({
      file: files,
      client: clients,
    })
    .from(files)
    .innerJoin(clients, eq(files.clientId, clients.id))
    .where(eq(files.id, fileId))
    .limit(1);

  if (!row) {
    return NextResponse.json({ error: "Archivo no encontrado" }, { status: 404 });
  }

  const adminSession = await getAdminSessionFromRequest(request);
  const clientSession = await getClientSessionFromRequest(request);
  const isAdmin = !!adminSession;
  const ownsClient = clientSession?.clientId === row.client.id;

  let allowed = false;
  if (isAdmin) {
    allowed = true;
  } else if (ownsClient) {
    if (row.file.direction === FILE_DIRECTION_INBOUND) {
      allowed = true;
    } else if (row.file.direction === FILE_DIRECTION_OUTBOUND) {
      if (!row.file.expiresAt || row.file.expiresAt <= new Date()) {
        return NextResponse.json({ error: "Archivo expirado" }, { status: 410 });
      }
      allowed = true;
    }
  }

  if (!allowed) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  await db
    .update(files)
    .set({ downloadCount: row.file.downloadCount + 1 })
    .where(eq(files.id, fileId));

  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  const result = await get(row.file.pathname, {
    access: "private",
    ...(blobToken ? { token: blobToken } : {}),
  });

  if (!result?.stream) {
    return NextResponse.json(
      { error: "No se pudo obtener el archivo" },
      { status: 404 }
    );
  }

  const headers = new Headers();
  headers.set(
    "Content-Type",
    row.file.mimeType || result.blob.contentType || "application/octet-stream"
  );
  headers.set(
    "Content-Disposition",
    `attachment; filename="${row.file.filename.replace(/"/g, "")}"`
  );
  headers.set("X-Content-Type-Options", "nosniff");
  if (row.file.size) {
    headers.set("Content-Length", String(row.file.size));
  }

  return new NextResponse(result.stream, { headers });
}

import { ZipArchive } from "archiver";
import { and, eq, gt } from "drizzle-orm";
import { get } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { PassThrough, Readable } from "stream";

import { db } from "../../../lib/db";
import { FILE_DIRECTION_OUTBOUND, clients, files } from "../../../lib/db/schema";
import { getClientSessionFromRequest } from "../../../lib/session";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  if (!slug) {
    return NextResponse.json({ error: "Slug requerido" }, { status: 400 });
  }

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

  const activeFiles = await db
    .select()
    .from(files)
    .where(
      and(
        eq(files.clientId, client.id),
        eq(files.direction, FILE_DIRECTION_OUTBOUND),
        gt(files.expiresAt, new Date())
      )
    );

  if (activeFiles.length === 0) {
    return NextResponse.json({ error: "No hay archivos disponibles" }, { status: 404 });
  }

  const archive = new ZipArchive({ zlib: { level: 9 } });
  const passThrough = new PassThrough();
  archive.pipe(passThrough);

  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;

  for (const file of activeFiles) {
    const result = await get(file.pathname, {
      access: "private",
      ...(blobToken ? { token: blobToken } : {}),
    });
    if (!result?.stream) continue;

    const reader = result.stream.getReader();
    const chunks: Uint8Array[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) chunks.push(value);
    }
    const buffer = Buffer.concat(chunks.map((c) => Buffer.from(c)));
    archive.append(buffer, { name: file.filename });

    await db
      .update(files)
      .set({ downloadCount: file.downloadCount + 1 })
      .where(eq(files.id, file.id));
  }

  await archive.finalize();

  const webStream = Readable.toWeb(passThrough) as ReadableStream;
  return new NextResponse(webStream, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${slug}-archivos.zip"`,
    },
  });
}

import { eq } from "drizzle-orm";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextRequest, NextResponse } from "next/server";
import { db } from "../../lib/db";
import {
  FILE_DIRECTION_INBOUND,
  FILE_DIRECTION_OUTBOUND,
  clients,
  files,
  type FileDirection,
} from "../../lib/db/schema";
import {
  getAdminSessionFromRequest,
  getClientSessionFromRequest,
} from "../../lib/session";

export const runtime = "nodejs";

const MAX_UPLOAD_BYTES = 250 * 1024 * 1024; // 250 MB

type UploadMeta = {
  direction: FileDirection;
  clientId: number;
  expiresAt: string | null;
  filename: string;
  size: number;
  mimeType: string | null;
};

function isZipFile(filename: string, mimeType: string | null | undefined) {
  return (
    filename.toLowerCase().endsWith(".zip") ||
    mimeType === "application/zip" ||
    mimeType === "application/x-zip-compressed"
  );
}

export async function POST(request: NextRequest) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      {
        error:
          "BLOB_READ_WRITE_TOKEN es requerida para subidas grandes. Conéctala en Vercel Storage y redespliega.",
      },
      { status: 503 }
    );
  }

  let body: HandleUploadBody;
  try {
    body = (await request.json()) as HandleUploadBody;
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      token: process.env.BLOB_READ_WRITE_TOKEN,
      onBeforeGenerateToken: async (_pathname, clientPayload) => {
        if (!clientPayload) {
          throw new Error("Faltan datos del archivo");
        }

        let meta: Partial<UploadMeta>;
        try {
          meta = JSON.parse(clientPayload) as Partial<UploadMeta>;
        } catch {
          throw new Error("Payload inválido");
        }

        if (!meta.filename) {
          throw new Error("Nombre de archivo requerido");
        }

        if (typeof meta.size === "number" && meta.size > MAX_UPLOAD_BYTES) {
          throw new Error("El archivo supera el límite de 250 MB");
        }

        const direction =
          meta.direction === FILE_DIRECTION_INBOUND
            ? FILE_DIRECTION_INBOUND
            : FILE_DIRECTION_OUTBOUND;

        const adminSession = await getAdminSessionFromRequest(request);
        const clientSession = await getClientSessionFromRequest(request);

        let clientId: number;
        let expiresAt: string | null = null;

        if (direction === FILE_DIRECTION_INBOUND) {
          if (!clientSession) {
            throw new Error("No autorizado");
          }
          // Bind to session — ignore forged clientId from payload
          clientId = clientSession.clientId;
          expiresAt = null;
        } else {
          if (!adminSession) {
            throw new Error("No autorizado");
          }
          if (!meta.clientId || !meta.expiresAt) {
            throw new Error("Cliente, fecha y nombre de archivo son requeridos");
          }
          clientId = meta.clientId;
          expiresAt = meta.expiresAt;

          const expiration = new Date(expiresAt);
          if (Number.isNaN(expiration.getTime())) {
            throw new Error("Fecha de expiración inválida");
          }
        }

        const [client] = await db
          .select()
          .from(clients)
          .where(eq(clients.id, clientId))
          .limit(1);

        if (!client) {
          throw new Error("Cliente no encontrado");
        }

        if (
          direction === FILE_DIRECTION_INBOUND &&
          clientSession &&
          client.slug !== clientSession.slug
        ) {
          throw new Error("No autorizado");
        }

        return {
          maximumSizeInBytes: MAX_UPLOAD_BYTES,
          validUntil: Date.now() + 2 * 60 * 60 * 1000,
          addRandomSuffix: false,
          allowOverwrite: false,
          tokenPayload: JSON.stringify({
            direction,
            clientId: client.id,
            expiresAt,
            filename: meta.filename,
            size: meta.size ?? 0,
            mimeType: meta.mimeType ?? null,
          } satisfies UploadMeta),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        if (!tokenPayload) {
          console.error("[upload] Missing tokenPayload on completion");
          return;
        }

        try {
          const meta = JSON.parse(tokenPayload) as UploadMeta;
          const [existing] = await db
            .select({ id: files.id })
            .from(files)
            .where(eq(files.pathname, blob.pathname))
            .limit(1);
          if (existing) return;

          let expiration: Date | null = null;
          if (meta.direction === FILE_DIRECTION_OUTBOUND && meta.expiresAt) {
            expiration = new Date(meta.expiresAt);
            if (/^\d{4}-\d{2}-\d{2}$/.test(meta.expiresAt)) {
              expiration.setUTCHours(23, 59, 59, 999);
            }
          }

          await db.insert(files).values({
            clientId: meta.clientId,
            blobUrl: blob.url,
            pathname: blob.pathname,
            filename: meta.filename,
            size: meta.size || 0,
            mimeType: meta.mimeType || blob.contentType || null,
            direction: meta.direction,
            expiresAt: expiration,
            isZip: isZipFile(meta.filename, meta.mimeType),
          });
        } catch (error) {
          console.error("[upload] onUploadCompleted failed", error);
        }
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error("[upload]", error);
    const message =
      error instanceof Error ? error.message : "Error al preparar la subida";

    const status =
      message === "No autorizado"
        ? 401
        : message.includes("no encontrado")
          ? 404
          : message.includes("requerid") ||
              message.includes("inválid") ||
              message.includes("límite")
            ? 400
            : 400;

    return NextResponse.json({ error: message }, { status });
  }
}

import { desc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { hashPassword } from "../../lib/auth";
import { db } from "../../lib/db";
import { getDbErrorResponse } from "../../lib/db-errors";
import { clients } from "../../lib/db/schema";
import { getAdminSessionFromRequest } from "../../lib/session";
import { slugify } from "../../lib/utils";

export async function GET(request: NextRequest) {
  const session = await getAdminSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const allClients = await db
      .select()
      .from(clients)
      .orderBy(desc(clients.createdAt));

    return NextResponse.json({ clients: allClients });
  } catch (error) {
    const { message, status } = getDbErrorResponse(error);
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: NextRequest) {
  const session = await getAdminSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { name, slug, password } = await request.json();

  if (!name) {
    return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });
  }

  if (!password) {
    return NextResponse.json({ error: "Contraseña requerida" }, { status: 400 });
  }

  const clientSlug = slugify(slug || name);
  const passwordHash = await hashPassword(password);

  try {
    const [client] = await db
      .insert(clients)
      .values({
        name,
        slug: clientSlug,
        passwordHash,
      })
      .returning();

    return NextResponse.json({
      client,
    });
  } catch (error) {
    const { message, status } = getDbErrorResponse(error);
    return NextResponse.json({ error: message }, { status });
  }
}

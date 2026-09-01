import { NextRequest, NextResponse } from "next/server";
import { verifyAdminPassword } from "../../../lib/auth";
import { setAdminSession } from "../../../lib/session";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const password = body?.password;

    if (!process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        {
          error:
            "ADMIN_PASSWORD no está configurada en Vercel. Agrégala en Settings → Environment Variables y redespliega.",
        },
        { status: 503 }
      );
    }

    if (!process.env.SESSION_SECRET) {
      return NextResponse.json(
        {
          error:
            "SESSION_SECRET no está configurada en Vercel. Agrégala en Settings → Environment Variables y redespliega.",
        },
        { status: 503 }
      );
    }

    if (!password || !verifyAdminPassword(password)) {
      return NextResponse.json(
        { error: "Contraseña incorrecta" },
        { status: 401 }
      );
    }

    await setAdminSession();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[auth/admin]", error);
    return NextResponse.json(
      { error: "Error al iniciar sesión. Revisa las variables de entorno." },
      { status: 500 }
    );
  }
}

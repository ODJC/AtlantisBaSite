export function getDbErrorResponse(error: unknown) {
  console.error("[db]", error);

  if (error instanceof Error) {
    if (error.message.includes("POSTGRES_URL")) {
      return {
        message:
          "Base de datos no configurada. Agrega POSTGRES_URL en .env.",
        status: 503,
      };
    }

    const cause = (error as { cause?: Error }).cause;
    if (
      error.message.includes("password authentication failed") ||
      cause?.message?.includes("password authentication failed")
    ) {
      return {
        message:
          "Contraseña de base de datos incorrecta. En Neon, restablece la contraseña y actualiza POSTGRES_URL en .env.",
        status: 503,
      };
    }

    if (
      error.message.includes('relation "clients" does not exist') ||
      error.message.includes('relation "files" does not exist')
    ) {
      return {
        message:
          "Las tablas no existen. Ejecuta npm run db:push.",
        status: 503,
      };
    }
  }

  const pgError = error as { code?: string; constraint?: string };
  if (pgError.code === "23505") {
    return {
      message: "El slug ya existe. Usa otro identificador.",
      status: 409,
    };
  }

  return {
    message: "Error de base de datos. Revisa la consola del servidor.",
    status: 500,
  };
}

import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <h1 className="text-3xl font-bold text-slate-900">Página no encontrada</h1>
      <p className="mt-2 text-slate-600">
        El cliente o recurso que buscas no existe.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex h-9 items-center justify-center rounded-md bg-[#0b57e3] px-4 text-sm font-medium text-white hover:bg-[#0846b8]"
      >
        Volver al inicio
      </Link>
    </main>
  );
}

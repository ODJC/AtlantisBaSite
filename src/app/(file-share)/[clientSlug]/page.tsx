export const dynamic = "force-dynamic";

import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import {
  ClientPortal,
  clients,
  db,
  getClientSessionForSlug,
} from "@atlantis/file-share";

type PageProps = {
  params: Promise<{ clientSlug: string }>;
};

export default async function ClientPage({ params }: PageProps) {
  const { clientSlug } = await params;

  const [client] = await db
    .select()
    .from(clients)
    .where(eq(clients.slug, clientSlug))
    .limit(1);

  if (!client) {
    notFound();
  }

  const session = await getClientSessionForSlug(clientSlug);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <ClientPortal
        slug={client.slug}
        clientName={client.name}
        initialAuthenticated={!!session}
      />
    </main>
  );
}

export const dynamic = "force-dynamic";

import { AdminPortal, getAdminSession } from "@atlantis/file-share";

export default async function AdminPage() {
  const session = await getAdminSession();

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-50 px-4 py-10">
      <AdminPortal initialAuthenticated={!!session} />
    </main>
  );
}

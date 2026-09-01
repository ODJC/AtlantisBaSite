"use client";

import { useState } from "react";
import { ClientFileList } from "./client-file-list";
import { ClientLogin } from "./client-login";

export function ClientPortal({
  slug,
  clientName,
  initialAuthenticated,
}: {
  slug: string;
  clientName: string;
  initialAuthenticated: boolean;
}) {
  const [authenticated, setAuthenticated] = useState(initialAuthenticated);

  if (!authenticated) {
    return (
      <ClientLogin
        slug={slug}
        clientName={clientName}
        onSuccess={() => setAuthenticated(true)}
      />
    );
  }

  return (
    <ClientFileList
      slug={slug}
      clientName={clientName}
      onLogout={() => setAuthenticated(false)}
    />
  );
}

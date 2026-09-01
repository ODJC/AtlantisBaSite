"use client";

import { useState } from "react";
import { AdminDashboard } from "./admin-dashboard";
import { AdminLogin } from "./admin-login";

export function AdminPortal({ initialAuthenticated }: { initialAuthenticated: boolean }) {
  const [authenticated, setAuthenticated] = useState(initialAuthenticated);

  if (!authenticated) {
    return <AdminLogin onSuccess={() => setAuthenticated(true)} />;
  }

  return <AdminDashboard onLogout={() => setAuthenticated(false)} />;
}

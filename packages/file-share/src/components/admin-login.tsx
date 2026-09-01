"use client";

import { useState } from "react";
import Image from "next/image";
import { useFileShareBrand } from "../brand";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";

export function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const brand = useFileShareBrand();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        let message = "Error al iniciar sesión";
        try {
          const data = await res.json();
          message = data.error || message;
        } catch {
          message = `Error del servidor (${res.status}). Revisa SESSION_SECRET y ADMIN_PASSWORD en Vercel.`;
        }
        setError(message);
        setLoading(false);
        return;
      }

      onSuccess();
    } catch {
      setError("No se pudo conectar con el servidor.");
      setLoading(false);
    }
  }

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader className="text-center">
        <Image
          src={brand.logoSrc}
          alt={brand.logoAlt ?? brand.name}
          width={320}
          height={88}
          className="mx-auto mb-4 h-auto w-72 object-contain"
          priority
        />
        <CardTitle>Admin</CardTitle>
        <CardDescription>Ingresa la contraseña de administrador.</CardDescription>
        <p className="mt-2 text-xs font-medium tracking-wide text-slate-400">
          v{brand.version ?? "1.0"}
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="admin-password">Contraseña</Label>
            <Input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Verificando..." : "Entrar"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

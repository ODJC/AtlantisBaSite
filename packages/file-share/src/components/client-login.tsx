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
  CardHeader,
  CardTitle,
} from "./ui/card";

export function ClientLogin({
  slug,
  clientName,
  onSuccess,
}: {
  slug: string;
  clientName: string;
  onSuccess: () => void;
}) {
  const brand = useFileShareBrand();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/client", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, password }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Error al iniciar sesión");
      setLoading(false);
      return;
    }

    onSuccess();
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
        <CardTitle>Portal de {clientName}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Verificando..." : "Acceder"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

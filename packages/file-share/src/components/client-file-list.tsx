"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useDropzone } from "react-dropzone";
import { upload } from "@vercel/blob/client";
import { Download, LogOut, RefreshCw, Upload } from "lucide-react";
import { useFileShareBrand } from "../brand";
import { Badge } from "./ui/badge";
import { Button, buttonVariants } from "./ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { TabsList, TabsTrigger } from "./ui/tabs";
import {
  daysUntilExpiration,
  expirationLabel,
  formatDateTime,
} from "../lib/dates";
import { cn, formatBytes } from "../lib/utils";

type FileItem = {
  id: number;
  filename: string;
  size: number;
  uploadedAt: string;
  expiresAt: string | null;
  downloadCount: number;
  isZip: boolean;
  direction?: string;
};

type ClientTab = "download" | "upload";

export function ClientFileList({
  slug,
  clientName,
  onLogout,
}: {
  slug: string;
  clientName: string;
  onLogout: () => void;
}) {
  const brand = useFileShareBrand();
  const [tab, setTab] = useState<ClientTab>("download");
  const [outbound, setOutbound] = useState<FileItem[]>([]);
  const [inbound, setInbound] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState("");

  const loadFiles = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/files?slug=${slug}`);
    if (res.ok) {
      const data = await res.json();
      setOutbound(data.outbound ?? data.files ?? []);
      setInbound(data.inbound ?? []);
    }
    setLoading(false);
  }, [slug]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const onDrop = useCallback((accepted: File[]) => {
    setPendingFiles((prev) => [...prev, ...accepted]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
  });

  async function handleLogout() {
    await fetch("/api/auth/client/logout", { method: "POST" });
    onLogout();
  }

  async function handleUpload() {
    if (pendingFiles.length === 0) return;

    setUploading(true);
    setUploadProgress(0);
    setMessage("");

    try {
      const totalBytes = pendingFiles.reduce((sum, file) => sum + file.size, 0);
      let uploadedBytes = 0;

      for (const file of pendingFiles) {
        const pathname = `clients/${slug}/inbound/${crypto.randomUUID()}-${file.name}`;
        const fileStart = uploadedBytes;

        const blob = await upload(pathname, file, {
          access: "private",
          handleUploadUrl: "/api/upload",
          multipart: file.size > 8 * 1024 * 1024,
          clientPayload: JSON.stringify({
            direction: "inbound",
            filename: file.name,
            size: file.size,
            mimeType: file.type || null,
          }),
          onUploadProgress: ({ loaded }) => {
            const overall = fileStart + loaded;
            setUploadProgress(
              Math.min(100, Math.round((overall / totalBytes) * 100))
            );
          },
        });

        const registerRes = await fetch("/api/files", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            direction: "inbound",
            blobUrl: blob.url,
            pathname: blob.pathname,
            filename: file.name,
            size: file.size,
            mimeType: file.type || blob.contentType || null,
          }),
        });

        if (!registerRes.ok) {
          const data = (await registerRes.json().catch(() => ({}))) as {
            error?: string;
          };
          throw new Error(
            data.error || "El archivo se subió pero no se pudo registrar"
          );
        }

        uploadedBytes += file.size;
        setUploadProgress(
          Math.min(100, Math.round((uploadedBytes / totalBytes) * 100))
        );
      }

      setPendingFiles([]);
      setTab("upload");
      setMessage("Archivos enviados correctamente.");
      await loadFiles();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "No se pudo subir el archivo. Intenta de nuevo."
      );
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <div className="grid grid-cols-3 items-center gap-4">
        <Image
          src={brand.logoSrc}
          alt={brand.logoAlt ?? brand.name}
          width={280}
          height={80}
          className="h-20 w-auto justify-self-start object-contain"
          priority
        />
        <h1 className="text-center text-2xl font-bold text-slate-900">
          Documentación {clientName}
        </h1>
        <div className="flex gap-2 justify-self-end">
          <Button variant="outline" size="sm" onClick={loadFiles}>
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </Button>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Salir
          </Button>
        </div>
      </div>

      {message && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          {message}
        </div>
      )}

      <Card>
        <CardHeader className="space-y-4">
          <TabsList>
            <TabsTrigger
              selected={tab === "download"}
              onClick={() => setTab("download")}
            >
              <Download className="h-4 w-4" />
              Descargar ({outbound.length})
            </TabsTrigger>
            <TabsTrigger
              selected={tab === "upload"}
              onClick={() => setTab("upload")}
            >
              <Upload className="h-4 w-4" />
              Subir ({inbound.length})
            </TabsTrigger>
          </TabsList>
          <CardTitle>
            {tab === "download"
              ? "Archivos para descargar"
              : "Archivos Cargados"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tab === "download" ? (
            loading ? (
              <p className="text-sm text-slate-500">Cargando archivos...</p>
            ) : outbound.length === 0 ? (
              <p className="text-sm text-slate-500">
                No hay documentos disponibles en este momento.
              </p>
            ) : (
              <div className="divide-y divide-slate-100">
                {outbound.map((file) => {
                  const days = daysUntilExpiration(file.expiresAt);
                  const variant =
                    days <= 3 ? "warning" : days <= 7 ? "secondary" : "success";

                  return (
                    <div
                      key={file.id}
                      className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate font-medium text-slate-900">
                            {file.filename}
                          </p>
                          {file.isZip && (
                            <Badge variant="secondary">ZIP</Badge>
                          )}
                          <Badge variant="default">Para descargar</Badge>
                        </div>
                        <p className="mt-1 text-sm text-slate-500">
                          {formatBytes(file.size)} · Subido{" "}
                          {formatDateTime(file.uploadedAt)}
                        </p>
                        <Badge variant={variant} className="mt-2">
                          {expirationLabel(file.expiresAt)}
                        </Badge>
                      </div>
                      <a
                        href={`/api/files/${file.id}/download`}
                        className={cn(buttonVariants())}
                      >
                        <Download className="h-4 w-4" />
                        Descargar
                      </a>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            <div className="space-y-6">
              <div
                {...getRootProps()}
                className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
                  isDragActive
                    ? "border-[var(--fs-ring,#14b8a6)] bg-[var(--fs-primary-soft,#f0fdfa)]"
                    : "border-slate-200 hover:border-[var(--fs-primary-muted,#5eead4)] hover:bg-slate-50"
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="mx-auto mb-3 h-8 w-8 text-slate-400" />
                <p className="text-sm font-medium text-slate-700">
                  {isDragActive
                    ? "Suelta los archivos aquí"
                    : "Arrastra archivos o haz clic para seleccionar"}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Hasta 250 MB por archivo · soporta .zip
                </p>
              </div>

              {pendingFiles.length > 0 && (
                <div className="rounded-lg bg-slate-50 p-3 text-sm">
                  <p className="font-medium">
                    {pendingFiles.length} archivo(s) listo(s):
                  </p>
                  <ul className="mt-2 max-h-32 space-y-1 overflow-y-auto text-slate-600">
                    {pendingFiles.map((file) => (
                      <li key={`${file.name}-${file.size}`}>
                        {file.name} ({formatBytes(file.size)})
                      </li>
                    ))}
                  </ul>
                  <Button
                    type="button"
                    className="mt-3"
                    onClick={handleUpload}
                    disabled={uploading}
                  >
                    {uploading
                      ? `Enviando… ${uploadProgress}%`
                      : "Enviar archivos"}
                  </Button>
                </div>
              )}

              {loading ? (
                <p className="text-sm text-slate-500">Cargando envíos...</p>
              ) : inbound.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {inbound.map((file) => (
                    <div
                      key={file.id}
                      className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate font-medium text-slate-900">
                            {file.filename}
                          </p>
                          {file.isZip && (
                            <Badge variant="secondary">ZIP</Badge>
                          )}
                          <Badge variant="secondary">Enviado por ti</Badge>
                        </div>
                        <p className="mt-1 text-sm text-slate-500">
                          {formatBytes(file.size)} · Enviado{" "}
                          {formatDateTime(file.uploadedAt)}
                        </p>
                      </div>
                      <a
                        href={`/api/files/${file.id}/download`}
                        className={cn(
                          buttonVariants({ variant: "outline" })
                        )}
                      >
                        <Download className="h-4 w-4" />
                        Descargar
                      </a>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

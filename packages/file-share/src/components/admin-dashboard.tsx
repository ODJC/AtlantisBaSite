"use client";

import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  Download,
  FolderUp,
  LogOut,
  Plus,
  RefreshCw,
  Trash2,
  Upload,
  UserPlus,
} from "lucide-react";
import Image from "next/image";
import { useFileShareBrand } from "../brand";
import { Badge } from "./ui/badge";
import { Button, buttonVariants } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select } from "./ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  expirationLabel,
  formatDateTime,
  isExpired,
} from "../lib/dates";
import { upload } from "@vercel/blob/client";
import { cn, formatBytes, slugify } from "../lib/utils";

type Client = {
  id: number;
  slug: string;
  name: string;
  createdAt: string;
};

type FileItem = {
  id: number;
  clientId: number;
  filename: string;
  size: number;
  uploadedAt: string;
  expiresAt: string | null;
  downloadCount: number;
  isZip: boolean;
  direction: "outbound" | "inbound";
};

export function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const brand = useFileShareBrand();
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<number | "">("");
  const [files, setFiles] = useState<FileItem[]>([]);
  const [expiresAt, setExpiresAt] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [newClientName, setNewClientName] = useState("");
  const [newClientSlug, setNewClientSlug] = useState("");
  const [newClientPassword, setNewClientPassword] = useState("");
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [expirationModalOpen, setExpirationModalOpen] = useState(false);
  const [editingFile, setEditingFile] = useState<FileItem | null>(null);
  const [editExpiresAt, setEditExpiresAt] = useState("");
  const [updatingExpiration, setUpdatingExpiration] = useState(false);
  const [creatingClient, setCreatingClient] = useState(false);

  const loadClients = useCallback(async () => {
    const res = await fetch("/api/clients");
    const data = await res.json();
    if (res.ok) {
      setClients(data.clients);
      if (data.clients.length > 0 && !selectedClientId) {
        setSelectedClientId(data.clients[0].id);
      }
    } else {
      setMessage(data.error || "No se pudieron cargar los clientes.");
    }
  }, [selectedClientId]);

  const loadFiles = useCallback(async () => {
    if (!selectedClientId) return;
    const res = await fetch(
      `/api/files?clientId=${selectedClientId}&includeExpired=true`
    );
    if (res.ok) {
      const data = await res.json();
      setFiles(data.files);
    }
  }, [selectedClientId]);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

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

  function resetUploadForm() {
    setPendingFiles([]);
    setExpiresAt("");
  }

  function resetClientForm() {
    setNewClientName("");
    setNewClientSlug("");
    setNewClientPassword("");
  }

  function closeUploadModal() {
    setUploadModalOpen(false);
    resetUploadForm();
  }

  async function handleUpload() {
    if (!selectedClientId || !expiresAt || pendingFiles.length === 0) {
      setMessage("Selecciona cliente, fecha de expiración y al menos un archivo.");
      return;
    }

    const client = clients.find((c) => c.id === selectedClientId);
    if (!client) {
      setMessage("Cliente no encontrado.");
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setMessage("");

    try {
      const totalBytes = pendingFiles.reduce((sum, file) => sum + file.size, 0);
      let uploadedBytes = 0;

      for (const file of pendingFiles) {
        const pathname = `clients/${client.slug}/${crypto.randomUUID()}-${file.name}`;
        const fileStart = uploadedBytes;

        const blob = await upload(pathname, file, {
          access: "private",
          handleUploadUrl: "/api/upload",
          multipart: file.size > 8 * 1024 * 1024,
          clientPayload: JSON.stringify({
            direction: "outbound",
            clientId: client.id,
            expiresAt,
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
            direction: "outbound",
            clientId: client.id,
            blobUrl: blob.url,
            pathname: blob.pathname,
            filename: file.name,
            size: file.size,
            mimeType: file.type || blob.contentType || null,
            expiresAt,
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

      closeUploadModal();
      setMessage("Archivos subidos correctamente.");
      await loadFiles();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo subir el archivo. Intenta de nuevo.";
      setMessage(message);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }

  async function handleCreateClient(e: React.FormEvent) {
    e.preventDefault();
    setCreatingClient(true);
    setMessage("");

    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newClientName,
          slug: newClientSlug || slugify(newClientName),
          password: newClientPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Error al crear cliente");
        return;
      }

      resetClientForm();
      setClientModalOpen(false);
      setSelectedClientId(data.client.id);
      await loadClients();
      setMessage(`Cliente "${data.client.name}" creado.`);
    } catch {
      setMessage("Error al crear cliente");
    } finally {
      setCreatingClient(false);
    }
  }

  function openExpirationModal(file: FileItem) {
    if (!file.expiresAt) return;
    setEditingFile(file);
    setEditExpiresAt(file.expiresAt.slice(0, 10));
    setExpirationModalOpen(true);
  }

  function closeExpirationModal() {
    setExpirationModalOpen(false);
    setEditingFile(null);
    setEditExpiresAt("");
  }

  async function handleUpdateExpiration() {
    if (!editingFile || !editExpiresAt) return;

    setUpdatingExpiration(true);
    try {
      const res = await fetch(`/api/files/${editingFile.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expiresAt: new Date(editExpiresAt).toISOString(),
        }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        setMessage(data.error || "No se pudo actualizar la expiración.");
        return;
      }

      closeExpirationModal();
      setMessage("Expiración actualizada.");
      await loadFiles();
    } catch {
      setMessage("No se pudo actualizar la expiración.");
    } finally {
      setUpdatingExpiration(false);
    }
  }

  async function handleDeleteFile(fileId: number) {
    if (!confirm("¿Eliminar este archivo?")) return;
    await fetch(`/api/files/${fileId}`, { method: "DELETE" });
    loadFiles();
  }

  async function handleLogout() {
    await fetch("/api/auth/admin/logout", { method: "POST" });
    onLogout();
  }

  const selectedClient = clients.find((c) => c.id === selectedClientId);
  const outboundFiles = files.filter(
    (f) => (f.direction ?? "outbound") === "outbound"
  );
  const inboundFiles = files.filter((f) => f.direction === "inbound");
  const dbSetupNeeded =
    message.includes("POSTGRES_URL") ||
    message.includes("tablas no existen") ||
    message.includes("Tablas no existen");

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8">
      <div className="grid grid-cols-3 items-center gap-4">
        <Image
          src={brand.logoSrc}
          alt={brand.logoAlt ?? brand.name}
          width={280}
          height={80}
          className="h-20 w-auto justify-self-start object-contain"
          priority
        />
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Panel de administración
          </h1>
          <p className="mt-1 text-xs font-medium tracking-wide text-slate-400">
            v{brand.version ?? "1.0"}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleLogout}
          className="justify-self-end"
        >
          <LogOut className="h-4 w-4" />
          Salir
        </Button>
      </div>

      {message && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            dbSetupNeeded
              ? "border-red-200 bg-red-50 text-red-800"
              : "border-[var(--fs-primary-muted,#99f6e4)] bg-[var(--fs-primary-soft,#f0fdfa)] text-[var(--fs-badge-fg,#115e59)]"
          }`}
        >
          {message}
        </div>
      )}

      {dbSetupNeeded && (
        <Card className="border-red-200 bg-red-50/40">
          <CardHeader>
            <CardTitle>Configurar base de datos</CardTitle>
            <CardDescription>
              Sigue estos pasos para que el panel funcione en local.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-700">
            <ol className="list-decimal space-y-2 pl-5">
              <li>
                En{" "}
                <a
                  href="https://vercel.com/dashboard"
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-[var(--fs-primary,#0f766e)] underline"
                >
                  Vercel
                </a>
                , abre tu proyecto Savitar → <strong>Storage</strong> → crea una
                base Neon (o usa{" "}
                <a
                  href="https://neon.tech"
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-[var(--fs-primary,#0f766e)] underline"
                >
                  neon.tech
                </a>
                ).
              </li>
              <li>
                Copia la connection string y pégala en{" "}
                <code className="rounded bg-white px-1.5 py-0.5">.env</code>{" "}
                como <code className="rounded bg-white px-1.5 py-0.5">POSTGRES_URL</code>.
              </li>
              <li>
                En terminal:{" "}
                <code className="rounded bg-white px-1.5 py-0.5">npm run db:push</code>
              </li>
              <li>
                Reinicia el servidor:{" "}
                <code className="rounded bg-white px-1.5 py-0.5">npm run dev</code>
              </li>
            </ol>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setClientModalOpen(true)}
          className="group flex items-center gap-5 rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition-all hover:border-[var(--fs-primary-muted,#5eead4)] hover:shadow-md"
        >
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[var(--fs-primary,#0f766e)] text-[var(--fs-primary-fg,#fff)] transition-transform group-hover:scale-105">
            <UserPlus className="h-7 w-7" />
          </div>
          <p className="text-lg font-semibold text-slate-900">Agregar cliente</p>
        </button>

        <button
          type="button"
          onClick={() => setUploadModalOpen(true)}
          className="group flex items-center gap-5 rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition-all hover:border-[var(--fs-primary-muted,#5eead4)] hover:shadow-md"
        >
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white transition-transform group-hover:scale-105">
            <FolderUp className="h-7 w-7" />
          </div>
          <p className="text-lg font-semibold text-slate-900">Subir archivo</p>
        </button>
      </div>

      <Dialog
        open={clientModalOpen}
        onOpenChange={(open) => {
          setClientModalOpen(open);
          if (!open) resetClientForm();
        }}
      >
        <DialogContent
          className="relative"
          onClose={() => setClientModalOpen(false)}
        >
          <DialogHeader>
            <DialogTitle>Agregar cliente</DialogTitle>
            <DialogDescription>
              Cada cliente tendrá una URL única, por ejemplo{" "}
              <code className="rounded bg-slate-100 px-1">/banrural</code>
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateClient} className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input
                value={newClientName}
                onChange={(e) => setNewClientName(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label>Slug (URL)</Label>
              <Input
                value={newClientSlug}
                onChange={(e) => setNewClientSlug(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Contraseña</Label>
              <Input
                type="password"
                value={newClientPassword}
                onChange={(e) => setNewClientPassword(e.target.value)}
                required
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setClientModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={creatingClient}>
                <Plus className="h-4 w-4" />
                {creatingClient ? "Creando..." : "Crear cliente"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={uploadModalOpen}
        onOpenChange={(open) => {
          if (!open) closeUploadModal();
          else setUploadModalOpen(true);
        }}
      >
        <DialogContent className="relative" onClose={closeUploadModal}>
          <DialogHeader>
            <DialogTitle>Subir archivo</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Cliente</Label>
              <Select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(Number(e.target.value))}
              >
                <option value="">Seleccionar cliente</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name} (/{client.slug})
                  </option>
                ))}
              </Select>
              {clients.length === 0 && (
                <p className="text-xs text-amber-600">
                  Primero debes crear un cliente.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Fecha de expiración</Label>
              <Input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
              />
            </div>

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
                Soporta múltiples archivos y .zip
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
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeUploadModal}>
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleUpload}
                disabled={
                  uploading ||
                  pendingFiles.length === 0 ||
                  !selectedClientId ||
                  !expiresAt
                }
              >
                {uploading
                  ? `Subiendo… ${uploadProgress}%`
                  : "Subir archivos"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={expirationModalOpen}
        onOpenChange={(open) => {
          if (!open) closeExpirationModal();
          else setExpirationModalOpen(true);
        }}
      >
        <DialogContent className="relative" onClose={closeExpirationModal}>
          <DialogHeader>
            <DialogTitle>Editar expiración</DialogTitle>
            {editingFile && (
              <DialogDescription>{editingFile.filename}</DialogDescription>
            )}
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nueva fecha de expiración</Label>
              <Input
                type="date"
                value={editExpiresAt}
                onChange={(e) => setEditExpiresAt(e.target.value)}
                autoFocus
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={closeExpirationModal}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleUpdateExpiration}
                disabled={updatingExpiration || !editExpiresAt}
              >
                {updatingExpiration ? "Guardando..." : "Guardar"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <div className="flex flex-row items-center justify-between gap-4">
            <CardTitle className="shrink-0">
              Archivos {selectedClient ? `· ${selectedClient.name}` : ""}
            </CardTitle>
            <div className="flex flex-row items-center gap-2">
              <Select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(Number(e.target.value))}
                className="min-w-[180px] sm:min-w-[220px]"
              >
                <option value="">Seleccionar cliente</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name} (/{client.slug})
                  </option>
                ))}
              </Select>
              <Button variant="outline" size="sm" onClick={loadFiles}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!selectedClient ? (
            <p className="text-sm text-slate-500">
              {clients.length === 0
                ? "No hay clientes. Usa Agregar cliente para crear uno."
                : "Selecciona un cliente arriba."}
            </p>
          ) : (
            <div className="space-y-8">
              <section>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Enviados al cliente
                </h3>
                {outboundFiles.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No has enviado archivos a este cliente.
                  </p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {outboundFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 lg:flex-row lg:items-center lg:justify-between"
                      >
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-medium">{file.filename}</p>
                            {file.isZip && (
                              <Badge variant="secondary">ZIP</Badge>
                            )}
                            {isExpired(file.expiresAt) && (
                              <Badge variant="destructive">Expirado</Badge>
                            )}
                          </div>
                          <p className="mt-1 text-sm text-slate-500">
                            {formatBytes(file.size)} ·{" "}
                            {formatDateTime(file.uploadedAt)} ·{" "}
                            {file.downloadCount} descargas
                          </p>
                          <Badge
                            variant={
                              isExpired(file.expiresAt)
                                ? "destructive"
                                : "success"
                            }
                            className="mt-2"
                          >
                            {expirationLabel(file.expiresAt)}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <a
                            href={`/api/files/${file.id}/download`}
                            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                          >
                            <Download className="h-4 w-4" />
                            Descargar
                          </a>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openExpirationModal(file)}
                          >
                            Editar expiración
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteFile(file.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Recibidos del cliente
                </h3>
                {inboundFiles.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    El cliente aún no ha enviado archivos.
                  </p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {inboundFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 lg:flex-row lg:items-center lg:justify-between"
                      >
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-medium">{file.filename}</p>
                            {file.isZip && (
                              <Badge variant="secondary">ZIP</Badge>
                            )}
                            <Badge variant="secondary">Del cliente</Badge>
                          </div>
                          <p className="mt-1 text-sm text-slate-500">
                            {formatBytes(file.size)} ·{" "}
                            {formatDateTime(file.uploadedAt)}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <a
                            href={`/api/files/${file.id}/download`}
                            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                          >
                            <Download className="h-4 w-4" />
                            Descargar
                          </a>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteFile(file.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

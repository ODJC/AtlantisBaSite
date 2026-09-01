# Atlantis BA

Next.js app that serves the [atlantisba.com](https://atlantisba.com/) marketing site, the email signature generator, and the client file-share portal.

## URLs

| Path | What |
|------|------|
| `/` | Marketing homepage (`content/landing.html`) |
| `/blog.html` | Blog |
| `/contacto.html` | Contact |
| `/firmas` | Signature generator UI (password protected) |
| `/firmas/preview` | Signature preview |
| `/api/generate` | PNG generation API |
| `/admin` | File-share admin (upload to clients, view client uploads) |
| `/[clientSlug]` | Client portal: **Descargar** / **Subir** tabs |

## Firmas access

Set a password before using the generator:

```bash
cp .env.example .env.local
# edit FIRMAS_PASSWORD
```

On Vercel, add `FIRMAS_PASSWORD` (and optionally `FIRMAS_AUTH_SECRET`) in project environment variables.

Protected routes redirect to `/firmas/login` until authenticated.

## File share

Uses a vendored `@atlantis/file-share` package (`packages/file-share`). Give Atlantis its **own** Postgres, Blob store, and admin password — do not reuse Savitar or OMA credentials.

```bash
cp .env.example .env.local
# set POSTGRES_URL, BLOB_READ_WRITE_TOKEN, ADMIN_PASSWORD, SESSION_SECRET
npm run db:push
```

Client portal: files you send them appear under **Descargar**; files they upload appear under **Subir** as **Archivos Cargados** (no expiry, they cannot delete or edit).

## Develop

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Production

```bash
npm run build
npm start
```

Deploy as a **Next.js** app on Vercel (not a static export). See `vercel.json`.

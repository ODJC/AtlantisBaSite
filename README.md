# Atlantis BA

Next.js app that serves the [atlantisba.com](https://atlantisba.com/) marketing site and hosts the email signature generator.

## URLs

| Path | What |
|------|------|
| `/` | Marketing homepage (`content/landing.html`) |
| `/blog.html` | Blog |
| `/contacto.html` | Contact |
| `/firmas` | Signature generator UI (password protected) |
| `/firmas/preview` | Signature preview |
| `/api/generate` | PNG generation API |

## Firmas access

Set a password before using the generator:

```bash
cp .env.example .env.local
# edit FIRMAS_PASSWORD
```

On Vercel, add `FIRMAS_PASSWORD` (and optionally `FIRMAS_AUTH_SECRET`) in project environment variables.

Protected routes redirect to `/firmas/login` until authenticated.

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

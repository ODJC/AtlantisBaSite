# Atlantis BA

Next.js app that serves the [atlantisba.com](https://atlantisba.com/) marketing site and hosts the email signature generator.

## URLs

| Path | What |
|------|------|
| `/` | Marketing homepage (`content/landing.html`) |
| `/blog.html` | Blog |
| `/contacto.html` | Contact |
| `/firmas` | Signature generator UI |
| `/firmas/preview` | Signature preview |
| `/api/generate` | PNG generation API |

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

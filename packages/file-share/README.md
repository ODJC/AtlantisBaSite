# @atlantis/file-share

Reusable multi-client file sharing UI and API routes for Atlantis Next.js sites.

## Install

```bash
npm install github:ODJC/atlantis-file-share#v0.1.0
```

Add the package to `transpilePackages` in `next.config`:

```js
transpilePackages: ["@atlantis/file-share"],
```

## Environment variables

| Variable | Purpose |
| --- | --- |
| `POSTGRES_URL` | Neon / Postgres connection string |
| `SESSION_SECRET` | Secret for signing admin/client session cookies |
| `ADMIN_PASSWORD` | Shared admin portal password |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token for uploads |

## Branding

Wrap portals with `FileShareBrandProvider`:

```tsx
import {
  FileShareBrandProvider,
  AdminPortal,
  ClientPortal,
} from "@atlantis/file-share";

<FileShareBrandProvider
  brand={{
    name: "Acme",
    logoSrc: "/logo.png",
    logoAlt: "Acme",
    colors: { primary: "#262454" },
  }}
>
  <AdminPortal />
</FileShareBrandProvider>
```

`colors.primary` is a hex highlight used for buttons, links, focus rings, and badges. Hover, soft wash, and muted border tints are derived automatically. Each host (OMA, Savitar, …) passes its own primary; omitting `colors` keeps the previous teal (`#0f766e`).

## Thin Next.js route re-exports

Point your App Router API routes at the package exports:

```ts
// app/api/upload/route.ts
export { POST } from "@atlantis/file-share/api/upload";

// app/api/files/route.ts
export { GET, POST } from "@atlantis/file-share/api/files";

// app/api/files/[id]/route.ts
export { GET, PATCH, DELETE } from "@atlantis/file-share/api/files/[id]";

// app/api/files/[id]/download/route.ts
export { GET } from "@atlantis/file-share/api/files/[id]/download";

// app/api/files/download-all/route.ts
export { GET } from "@atlantis/file-share/api/files/download-all";

// app/api/clients/route.ts
export { GET, POST } from "@atlantis/file-share/api/clients";

// app/api/clients/[id]/route.ts
export { GET, PATCH, DELETE, PUT } from "@atlantis/file-share/api/clients/[id]";

// app/api/auth/admin/route.ts
export { POST } from "@atlantis/file-share/api/auth/admin";

// app/api/auth/admin/logout/route.ts
export { POST } from "@atlantis/file-share/api/auth/admin/logout";

// app/api/auth/client/route.ts
export { POST } from "@atlantis/file-share/api/auth/client";

// app/api/auth/client/logout/route.ts
export { POST } from "@atlantis/file-share/api/auth/client/logout";
```

## Database

Apply the Drizzle schema from `@atlantis/file-share/schema` (`clients` and `files` tables) to your Postgres database before using the portals.

## Package exports

- `@atlantis/file-share` — portals, brand provider, `db`, schema, session helpers
- `@atlantis/file-share/api/*` — route handlers listed above
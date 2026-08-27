import type { ReactNode } from "react";

/**
 * Minimal root shell required by the App Router.
 * Marketing HTML is returned by route.ts as a raw Response and never
 * renders through this layout. Generator UI styles live under /firmas.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}

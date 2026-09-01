"use client";
import { createContext, useContext, type CSSProperties } from "react";

export type FileShareBrandColors = {
  /** Main highlight: buttons, links, focus rings */
  primary: string;
  primaryHover?: string;
  primaryForeground?: string;
  /** Light wash for badges, alerts, dropzones */
  primarySoft?: string;
  /** Mid tint for borders and hover outlines */
  primaryMuted?: string;
  ring?: string;
  badge?: string;
  badgeForeground?: string;
};

export type FileShareBrand = {
  name: string;
  logoSrc: string;
  logoAlt?: string;
  /** Shown on the admin screens, e.g. "1.0" */
  version?: string;
  colors?: Partial<FileShareBrandColors>;
};

/** Teal-700 — previous hardcoded UI, kept as default for hosts that omit colors */
export const DEFAULT_BRAND_PRIMARY = "#0f766e";

const defaultBrand: FileShareBrand = {
  name: "File Share",
  logoSrc: "/logo.png",
  logoAlt: "Logo",
  version: "1.0",
  colors: { primary: DEFAULT_BRAND_PRIMARY },
};

type ResolvedBrandColors = Required<FileShareBrandColors>;

function normalizeHex(hex: string): string {
  const h = hex.trim().replace(/^#/, "");
  if (h.length === 3) {
    return `#${h[0]}${h[0]}${h[1]}${h[1]}${h[2]}${h[2]}`;
  }
  return `#${h.slice(0, 6)}`;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = normalizeHex(hex).slice(1);
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  const to = (n: number) =>
    Math.max(0, Math.min(255, Math.round(n)))
      .toString(16)
      .padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`;
}

function mix(hex: string, withHex: string, amount: number): string {
  const a = hexToRgb(hex);
  const b = hexToRgb(withHex);
  return rgbToHex(
    a.r + (b.r - a.r) * amount,
    a.g + (b.g - a.g) * amount,
    a.b + (b.b - a.b) * amount
  );
}

export function resolveBrandColors(
  colors?: Partial<FileShareBrandColors>
): ResolvedBrandColors {
  const primary = colors?.primary ?? DEFAULT_BRAND_PRIMARY;
  return {
    primary,
    primaryHover: colors?.primaryHover ?? mix(primary, "#000000", 0.18),
    primaryForeground: colors?.primaryForeground ?? "#ffffff",
    primarySoft: colors?.primarySoft ?? mix(primary, "#ffffff", 0.92),
    primaryMuted: colors?.primaryMuted ?? mix(primary, "#ffffff", 0.55),
    ring: colors?.ring ?? mix(primary, "#ffffff", 0.28),
    badge: colors?.badge ?? mix(primary, "#ffffff", 0.85),
    badgeForeground: colors?.badgeForeground ?? mix(primary, "#000000", 0.2),
  };
}

function brandColorVars(colors: ResolvedBrandColors): CSSProperties {
  return {
    "--fs-primary": colors.primary,
    "--fs-primary-hover": colors.primaryHover,
    "--fs-primary-fg": colors.primaryForeground,
    "--fs-primary-soft": colors.primarySoft,
    "--fs-primary-muted": colors.primaryMuted,
    "--fs-ring": colors.ring,
    "--fs-badge": colors.badge,
    "--fs-badge-fg": colors.badgeForeground,
  } as CSSProperties;
}

const BrandContext = createContext<FileShareBrand>(defaultBrand);

export function FileShareBrandProvider({
  brand,
  children,
}: {
  brand: FileShareBrand;
  children: React.ReactNode;
}) {
  const merged: FileShareBrand = {
    ...defaultBrand,
    ...brand,
    colors: { ...defaultBrand.colors, ...brand.colors },
  };
  const resolved = resolveBrandColors(merged.colors);

  return (
    <BrandContext.Provider value={merged}>
      <div
        className="flex min-h-full flex-1 flex-col"
        style={brandColorVars(resolved)}
      >
        {children}
      </div>
    </BrandContext.Provider>
  );
}

export function useFileShareBrand() {
  return useContext(BrandContext);
}

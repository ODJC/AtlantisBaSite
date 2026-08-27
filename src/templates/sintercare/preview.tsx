'use client';

import { useMemo } from 'react';

/** Must match OG output scale in `generate.tsx` (shown at this size in the UI). */
const DISPLAY_W = 400;
const DISPLAY_H = 200;

export interface SintercarePreviewData {
  name: string;
  title: string;
  email: string;
}

function sintercareOgImageSrc(name: string, title: string, email: string) {
  const params = new URLSearchParams({
    company: 'Sintercare',
    name: name.trim() || 'Name Here',
    title: title.trim() || 'Title',
    email: email.trim() || 'email@example.com',
  });
  return `/api/generate?${params.toString()}`;
}

/**
 * Renders the same `/api/generate` PNG as OG so positions match `generate.tsx` exactly
 * (sharp raster of EDITABLE.svg + Satori text), not browser HTML over `design.svg`.
 */
export function SintercarePreview({ name, title, email }: SintercarePreviewData) {
  const src = useMemo(() => sintercareOgImageSrc(name, title, email), [name, title, email]);

  return (
    <img
      src={src}
      alt=""
      width={DISPLAY_W}
      height={DISPLAY_H}
      decoding="async"
      style={{
        display: 'block',
        width: `${DISPLAY_W}px`,
        height: `${DISPLAY_H}px`,
        objectFit: 'fill',
      }}
    />
  );
}

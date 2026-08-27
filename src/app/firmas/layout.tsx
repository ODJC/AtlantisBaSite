import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Firmas de correo | Atlantis BA",
  description:
    "Genera firmas de correo profesionales en PNG — individual o masivo desde Excel/CSV",
};

export default function FirmasLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
    >
      {children}
    </div>
  );
}

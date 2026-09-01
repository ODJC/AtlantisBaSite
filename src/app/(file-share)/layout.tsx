import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { FileShareProviders } from "@/components/file-share-providers";
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
  title: "Atlantis BA | Intercambio de archivos",
  description: "Portal seguro de archivos para clientes de Atlantis BA",
};

export default function FileShareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased min-h-screen`}
    >
      <FileShareProviders>{children}</FileShareProviders>
    </div>
  );
}

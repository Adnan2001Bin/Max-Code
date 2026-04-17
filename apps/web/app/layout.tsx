import type { Metadata } from "next";
import { Amiri, Geist, Geist_Mono, Noto_Naskh_Arabic } from "next/font/google";

import { AppShell } from "@/components/layout/app-shell";
import { SettingsProvider } from "@/components/settings/settings-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const arabicNaskh = Noto_Naskh_Arabic({
  variable: "--font-arabic-naskh",
  subsets: ["arabic"],
  weight: ["400", "500", "700"],
});

const arabicAmiri = Amiri({
  variable: "--font-arabic-amiri",
  subsets: ["arabic"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Quran Reader — Immersive Quran Experience",
  description:
    "A beautifully animated Quran reader with 3D book opening, smooth transitions, and per-ayah audio recitation with live highlighting.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${arabicNaskh.variable} ${arabicAmiri.variable} antialiased`}
      style={{ background: "#060a12" }}
    >
      <body
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          background: "#060a12",
        }}
      >
        <SettingsProvider>
          <AppShell>{children}</AppShell>
        </SettingsProvider>
      </body>
    </html>
  );
}

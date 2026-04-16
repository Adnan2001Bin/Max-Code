import type { Metadata } from "next";
import { Amiri, Geist, Geist_Mono, Noto_Naskh_Arabic } from "next/font/google";

import { AppShell } from "@/components/layout/app-shell";
import { SettingsProvider } from "@/components/settings/settings-provider";
import { SettingsSidebar } from "@/components/settings/settings-sidebar";
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
  title: "Quran Reader",
  description: "Responsive Quran reader with Surah list, ayahs, search, and reader settings.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${arabicNaskh.variable} ${arabicAmiri.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SettingsProvider>
          <AppShell>{children}</AppShell>
          <SettingsSidebar />
        </SettingsProvider>
      </body>
    </html>
  );
}

"use client";

import Link from "next/link";
import { useMemo } from "react";

import { useSettings } from "@/components/settings/settings-provider";
import type { Ayah, Surah } from "@/lib/types";

interface AyahReaderProps {
  surah: Surah;
  ayahs: Ayah[];
}

export function AyahReader({ surah, ayahs }: AyahReaderProps) {
  const { settings } = useSettings();

  const arabicStyle = useMemo(
    () => ({
      fontFamily:
        settings.arabicFont === "amiri" ? "var(--font-arabic-amiri)" : "var(--font-arabic-naskh)",
      fontSize: `${settings.arabicFontSize}px`,
      lineHeight: 1.9,
    }),
    [settings.arabicFont, settings.arabicFontSize],
  );

  const translationStyle = useMemo(
    () => ({
      fontSize: `${settings.translationFontSize}px`,
      lineHeight: 1.8,
    }),
    [settings.translationFontSize],
  );

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-emerald-700">Surah {surah.id}</p>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{surah.nameEnglish}</h1>
          <p dir="rtl" className="mt-1 text-3xl text-emerald-900" style={arabicStyle}>
            {surah.nameArabic}
          </p>
        </div>
        <Link
          href="/"
          className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Back to Surahs
        </Link>
      </div>

      <div className="space-y-4">
        {ayahs.map((ayah) => (
          <article key={`${ayah.surahId}-${ayah.ayahNumber}`} className="rounded-xl border border-emerald-100 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-2 text-sm font-medium text-emerald-700">Ayah {ayah.ayahNumber}</div>
            <p dir="rtl" className="text-right text-slate-900" style={arabicStyle}>
              {ayah.textArabic}
            </p>
            <p className="mt-4 text-slate-700" style={translationStyle}>
              {ayah.textTranslation}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

import Link from "next/link";

import { createSlug } from "@/lib/slug";
import type { Surah } from "@/lib/types";

export function SurahList({ surahs }: { surahs: Surah[] }) {
  return (
    <section className="mt-6">
      <div className="mb-4 flex items-end justify-between">
        <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">All 114 Surahs</h2>
        <span className="text-sm text-slate-600">{surahs.length} total</span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {surahs.map((surah) => (
          <Link
            key={surah.id}
            href={`/surah/${createSlug(surah.nameEnglish)}`}
            className="group rounded-xl border border-emerald-100 bg-white p-4 shadow-sm transition hover:border-emerald-300 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-emerald-700">Surah {surah.id}</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">{surah.nameEnglish}</p>
                <p className="mt-1 text-sm text-slate-600">
                  {surah.ayahCount} ayahs • {surah.revelationType}
                </p>
              </div>
              <p
                dir="rtl"
                className="text-right text-2xl leading-tight text-emerald-900 transition group-hover:scale-[1.02]"
                style={{ fontFamily: "var(--font-arabic-naskh)" }}
              >
                {surah.nameArabic}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

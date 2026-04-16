import Link from "next/link";

import { SurahList } from "@/components/surah/surah-list";
import { getSurahs } from "@/lib/quran-data";

export default async function HomePage() {
  const surahs = await getSurahs();

  return (
    <section>
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-emerald-100 sm:p-8">
        <p className="text-sm font-medium text-emerald-700">Saheeh International</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Browse the complete Quran
        </h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          A fast, responsive Quran experience with Surah listing, Ayah reading view, translation
          search, and persistent reading controls.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/search"
            className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600"
          >
            Search Ayahs
          </Link>
        </div>
      </div>

      <SurahList surahs={surahs} />
    </section>
  );
}

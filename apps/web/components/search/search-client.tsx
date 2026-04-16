"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";

import { useSettings } from "@/components/settings/settings-provider";

interface SearchResultItem {
  surahId: number;
  surahNameEnglish: string;
  surahNameArabic: string;
  ayahNumber: number;
  textArabic: string;
  textTranslation: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8787";

export function SearchClient() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { settings } = useSettings();

  const arabicStyle = useMemo(
    () => ({
      fontFamily:
        settings.arabicFont === "amiri" ? "var(--font-arabic-amiri)" : "var(--font-arabic-naskh)",
      fontSize: `${Math.max(settings.arabicFontSize - 8, 20)}px`,
      lineHeight: 1.8,
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();

    if (!trimmed) {
      setResults([]);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/search?q=${encodeURIComponent(trimmed)}&limit=100`,
      );
      if (!response.ok) {
        throw new Error(`Search request failed (${response.status})`);
      }

      const payload = (await response.json()) as { results?: SearchResultItem[] };
      setResults(Array.isArray(payload.results) ? payload.results : []);
    } catch (requestError) {
      console.error(requestError);
      setError("Unable to fetch search results. Please make sure the API is running.");
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Search Ayahs</h1>
        <p className="mt-2 text-slate-600">
          Search by translation text (Saheeh International).
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 rounded-xl border border-emerald-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center"
      >
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="e.g. mercy, patience, guidance"
          className="h-11 flex-1 rounded-md border border-slate-300 px-3 text-sm outline-none ring-emerald-500 transition focus:ring-2"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="h-11 rounded-md bg-emerald-700 px-5 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-emerald-400"
        >
          {isLoading ? "Searching..." : "Search"}
        </button>
      </form>

      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

      <div className="mt-6 space-y-4">
        {results.map((result) => (
          <article
            key={`${result.surahId}-${result.ayahNumber}`}
            className="rounded-xl border border-emerald-100 bg-white p-4 shadow-sm sm:p-5"
          >
            <div className="mb-2 flex flex-wrap items-center gap-2 text-sm text-emerald-700">
              <span className="font-medium">{result.surahNameEnglish}</span>
              <span>•</span>
              <span>Ayah {result.ayahNumber}</span>
              <span>•</span>
              <Link
                href={`/surah/${result.surahId}`}
                className="font-semibold underline decoration-emerald-400 underline-offset-2"
              >
                Open Surah
              </Link>
            </div>
            <p dir="rtl" className="text-right text-slate-900" style={arabicStyle}>
              {result.textArabic}
            </p>
            <p className="mt-3 text-slate-700" style={translationStyle}>
              {result.textTranslation}
            </p>
          </article>
        ))}
      </div>

      {!isLoading && query.trim() && !error && results.length === 0 ? (
        <p className="mt-6 text-sm text-slate-600">No ayahs found for this search.</p>
      ) : null}
    </section>
  );
}

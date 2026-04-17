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
        <h1
          style={{
            fontSize: "1.75rem",
            fontWeight: 700,
            color: "var(--text-primary)",
          }}
        >
          Search Ayahs
        </h1>
        <p
          style={{
            marginTop: "8px",
            fontSize: "0.9rem",
            color: "var(--text-secondary)",
          }}
        >
          Search by translation text (Saheeh International).
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="card-glass"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          padding: "16px",
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", width: "100%" }}>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="e.g. mercy, patience, guidance"
            style={{
              flex: 1,
              minWidth: "200px",
              height: "44px",
              borderRadius: "12px",
              border: "1px solid var(--border)",
              background: "rgba(0, 0, 0, 0.2)",
              color: "var(--text-primary)",
              padding: "0 16px",
              fontSize: "0.9rem",
              outline: "none",
            }}
            onFocus={(e) => (e.target.style.borderColor = "var(--border-active)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="btn-gold"
            style={{ height: "44px", opacity: isLoading ? 0.7 : 1, cursor: isLoading ? "not-allowed" : "pointer" }}
          >
            {isLoading ? "Searching..." : "Search"}
          </button>
        </div>
      </form>

      {error ? <p style={{ marginTop: "16px", fontSize: "0.875rem", color: "#ef4444" }}>{error}</p> : null}

      <div style={{ marginTop: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
        {results.map((result) => (
          <article
            key={`${result.surahId}-${result.ayahNumber}`}
            className="card-glass"
            style={{ padding: "20px 24px" }}
          >
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: "8px",
                marginBottom: "12px",
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "var(--gold-dim)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              <span style={{ color: "var(--gold)" }}>{result.surahNameEnglish}</span>
              <span>•</span>
              <span>Ayah {result.ayahNumber}</span>
              <span>•</span>
              <Link
                href={`/surah/${result.surahNameEnglish.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`}
                style={{
                  color: "var(--text-secondary)",
                  textDecoration: "underline",
                  textDecorationColor: "var(--gold-dim)",
                  textUnderlineOffset: "4px",
                }}
              >
                Open Surah
              </Link>
            </div>
            <p
              dir="rtl"
              style={{
                ...arabicStyle,
                textAlign: "right",
                color: "var(--text-arabic)",
              }}
            >
              {result.textArabic}
            </p>
            <p
              style={{
                ...translationStyle,
                marginTop: "16px",
                color: "var(--text-primary)",
              }}
            >
              {result.textTranslation}
            </p>
          </article>
        ))}
      </div>

      {!isLoading && query.trim() && !error && results.length === 0 ? (
        <p style={{ marginTop: "24px", fontSize: "0.9rem", color: "var(--text-secondary)" }}>
          No ayahs found for this search.
        </p>
      ) : null}
    </section>
  );
}

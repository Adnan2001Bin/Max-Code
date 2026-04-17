import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";
import { cache } from "react";

import { createSlug } from "./slug";
import type { Ayah, QuranDataset, SearchResult, Surah } from "./types";

const DATA_FILE = path.join(process.cwd(), "data", "quran.en-sahih.json");
const MAX_SEARCH_LIMIT = 200;
const DEFAULT_SEARCH_LIMIT = 50;
const SURAH_MATCH_PREVIEW_AYAHS = 5;

function isDataset(value: unknown): value is QuranDataset {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.source === "string" &&
    typeof candidate.translation === "string" &&
    typeof candidate.fetchedAt === "string" &&
    Array.isArray(candidate.surahs) &&
    typeof candidate.ayahsBySurah === "object" &&
    candidate.ayahsBySurah !== null
  );
}

const getDataset = cache(async (): Promise<QuranDataset> => {
  const raw = await readFile(DATA_FILE, "utf8");
  const parsed: unknown = JSON.parse(raw);

  if (!isDataset(parsed)) {
    throw new Error(`Invalid Quran dataset format in ${DATA_FILE}`);
  }

  return parsed;
});

export async function getSurahs(): Promise<Surah[]> {
  const dataset = await getDataset();
  return dataset.surahs;
}

export { createSlug };

export async function getSurahById(surahId: number): Promise<Surah | undefined> {
  const surahs = await getSurahs();
  return surahs.find((surah) => surah.id === surahId);
}

export async function getSurahBySlug(slug: string): Promise<Surah | undefined> {
  const surahs = await getSurahs();
  return surahs.find((surah) => createSlug(surah.nameEnglish) === slug);
}

export async function getSurahByRouteParam(routeParam: string): Promise<Surah | undefined> {
  const maybeId = Number.parseInt(routeParam, 10);
  if (!Number.isNaN(maybeId) && maybeId > 0) {
    const surahById = await getSurahById(maybeId);
    if (surahById) {
      return surahById;
    }
  }

  return getSurahBySlug(createSlug(routeParam));
}

export async function getAyahsBySurah(surahId: number): Promise<Ayah[]> {
  const dataset = await getDataset();
  return dataset.ayahsBySurah[String(surahId)] ?? [];
}

function normalizeSearchLimit(limitRaw: string | undefined): number {
  if (!limitRaw) {
    return DEFAULT_SEARCH_LIMIT;
  }

  const parsedLimit = Number.parseInt(limitRaw, 10);
  if (Number.isNaN(parsedLimit) || parsedLimit <= 0) {
    return DEFAULT_SEARCH_LIMIT;
  }

  return Math.min(parsedLimit, MAX_SEARCH_LIMIT);
}

function parseAyahReference(query: string): { surahId: number; ayahNumber: number } | null {
  const match = query.match(/^(\d{1,3})\s*[:.\- ]\s*(\d{1,3})$/);
  if (!match) {
    return null;
  }

  return {
    surahId: Number.parseInt(match[1], 10),
    ayahNumber: Number.parseInt(match[2], 10),
  };
}

export async function searchQuran(
  queryRaw: string,
  limitRaw: string | undefined,
): Promise<SearchResult[]> {
  const dataset = await getDataset();
  const query = queryRaw.trim();
  const normalizedQuery = query.toLowerCase();

  if (!normalizedQuery) {
    return [];
  }

  const querySlug = createSlug(query);
  const limit = normalizeSearchLimit(limitRaw);
  const numericQuery = /^\d+$/.test(normalizedQuery)
    ? Number.parseInt(normalizedQuery, 10)
    : null;
  const results: SearchResult[] = [];
  const seen = new Set<string>();
  const surahById = new Map(dataset.surahs.map((surah) => [surah.id, surah]));

  const pushResult = (surah: Surah, ayah: Ayah) => {
    const key = `${surah.id}:${ayah.ayahNumber}`;
    if (seen.has(key)) {
      return;
    }

    seen.add(key);
    results.push({
      surahId: surah.id,
      surahNameEnglish: surah.nameEnglish,
      surahNameArabic: surah.nameArabic,
      ayahNumber: ayah.ayahNumber,
      textArabic: ayah.textArabic,
      textTranslation: ayah.textTranslation,
    });
  };

  const ayahRef = parseAyahReference(normalizedQuery);
  if (ayahRef) {
    const surah = surahById.get(ayahRef.surahId);
    const ayah = dataset.ayahsBySurah[String(ayahRef.surahId)]?.find(
      (candidate) => candidate.ayahNumber === ayahRef.ayahNumber,
    );

    if (surah && ayah) {
      pushResult(surah, ayah);
    }

    return results;
  }

  const matchingSurahs = dataset.surahs.filter((surah) => {
    const english = surah.nameEnglish.toLowerCase();
    const englishSlug = createSlug(surah.nameEnglish);
    const arabic = surah.nameArabic;

    return (
      english.includes(normalizedQuery) ||
      (querySlug.length > 0 && englishSlug.includes(querySlug)) ||
      arabic.includes(query) ||
      (numericQuery !== null && surah.id === numericQuery)
    );
  });

  for (const surah of matchingSurahs) {
    const previewAyahs =
      dataset.ayahsBySurah[String(surah.id)]?.slice(0, SURAH_MATCH_PREVIEW_AYAHS) ?? [];
    for (const ayah of previewAyahs) {
      pushResult(surah, ayah);
      if (results.length >= limit) {
        return results;
      }
    }
  }

  for (const [surahIdRaw, ayahs] of Object.entries(dataset.ayahsBySurah)) {
    const surahId = Number.parseInt(surahIdRaw, 10);
    const surah = surahById.get(surahId);
    if (!surah) {
      continue;
    }

    for (const ayah of ayahs) {
      const matchesAyah =
        ayah.textTranslation.toLowerCase().includes(normalizedQuery) ||
        ayah.textArabic.includes(query) ||
        (numericQuery !== null && ayah.ayahNumber === numericQuery);

      if (!matchesAyah) {
        continue;
      }

      pushResult(surah, ayah);
      if (results.length >= limit) {
        return results;
      }
    }
  }

  return results;
}

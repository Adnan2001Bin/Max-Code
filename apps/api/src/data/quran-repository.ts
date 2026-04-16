import { access, readFile } from "node:fs/promises";
import path from "node:path";

import type { QuranDataset, SearchResult, Surah } from "../types/quran.js";

const DATA_FILENAME = "quran.en-sahih.json";
const DATA_FILE_PATH = path.join(process.cwd(), "data", DATA_FILENAME);
const MAX_SEARCH_LIMIT = 200;

let cachedData: QuranDataset | null = null;

function isSurah(value: unknown): value is Surah {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === "number" &&
    typeof candidate.nameArabic === "string" &&
    typeof candidate.nameEnglish === "string" &&
    typeof candidate.ayahCount === "number" &&
    typeof candidate.revelationType === "string"
  );
}

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
    candidate.surahs.every((surah) => isSurah(surah)) &&
    typeof candidate.ayahsBySurah === "object" &&
    candidate.ayahsBySurah !== null
  );
}

async function readDatasetFromDisk(): Promise<QuranDataset> {
  await access(DATA_FILE_PATH);
  const raw = await readFile(DATA_FILE_PATH, "utf8");
  const parsed: unknown = JSON.parse(raw);

  if (!isDataset(parsed)) {
    throw new Error(`Invalid dataset structure in "${DATA_FILE_PATH}"`);
  }

  return parsed;
}

export async function getDataset(): Promise<QuranDataset> {
  if (cachedData) {
    return cachedData;
  }

  try {
    cachedData = await readDatasetFromDisk();
    return cachedData;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      throw new Error(
        `Dataset not found at "${DATA_FILE_PATH}". Run "npm run seed --workspace api" first.`,
      );
    }

    throw error;
  }
}

export async function listSurahs(): Promise<Surah[]> {
  const dataset = await getDataset();
  return dataset.surahs;
}

export async function listAyahsBySurah(surahId: number) {
  const dataset = await getDataset();
  return dataset.ayahsBySurah[String(surahId)] ?? [];
}

export async function getSurahById(surahId: number) {
  const surahs = await listSurahs();
  return surahs.find((surah) => surah.id === surahId);
}

function normalizeLimit(limitRaw: string | undefined): number {
  if (!limitRaw) {
    return 50;
  }

  const parsedLimit = Number.parseInt(limitRaw, 10);
  if (Number.isNaN(parsedLimit) || parsedLimit <= 0) {
    return 50;
  }

  return Math.min(parsedLimit, MAX_SEARCH_LIMIT);
}

export async function searchByTranslation(
  queryRaw: string,
  limitRaw: string | undefined,
): Promise<SearchResult[]> {
  const dataset = await getDataset();
  const normalizedQuery = queryRaw.trim().toLowerCase();

  if (!normalizedQuery) {
    return [];
  }

  const limit = normalizeLimit(limitRaw);
  const surahById = new Map(dataset.surahs.map((surah) => [surah.id, surah]));
  const results: SearchResult[] = [];

  for (const [surahIdRaw, ayahs] of Object.entries(dataset.ayahsBySurah)) {
    for (const ayah of ayahs) {
      if (!ayah.textTranslation.toLowerCase().includes(normalizedQuery)) {
        continue;
      }

      const surahId = Number.parseInt(surahIdRaw, 10);
      const surah = surahById.get(surahId);
      if (!surah) {
        continue;
      }

      results.push({
        surahId: surah.id,
        surahNameEnglish: surah.nameEnglish,
        surahNameArabic: surah.nameArabic,
        ayahNumber: ayah.ayahNumber,
        textArabic: ayah.textArabic,
        textTranslation: ayah.textTranslation,
      });

      if (results.length >= limit) {
        return results;
      }
    }
  }

  return results;
}

import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";
import { cache } from "react";

import type { Ayah, QuranDataset, Surah } from "./types";

const DATA_FILE = path.join(process.cwd(), "data", "quran.en-sahih.json");

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

export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function getSurahById(surahId: number): Promise<Surah | undefined> {
  const surahs = await getSurahs();
  return surahs.find((surah) => surah.id === surahId);
}

export async function getSurahBySlug(slug: string): Promise<Surah | undefined> {
  const surahs = await getSurahs();
  return surahs.find((surah) => createSlug(surah.nameEnglish) === slug);
}

export async function getAyahsBySurah(surahId: number): Promise<Ayah[]> {
  const dataset = await getDataset();
  return dataset.ayahsBySurah[String(surahId)] ?? [];
}

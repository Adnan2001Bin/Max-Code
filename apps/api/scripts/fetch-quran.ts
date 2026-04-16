import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import type { Ayah, QuranDataset, Surah } from "../src/types/quran.js";

const API_BASE = "https://api.alquran.cloud/v1";
const OUTPUT_FILE = path.join(process.cwd(), "data", "quran.en-sahih.json");

interface MetaResponse {
  code: number;
  status: string;
  data: {
    surahs: {
      references: Array<{
        number: number;
        name: string;
        englishName: string;
        englishNameTranslation: string;
        numberOfAyahs: number;
        revelationType: string;
      }>;
    };
  };
}

interface QuranEditionResponse {
  code: number;
  status: string;
  data: {
    edition: {
      identifier: string;
      englishName: string;
    };
    surahs: Array<{
      number: number;
      name: string;
      englishName: string;
      ayahs: Array<{
        numberInSurah: number;
        text: string;
      }>;
    }>;
  };
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed (${response.status}): ${url}`);
  }

  return (await response.json()) as T;
}

function mapTranslationAyahs(translationSurahs: QuranEditionResponse["data"]["surahs"]) {
  const translationLookup = new Map<string, string>();

  for (const surah of translationSurahs) {
    for (const ayah of surah.ayahs) {
      translationLookup.set(`${surah.number}:${ayah.numberInSurah}`, ayah.text);
    }
  }

  return translationLookup;
}

async function main() {
  const [meta, arabic, translation] = await Promise.all([
    fetchJson<MetaResponse>(`${API_BASE}/meta`),
    fetchJson<QuranEditionResponse>(`${API_BASE}/quran/quran-uthmani`),
    fetchJson<QuranEditionResponse>(`${API_BASE}/quran/en.sahih`),
  ]);

  if (meta.status !== "OK" || arabic.status !== "OK" || translation.status !== "OK") {
    throw new Error("Unexpected response while fetching Quran data.");
  }

  const surahMetaByNumber = new Map(
    meta.data.surahs.references.map((surah) => [surah.number, surah]),
  );
  const translationLookup = mapTranslationAyahs(translation.data.surahs);

  const surahs: Surah[] = [];
  const ayahsBySurah: Record<string, Ayah[]> = {};

  for (const arabicSurah of arabic.data.surahs) {
    const surahMeta = surahMetaByNumber.get(arabicSurah.number);
    if (!surahMeta) {
      throw new Error(`Missing metadata for surah ${arabicSurah.number}`);
    }

    const surahId = arabicSurah.number;
    surahs.push({
      id: surahId,
      nameArabic: surahMeta.name,
      nameEnglish: surahMeta.englishName,
      ayahCount: surahMeta.numberOfAyahs,
      revelationType: surahMeta.revelationType,
    });

    ayahsBySurah[String(surahId)] = arabicSurah.ayahs.map((ayah) => {
      const lookupKey = `${surahId}:${ayah.numberInSurah}`;
      const translatedText = translationLookup.get(lookupKey);
      if (!translatedText) {
        throw new Error(`Missing translation for ayah ${lookupKey}`);
      }

      return {
        surahId,
        ayahNumber: ayah.numberInSurah,
        textArabic: ayah.text,
        textTranslation: translatedText,
      };
    });
  }

  const dataset: QuranDataset = {
    source: "https://api.alquran.cloud",
    translation: translation.data.edition.englishName,
    fetchedAt: new Date().toISOString(),
    surahs,
    ayahsBySurah,
  };

  await mkdir(path.dirname(OUTPUT_FILE), { recursive: true });
  await writeFile(OUTPUT_FILE, JSON.stringify(dataset, null, 2), "utf8");
  console.log(`Saved dataset to ${OUTPUT_FILE}`);
  console.log(`Surahs: ${surahs.length}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

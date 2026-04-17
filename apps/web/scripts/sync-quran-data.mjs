import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const API_BASE = "https://api.alquran.cloud/v1";
const OUTPUT_FILE = path.join(process.cwd(), "data", "quran.en-sahih.json");

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed request (${response.status}): ${url}`);
  }
  return response.json();
}

function buildTranslationLookup(translationSurahs) {
  const map = new Map();
  for (const surah of translationSurahs) {
    for (const ayah of surah.ayahs) {
      map.set(`${surah.number}:${ayah.numberInSurah}`, ayah.text);
    }
  }
  return map;
}

async function main() {
  const [meta, arabic, translation] = await Promise.all([
    fetchJson(`${API_BASE}/meta`),
    fetchJson(`${API_BASE}/quran/quran-uthmani`),
    fetchJson(`${API_BASE}/quran/en.sahih`),
  ]);

  if (meta.status !== "OK" || arabic.status !== "OK" || translation.status !== "OK") {
    throw new Error("Unexpected Quran API response");
  }

  const metaByNumber = new Map(meta.data.surahs.references.map((surah) => [surah.number, surah]));
  const translationLookup = buildTranslationLookup(translation.data.surahs);

  const surahs = [];
  const ayahsBySurah = {};

  for (const surah of arabic.data.surahs) {
    const metaSurah = metaByNumber.get(surah.number);
    if (!metaSurah) {
      throw new Error(`Missing metadata for surah ${surah.number}`);
    }

    surahs.push({
      id: surah.number,
      nameArabic: metaSurah.name,
      nameEnglish: metaSurah.englishName,
      ayahCount: metaSurah.numberOfAyahs,
      revelationType: metaSurah.revelationType,
    });

    ayahsBySurah[String(surah.number)] = surah.ayahs.map((ayah) => {
      const key = `${surah.number}:${ayah.numberInSurah}`;
      const translated = translationLookup.get(key);
      if (!translated) {
        throw new Error(`Missing translation for ayah ${key}`);
      }

      return {
        surahId: surah.number,
        ayahNumber: ayah.numberInSurah,
        textArabic: ayah.text,
        textTranslation: translated,
      };
    });
  }

  const dataset = {
    source: "https://api.alquran.cloud",
    translation: translation.data.edition.englishName,
    fetchedAt: new Date().toISOString(),
    surahs,
    ayahsBySurah,
  };

  await mkdir(path.dirname(OUTPUT_FILE), { recursive: true });
  await writeFile(OUTPUT_FILE, JSON.stringify(dataset, null, 2), "utf8");
  console.log(`Synced Quran dataset to ${OUTPUT_FILE}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

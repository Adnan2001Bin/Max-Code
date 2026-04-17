/**
 * Quran audio utilities.
 *
 * Uses the free al-quran.cloud CDN for per-ayah audio by Mishary Rashid al-Afasy.
 * Audio files are addressed by *global* ayah number (1-6236).
 */

/** Standard ayah count for each of the 114 surahs. */
const AYAH_COUNTS: readonly number[] = [
  7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99, 128,
  111, 110, 98, 135, 112, 78, 118, 64, 77, 227, 93, 88, 69, 60, 34, 30, 73,
  54, 45, 83, 182, 88, 75, 85, 54, 53, 89, 59, 37, 35, 38, 29, 18, 45, 60,
  49, 62, 55, 78, 96, 29, 22, 24, 13, 14, 11, 11, 18, 12, 12, 30, 52, 52, 44,
  28, 28, 20, 56, 40, 31, 50, 40, 46, 42, 29, 19, 36, 25, 22, 17, 19, 26, 30,
  20, 15, 21, 11, 8, 8, 19, 5, 8, 8, 11, 11, 8, 3, 9, 5, 4, 7, 3, 6, 3, 5,
  4, 5, 6,
];

/** Prefix sums so we can jump straight to the global offset for any surah. */
const PREFIX_SUMS: number[] = (() => {
  const sums: number[] = [0];
  for (let i = 0; i < AYAH_COUNTS.length; i++) {
    sums.push(sums[i] + AYAH_COUNTS[i]);
  }
  return sums;
})();

/**
 * Convert (surahId, ayahNumber) → global ayah number (1-based).
 *
 * Example: Surah 2, Ayah 1 → 8  (because Surah 1 has 7 ayahs)
 */
export function getGlobalAyahNumber(surahId: number, ayahNumber: number): number {
  return PREFIX_SUMS[surahId - 1] + ayahNumber;
}

/** CDN base for Mishary Rashid al-Afasy (128 kbps). */
const AUDIO_CDN = "https://cdn.islamic.network/quran/audio/128/ar.alafasy";

/**
 * Get the audio URL for a specific ayah.
 */
export function getAudioUrl(surahId: number, ayahNumber: number): string {
  const global = getGlobalAyahNumber(surahId, ayahNumber);
  return `${AUDIO_CDN}/${global}.mp3`;
}

/**
 * Get ayah count for a surah.
 */
export function getAyahCount(surahId: number): number {
  return AYAH_COUNTS[surahId - 1] ?? 0;
}

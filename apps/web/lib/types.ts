export interface Surah {
  id: number;
  nameArabic: string;
  nameEnglish: string;
  ayahCount: number;
  revelationType: string;
}

export interface Ayah {
  surahId: number;
  ayahNumber: number;
  textArabic: string;
  textTranslation: string;
}

export interface QuranDataset {
  source: string;
  translation: string;
  fetchedAt: string;
  surahs: Surah[];
  ayahsBySurah: Record<string, Ayah[]>;
}

export interface SearchResult {
  surahId: number;
  surahNameEnglish: string;
  surahNameArabic: string;
  ayahNumber: number;
  textArabic: string;
  textTranslation: string;
}

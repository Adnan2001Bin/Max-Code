export type ArabicFontOption = "naskh" | "amiri";

export interface ReaderSettings {
  arabicFont: ArabicFontOption;
  arabicFontSize: number;
  translationFontSize: number;
}

export const SETTINGS_STORAGE_KEY = "quran-reader-settings-v1";

export const DEFAULT_SETTINGS: ReaderSettings = {
  arabicFont: "naskh",
  arabicFontSize: 38,
  translationFontSize: 18,
};

export const FONT_LABELS: Record<ArabicFontOption, string> = {
  naskh: "Noto Naskh Arabic",
  amiri: "Amiri",
};

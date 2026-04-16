"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { DEFAULT_SETTINGS, type ReaderSettings, SETTINGS_STORAGE_KEY } from "@/lib/settings";

interface SettingsContextValue {
  settings: ReaderSettings;
  setSettings: (next: ReaderSettings) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(value, max));
}

function sanitizeSettings(candidate: unknown): ReaderSettings {
  if (!candidate || typeof candidate !== "object") {
    return DEFAULT_SETTINGS;
  }

  const raw = candidate as Partial<ReaderSettings>;
  const arabicFont = raw.arabicFont === "amiri" ? "amiri" : "naskh";
  const arabicFontSize = clamp(
    typeof raw.arabicFontSize === "number" ? raw.arabicFontSize : DEFAULT_SETTINGS.arabicFontSize,
    24,
    64,
  );
  const translationFontSize = clamp(
    typeof raw.translationFontSize === "number"
      ? raw.translationFontSize
      : DEFAULT_SETTINGS.translationFontSize,
    14,
    32,
  );

  return {
    arabicFont,
    arabicFontSize,
    translationFontSize,
  };
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<ReaderSettings>(() => {
    if (typeof window === "undefined") {
      return DEFAULT_SETTINGS;
    }

    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!stored) {
      return DEFAULT_SETTINGS;
    }

    try {
      const parsed: unknown = JSON.parse(stored);
      return sanitizeSettings(parsed);
    } catch (error) {
      console.error("Failed to parse reader settings from localStorage", error);
      return DEFAULT_SETTINGS;
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const value = useMemo<SettingsContextValue>(
    () => ({
      settings,
      setSettings: (next: ReaderSettings) => setSettings(sanitizeSettings(next)),
    }),
    [settings],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used inside SettingsProvider");
  }
  return context;
}

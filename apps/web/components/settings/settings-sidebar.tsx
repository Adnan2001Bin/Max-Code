"use client";

import { useMemo, useState } from "react";

import { FONT_LABELS } from "@/lib/settings";

import { useSettings } from "./settings-provider";

export function SettingsSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { settings, setSettings } = useSettings();

  const arabicStyle = useMemo(
    () => ({
      fontFamily:
        settings.arabicFont === "amiri" ? "var(--font-arabic-amiri)" : "var(--font-arabic-naskh)",
      fontSize: `${settings.arabicFontSize}px`,
    }),
    [settings.arabicFont, settings.arabicFontSize],
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed right-4 bottom-4 z-40 rounded-full bg-emerald-700 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-600"
      >
        Settings
      </button>

      {isOpen ? (
        <button
          aria-label="Close settings backdrop"
          className="fixed inset-0 z-40 bg-black/45"
          type="button"
          onClick={() => setIsOpen(false)}
        />
      ) : null}

      <aside
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-sm transform bg-white p-6 shadow-xl transition ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-label="Reader settings"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Reader Settings</h2>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="rounded-md border border-slate-300 px-3 py-1 text-sm text-slate-700 transition hover:bg-slate-100"
          >
            Close
          </button>
        </div>

        <div className="mt-6 space-y-6">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Arabic Font</span>
            <select
              value={settings.arabicFont}
              onChange={(event) =>
                setSettings({
                  ...settings,
                  arabicFont: event.target.value === "amiri" ? "amiri" : "naskh",
                })
              }
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              {Object.entries(FONT_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-2">
            <div className="flex items-center justify-between text-sm font-medium text-slate-700">
              <span>Arabic Font Size</span>
              <span>{settings.arabicFontSize}px</span>
            </div>
            <input
              type="range"
              min={24}
              max={64}
              value={settings.arabicFontSize}
              onChange={(event) =>
                setSettings({
                  ...settings,
                  arabicFontSize: Number.parseInt(event.target.value, 10),
                })
              }
              className="w-full accent-emerald-700"
            />
          </label>

          <label className="block space-y-2">
            <div className="flex items-center justify-between text-sm font-medium text-slate-700">
              <span>Translation Font Size</span>
              <span>{settings.translationFontSize}px</span>
            </div>
            <input
              type="range"
              min={14}
              max={32}
              value={settings.translationFontSize}
              onChange={(event) =>
                setSettings({
                  ...settings,
                  translationFontSize: Number.parseInt(event.target.value, 10),
                })
              }
              className="w-full accent-emerald-700"
            />
          </label>
        </div>

        <div className="mt-8 rounded-lg bg-emerald-50 p-4">
          <p className="text-sm font-medium text-slate-700">Preview</p>
          <p dir="rtl" className="mt-2 text-right text-slate-900" style={arabicStyle}>
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </p>
          <p className="mt-3 text-slate-700" style={{ fontSize: `${settings.translationFontSize}px` }}>
            In the name of Allah, the Entirely Merciful, the Especially Merciful.
          </p>
        </div>
      </aside>
    </>
  );
}

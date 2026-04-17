"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

import type { Surah } from "@/lib/types";
import { SurahListAnimated } from "@/components/surah/surah-list-animated";

// Dynamic import for Three.js (client-only, no SSR)
const QuranIntro = dynamic(
  () =>
    import("@/components/intro/quran-intro").then((mod) => ({
      default: mod.QuranIntro,
    })),
  { ssr: false }
);

interface Props {
  surahs: Surah[];
}

export function HomeClient({ surahs }: Props) {
  const [introComplete, setIntroComplete] = useState(false);

  return (
    <>
      {/* 3D Book Opening Intro */}
      {!introComplete && <QuranIntro onComplete={() => setIntroComplete(true)} />}

      {/* Hero section */}
      <section
        style={{
          padding: "16px 0",
        }}
      >
        <div
          className="card-glass"
          style={{
            padding: "32px",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Decorative top ornament */}
          <div className="ornament-divider" style={{ marginBottom: "20px" }}>
            <span style={{ color: "var(--gold)", fontSize: "0.9rem" }}>✦</span>
          </div>

          <p
            dir="rtl"
            style={{
              fontSize: "2.2rem",
              color: "var(--gold-light)",
              fontFamily: "var(--font-arabic-decorative)",
              lineHeight: 1.4,
              textShadow: "0 0 40px rgba(212,168,83,0.15)",
            }}
          >
            ٱلْقُرْآنُ ٱلْكَرِيمُ
          </p>

          <h1
            style={{
              marginTop: "12px",
              fontSize: "1.75rem",
              fontWeight: 700,
              color: "var(--text-primary)",
              letterSpacing: "-0.02em",
            }}
          >
            The Noble Quran
          </h1>

          <p
            style={{
              marginTop: "8px",
              fontSize: "0.9rem",
              color: "var(--text-secondary)",
              maxWidth: "500px",
              margin: "8px auto 0",
              lineHeight: 1.6,
            }}
          >
            Read, listen, and immerse yourself in the words of Allah.
            <br />
            Saheeh International translation with audio by Mishary al-Afasy.
          </p>

          {/* Decorative bottom ornament */}
          <div className="ornament-divider" style={{ marginTop: "20px" }}>
            <span style={{ color: "var(--gold)", fontSize: "0.9rem" }}>✦</span>
          </div>
        </div>
      </section>

      {/* Surah list */}
      <SurahListAnimated surahs={surahs} />
    </>
  );
}

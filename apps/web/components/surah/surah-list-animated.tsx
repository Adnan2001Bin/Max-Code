"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";

import type { Surah } from "@/lib/types";

interface Props {
  surahs: Surah[];
}

export function SurahListAnimated({ surahs }: Props) {
  const gridRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // ── Staggered entrance animation ────────────────────
  useEffect(() => {
    if (!gridRef.current) return;

    const cards = gridRef.current.querySelectorAll(".surah-card");

    gsap.fromTo(
      cards,
      { opacity: 0, y: 40, scale: 0.96 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        stagger: 0.03,
        ease: "power3.out",
        delay: 0.15,
      }
    );
  }, [surahs]);

  // ── Navigate with page transition ───────────────────
  function handleClick(surahNameEnglish: string) {
    const slug = surahNameEnglish.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    
    // Create a full-screen overlay for the transition
    const overlay = document.createElement("div");
    overlay.className = "page-transition-overlay";
    overlay.style.opacity = "0";
    document.body.appendChild(overlay);

    gsap.to(overlay, {
      opacity: 1,
      duration: 0.4,
      ease: "power2.inOut",
      onComplete: () => {
        router.push(`/surah/${slug}`);
        // Overlay cleaned up by the target page
        setTimeout(() => {
          if (document.body.contains(overlay)) {
            gsap.to(overlay, {
              opacity: 0,
              duration: 0.4,
              ease: "power2.inOut",
              onComplete: () => overlay.remove(),
            });
          }
        }, 300);
      },
    });
  }

  return (
    <section className="mt-8">
      {/* Section header */}
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              color: "var(--gold)",
              letterSpacing: "-0.01em",
            }}
          >
            All 114 Surahs
          </h2>
          <p
            style={{
              marginTop: "4px",
              fontSize: "0.875rem",
              color: "var(--text-muted)",
            }}
          >
            Select a Surah to begin reading & listening
          </p>
        </div>
        <span
          style={{
            fontSize: "0.8rem",
            color: "var(--text-muted)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {surahs.length} total
        </span>
      </div>

      {/* Surah grid */}
      <div
        ref={gridRef}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "12px",
        }}
      >
        {surahs.map((surah) => (
          <button
            key={surah.id}
            type="button"
            onClick={() => handleClick(surah.nameEnglish)}
            className="surah-card card-glass"
            style={{
              padding: "16px 18px",
              textAlign: "left",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "14px",
              width: "100%",
            }}
          >
            {/* Number badge */}
            <div className="surah-badge">
              <span>{surah.id}</span>
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                }}
              >
                {surah.nameEnglish}
              </p>
              <p
                style={{
                  marginTop: "2px",
                  fontSize: "0.75rem",
                  color: "var(--text-muted)",
                }}
              >
                {surah.ayahCount} ayahs • {surah.revelationType}
              </p>
            </div>

            {/* Arabic name */}
            <p
              dir="rtl"
              style={{
                fontSize: "1.5rem",
                color: "var(--gold)",
                fontFamily: "var(--font-arabic-primary)",
                lineHeight: 1.3,
                flexShrink: 0,
                transition: "transform 0.3s ease",
              }}
            >
              {surah.nameArabic}
            </p>
          </button>
        ))}
      </div>
    </section>
  );
}

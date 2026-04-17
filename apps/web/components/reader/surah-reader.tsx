"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";

import { useSettings } from "@/components/settings/settings-provider";
import { getAudioUrl } from "@/lib/audio-utils";
import type { Ayah, Surah } from "@/lib/types";

/* ──────────────────────────────────────────────────────────
   Surah Reader — Animated reader with audio + highlighting
   ────────────────────────────────────────────────────────── */

interface Props {
  surah: Surah;
  ayahs: Ayah[];
}

export function SurahReader({ surah, ayahs }: Props) {
  const { settings } = useSettings();
  const router = useRouter();

  // ── Audio state ───────────────────────────────────────
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAyahIndex, setCurrentAyahIndex] = useState(-1);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ayahRefs = useRef<Map<number, HTMLElement>>(new Map());
  const sectionRef = useRef<HTMLElement>(null);

  // ── Font styles ─────────────────────────────────────
  const arabicStyle = useMemo(
    () => ({
      fontFamily:
        settings.arabicFont === "amiri"
          ? "var(--font-arabic-amiri)"
          : "var(--font-arabic-naskh)",
      fontSize: `${settings.arabicFontSize}px`,
      lineHeight: 1.9,
    }),
    [settings.arabicFont, settings.arabicFontSize]
  );

  const translationStyle = useMemo(
    () => ({
      fontSize: `${settings.translationFontSize}px`,
      lineHeight: 1.8,
    }),
    [settings.translationFontSize]
  );

  // ── Entrance animation ──────────────────────────────
  useEffect(() => {
    if (!sectionRef.current) return;

    // Fade in the page-transition overlay out
    const overlays = document.querySelectorAll(".page-transition-overlay");
    overlays.forEach((o) => {
      gsap.to(o, {
        opacity: 0,
        duration: 0.5,
        ease: "power2.inOut",
        onComplete: () => o.remove(),
      });
    });

    // Header entrance
    const header = sectionRef.current.querySelector(".reader-header");
    if (header) {
      gsap.fromTo(
        header,
        { opacity: 0, y: -30 },
        { opacity: 1, y: 0, duration: 0.7, ease: "power3.out", delay: 0.1 }
      );
    }

    // Bismillah
    const bism = sectionRef.current.querySelector(".bismillah");
    if (bism) {
      gsap.fromTo(
        bism,
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 0.8, ease: "power3.out", delay: 0.3 }
      );
    }

    // Ayah cards stagger
    const cards = sectionRef.current.querySelectorAll(".ayah-card");
    gsap.fromTo(
      cards,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.04, ease: "power3.out", delay: 0.4 }
    );
  }, [surah.id]);

  // ── Audio playback logic ────────────────────────────
  const playAyah = useCallback(
    (index: number) => {
      if (index < 0 || index >= ayahs.length) {
        setIsPlaying(false);
        setCurrentAyahIndex(-1);
        return;
      }

      const ayah = ayahs[index];
      const url = getAudioUrl(surah.id, ayah.ayahNumber);

      setCurrentAyahIndex(index);
      setIsLoadingAudio(true);

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeAttribute("src");
      }

      const audio = new Audio(url);
      audioRef.current = audio;

      audio.addEventListener("canplaythrough", () => {
        setIsLoadingAudio(false);
        audio.play().catch(() => {
          setIsPlaying(false);
          setIsLoadingAudio(false);
        });
      }, { once: true });

      audio.addEventListener("ended", () => {
        // Auto-advance to next ayah
        const nextIndex = index + 1;
        if (nextIndex < ayahs.length) {
          playAyah(nextIndex);
        } else {
          setIsPlaying(false);
          setCurrentAyahIndex(-1);
        }
      }, { once: true });

      audio.addEventListener("error", () => {
        setIsLoadingAudio(false);
        // Try next ayah on error
        const nextIndex = index + 1;
        if (nextIndex < ayahs.length) {
          setTimeout(() => playAyah(nextIndex), 500);
        } else {
          setIsPlaying(false);
          setCurrentAyahIndex(-1);
        }
      }, { once: true });

      audio.load();
    },
    [ayahs, surah.id]
  );

  const handlePlayPause = useCallback(() => {
    if (isPlaying) {
      // Pause
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      // Play from current or start
      setIsPlaying(true);
      const startIndex = currentAyahIndex >= 0 ? currentAyahIndex : 0;
      playAyah(startIndex);
    }
  }, [isPlaying, currentAyahIndex, playAyah]);

  const handlePrev = useCallback(() => {
    if (currentAyahIndex > 0) {
      playAyah(currentAyahIndex - 1);
    }
  }, [currentAyahIndex, playAyah]);

  const handleNext = useCallback(() => {
    if (currentAyahIndex < ayahs.length - 1) {
      playAyah(currentAyahIndex + 1);
    }
  }, [currentAyahIndex, ayahs.length, playAyah]);

  const handleStop = useCallback(() => {
    audioRef.current?.pause();
    audioRef.current = null;
    setIsPlaying(false);
    setCurrentAyahIndex(-1);
  }, []);

  // ── Scroll to active ayah ──────────────────────────
  useEffect(() => {
    if (currentAyahIndex < 0) return;

    const el = ayahRefs.current.get(currentAyahIndex);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [currentAyahIndex]);

  // ── Cleanup on unmount ─────────────────────────────
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // ── Back navigation ────────────────────────────────
  function handleBack() {
    handleStop();
    const overlay = document.createElement("div");
    overlay.className = "page-transition-overlay";
    overlay.style.opacity = "0";
    document.body.appendChild(overlay);

    gsap.to(overlay, {
      opacity: 1,
      duration: 0.35,
      ease: "power2.inOut",
      onComplete: () => {
        router.push("/");
        setTimeout(() => {
          gsap.to(overlay, {
            opacity: 0,
            duration: 0.35,
            onComplete: () => overlay.remove(),
          });
        }, 200);
      },
    });
  }

  // ── Click on ayah to play from there ───────────────
  function handleAyahClick(index: number) {
    setIsPlaying(true);
    playAyah(index);
  }

  const showBismillah = surah.id !== 1 && surah.id !== 9;

  return (
    <section ref={sectionRef} style={{ paddingBottom: isPlaying || currentAyahIndex >= 0 ? "100px" : "0" }}>
      {/* ── Header ──────────────────────────────────── */}
      <div
        className="reader-header card-glass"
        style={{
          padding: "24px 28px",
          marginBottom: "24px",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
        }}
      >
        <div>
          <p
            style={{
              fontSize: "0.8rem",
              color: "var(--gold-dim)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              fontWeight: 600,
            }}
          >
            Surah {surah.id} • {surah.revelationType}
          </p>
          <h1
            style={{
              marginTop: "4px",
              fontSize: "1.75rem",
              fontWeight: 700,
              color: "var(--text-primary)",
            }}
          >
            {surah.nameEnglish}
          </h1>
          <p
            dir="rtl"
            style={{
              marginTop: "6px",
              fontSize: "2rem",
              color: "var(--gold)",
              fontFamily: "var(--font-arabic-decorative)",
              lineHeight: 1.4,
            }}
          >
            {surah.nameArabic}
          </p>
          <p
            style={{
              marginTop: "6px",
              fontSize: "0.8rem",
              color: "var(--text-muted)",
            }}
          >
            {surah.ayahCount} Ayahs
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {/* Play button */}
          <button
            type="button"
            onClick={handlePlayPause}
            className="btn-gold"
          >
            {isLoadingAudio ? (
              <span className="loading-spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
            ) : isPlaying ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
            {isPlaying ? "Pause" : "Play Recitation"}
          </button>

          {/* Back button */}
          <button type="button" onClick={handleBack} className="btn-ghost">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        </div>
      </div>

      {/* ── Bismillah ───────────────────────────────── */}
      {showBismillah && (
        <div className="bismillah" style={{ marginBottom: "20px" }}>
          <div className="ornament-divider" style={{ marginBottom: "12px" }}>
            <span style={{ color: "var(--gold)", fontSize: "0.7rem" }}>✦</span>
          </div>
          بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
          <div className="ornament-divider" style={{ marginTop: "12px" }}>
            <span style={{ color: "var(--gold)", fontSize: "0.7rem" }}>✦</span>
          </div>
        </div>
      )}

      {/* ── Ayah list ───────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {ayahs.map((ayah, index) => (
          <article
            key={`${ayah.surahId}-${ayah.ayahNumber}`}
            ref={(el) => {
              if (el) ayahRefs.current.set(index, el);
            }}
            className={`ayah-card card-glass ${
              currentAyahIndex === index ? "ayah-active" : ""
            }`}
            style={{
              padding: "20px 24px",
              cursor: "pointer",
              transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
            onClick={() => handleAyahClick(index)}
          >
            {/* Ayah number */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "10px",
              }}
            >
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color:
                    currentAyahIndex === index
                      ? "var(--gold)"
                      : "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  transition: "color 0.3s",
                }}
              >
                Ayah {ayah.ayahNumber}
              </span>

              {currentAyahIndex === index && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    color: "var(--gold)",
                    fontSize: "0.7rem",
                    fontWeight: 600,
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: "var(--gold)",
                      animation: "pulse-gold 1.5s ease infinite",
                    }}
                  />
                  NOW PLAYING
                </div>
              )}
            </div>

            {/* Arabic text */}
            <p
              dir="rtl"
              className="ayah-arabic"
              style={{
                ...arabicStyle,
                textAlign: "right",
                color: currentAyahIndex === index ? "var(--gold-light)" : "var(--text-arabic)",
                transition: "color 0.4s, text-shadow 0.4s",
                textShadow: currentAyahIndex === index ? "0 0 20px rgba(212,168,83,0.3)" : "none",
              }}
            >
              {ayah.textArabic}
            </p>

            {/* Translation */}
            <p
              style={{
                ...translationStyle,
                marginTop: "14px",
                color:
                  currentAyahIndex === index
                    ? "var(--text-primary)"
                    : "var(--text-secondary)",
                transition: "color 0.4s",
              }}
            >
              {ayah.textTranslation}
            </p>
          </article>
        ))}
      </div>

      {/* ── Floating Audio Bar ──────────────────────── */}
      {(isPlaying || currentAyahIndex >= 0) && (
        <div className="audio-bar">
          <div
            style={{
              maxWidth: "1152px",
              margin: "0 auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
            }}
          >
            {/* Left: now playing info */}
            <div style={{ minWidth: 0, flex: 1 }}>
              <p
                style={{
                  fontSize: "0.8rem",
                  color: "var(--gold)",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {surah.nameEnglish}{" "}
                {currentAyahIndex >= 0
                  ? `— Ayah ${ayahs[currentAyahIndex]?.ayahNumber ?? ""}`
                  : ""}
              </p>
              <p
                style={{
                  fontSize: "0.7rem",
                  color: "var(--text-muted)",
                  marginTop: "2px",
                }}
              >
                {currentAyahIndex >= 0 ? currentAyahIndex + 1 : 0} /{" "}
                {ayahs.length} ayahs
              </p>
            </div>

            {/* Center: controls */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentAyahIndex <= 0}
                style={{
                  background: "none",
                  border: "none",
                  color:
                    currentAyahIndex <= 0
                      ? "var(--text-muted)"
                      : "var(--text-secondary)",
                  cursor: currentAyahIndex <= 0 ? "not-allowed" : "pointer",
                  padding: "6px",
                  transition: "color 0.2s",
                }}
                aria-label="Previous ayah"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                </svg>
              </button>

              <button
                type="button"
                onClick={handlePlayPause}
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, var(--gold), var(--gold-light))",
                  border: "none",
                  color: "var(--bg-deepest)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  boxShadow: "0 4px 15px rgba(212,168,83,0.3)",
                }}
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isLoadingAudio ? (
                  <span className="loading-spinner" style={{ width: 18, height: 18, borderWidth: 2, borderTopColor: "var(--bg-deepest)" }} />
                ) : isPlaying ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="4" width="4" height="16" rx="1" />
                    <rect x="14" y="4" width="4" height="16" rx="1" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              <button
                type="button"
                onClick={handleNext}
                disabled={currentAyahIndex >= ayahs.length - 1}
                style={{
                  background: "none",
                  border: "none",
                  color:
                    currentAyahIndex >= ayahs.length - 1
                      ? "var(--text-muted)"
                      : "var(--text-secondary)",
                  cursor:
                    currentAyahIndex >= ayahs.length - 1
                      ? "not-allowed"
                      : "pointer",
                  padding: "6px",
                  transition: "color 0.2s",
                }}
                aria-label="Next ayah"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                </svg>
              </button>

              <button
                type="button"
                onClick={handleStop}
                style={{
                  background: "none",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                  padding: "6px 12px",
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                  transition: "all 0.2s",
                }}
                aria-label="Stop"
              >
                STOP
              </button>
            </div>

            {/* Right: progress bar visual */}
            <div
              style={{
                flex: 1,
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <div
                style={{
                  width: "100%",
                  maxWidth: "200px",
                  height: "4px",
                  borderRadius: "2px",
                  background: "var(--bg-card)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${
                      ayahs.length > 0 && currentAyahIndex >= 0
                        ? ((currentAyahIndex + 1) / ayahs.length) * 100
                        : 0
                    }%`,
                    height: "100%",
                    background: "linear-gradient(90deg, var(--gold-dim), var(--gold))",
                    borderRadius: "2px",
                    transition: "width 0.5s ease",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

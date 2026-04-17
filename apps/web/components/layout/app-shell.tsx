"use client";

import Link from "next/link";
import type { ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        position: "relative",
        zIndex: 1,
      }}
    >
      {/* ── Header ──────────────────────────────────── */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 30,
          borderBottom: "1px solid var(--border)",
          background: "rgba(6, 10, 18, 0.85)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
        }}
      >
        <div
          style={{
            maxWidth: "1152px",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 24px",
          }}
        >
          {/* Logo */}
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              textDecoration: "none",
            }}
          >
            {/* Decorative Islamic star */}
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background:
                  "linear-gradient(135deg, rgba(212,168,83,0.2), rgba(212,168,83,0.05))",
                border: "1px solid rgba(212,168,83,0.3)",
                color: "var(--gold)",
                fontSize: "1rem",
              }}
            >
              ✦
            </span>
            <span
              style={{
                fontSize: "1.1rem",
                fontWeight: 700,
                color: "var(--gold)",
                letterSpacing: "-0.01em",
              }}
            >
              Quran Reader
            </span>
          </Link>

          {/* Nav */}
          <nav style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <Link
              href="/"
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                fontSize: "0.85rem",
                fontWeight: 500,
                color: "var(--text-secondary)",
                textDecoration: "none",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--gold)";
                e.currentTarget.style.background = "var(--bg-card)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--text-secondary)";
                e.currentTarget.style.background = "transparent";
              }}
            >
              Surahs
            </Link>
            <Link
              href="/search"
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                fontSize: "0.85rem",
                fontWeight: 500,
                color: "var(--text-secondary)",
                textDecoration: "none",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--gold)";
                e.currentTarget.style.background = "var(--bg-card)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--text-secondary)";
                e.currentTarget.style.background = "transparent";
              }}
            >
              Search
            </Link>
          </nav>
        </div>
      </header>

      {/* ── Main content ────────────────────────────── */}
      <main
        style={{
          maxWidth: "1152px",
          margin: "0 auto",
          padding: "24px 24px 48px",
        }}
      >
        {children}
      </main>
    </div>
  );
}

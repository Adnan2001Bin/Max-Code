import Link from "next/link";
import type { ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-white text-slate-900">
      <header className="sticky top-0 z-30 border-b border-emerald-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="text-lg font-semibold tracking-tight text-emerald-800">
            Quran Reader
          </Link>
          <nav className="flex items-center gap-2 text-sm sm:gap-3">
            <Link
              href="/"
              className="rounded-md px-3 py-2 text-slate-700 transition hover:bg-emerald-100 hover:text-emerald-900"
            >
              Surahs
            </Link>
            <Link
              href="/search"
              className="rounded-md px-3 py-2 text-slate-700 transition hover:bg-emerald-100 hover:text-emerald-900"
            >
              Search
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
    </div>
  );
}

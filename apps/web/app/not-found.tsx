import Link from "next/link";

export default function NotFoundPage() {
  return (
    <section className="rounded-xl border border-emerald-100 bg-white p-8 text-center shadow-sm">
      <h1 className="text-2xl font-bold text-slate-900">Surah not found</h1>
      <p className="mt-2 text-slate-600">
        The requested page is unavailable. Please choose a Surah from the list.
      </p>
      <Link
        href="/"
        className="mt-5 inline-block rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600"
      >
        Back to Surah list
      </Link>
    </section>
  );
}

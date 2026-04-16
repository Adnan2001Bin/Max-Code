import { notFound } from "next/navigation";

import { AyahReader } from "@/components/reader/ayah-reader";
import { getAyahsBySurah, getSurahById, getSurahs } from "@/lib/quran-data";

export const dynamicParams = false;

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateStaticParams() {
  const surahs = await getSurahs();
  return surahs.map((surah) => ({
    id: String(surah.id),
  }));
}

export default async function SurahPage({ params }: PageProps) {
  const routeParams = await params;
  const surahId = Number.parseInt(routeParams.id, 10);

  if (Number.isNaN(surahId) || surahId <= 0) {
    notFound();
  }

  const [surah, ayahs] = await Promise.all([getSurahById(surahId), getAyahsBySurah(surahId)]);

  if (!surah || ayahs.length === 0) {
    notFound();
  }

  return <AyahReader surah={surah} ayahs={ayahs} />;
}

import { notFound } from "next/navigation";

import { SurahReader } from "@/components/reader/surah-reader";
import { getAyahsBySurah, getSurahBySlug, getSurahs, createSlug } from "@/lib/quran-data";

export const dynamicParams = true;

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const surahs = await getSurahs();
  return surahs.map((surah) => ({
    slug: createSlug(surah.nameEnglish),
  }));
}

export default async function SurahPage({ params }: PageProps) {
  const routeParams = await params;
  const decodedSlug = decodeURIComponent(routeParams.slug);
  const normalizedSlug = createSlug(decodedSlug);

  const surah = await getSurahBySlug(normalizedSlug);

  if (!surah) {
    notFound();
  }

  const ayahs = await getAyahsBySurah(surah.id);

  if (ayahs.length === 0) {
    notFound();
  }

  return <SurahReader surah={surah} ayahs={ayahs} />;
}

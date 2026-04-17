import { notFound, redirect } from "next/navigation";

import { SurahReader } from "@/components/reader/surah-reader";
import { getAyahsBySurah, getSurahByRouteParam, getSurahs, createSlug } from "@/lib/quran-data";

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
  const surah = await getSurahByRouteParam(decodedSlug);

  if (!surah) {
    notFound();
  }

  const canonicalSlug = createSlug(surah.nameEnglish);
  if (decodedSlug !== canonicalSlug) {
    redirect(`/surah/${canonicalSlug}`);
  }

  const ayahs = await getAyahsBySurah(surah.id);

  if (ayahs.length === 0) {
    notFound();
  }

  return <SurahReader surah={surah} ayahs={ayahs} />;
}

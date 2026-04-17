import { HomeClient } from "@/components/home-client";
import { getSurahs } from "@/lib/quran-data";

export default async function HomePage() {
  const surahs = await getSurahs();

  return <HomeClient surahs={surahs} />;
}

import { Hono } from "hono";

import {
  getSurahById,
  listAyahsBySurah,
  listSurahs,
} from "../data/quran-repository.js";

export const surahRoutes = new Hono();

surahRoutes.get("/", async (context) => {
  const surahs = await listSurahs();
  return context.json({
    total: surahs.length,
    surahs,
  });
});

surahRoutes.get("/:id/ayahs", async (context) => {
  const surahId = Number.parseInt(context.req.param("id"), 10);
  if (Number.isNaN(surahId) || surahId <= 0) {
    return context.json(
      {
        error: "Invalid surah id",
      },
      400,
    );
  }

  const surah = await getSurahById(surahId);
  if (!surah) {
    return context.json(
      {
        error: "Surah not found",
      },
      404,
    );
  }

  const ayahs = await listAyahsBySurah(surahId);
  return context.json({
    surah,
    ayahs,
  });
});

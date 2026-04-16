import { Hono } from "hono";

import { searchByTranslation } from "../data/quran-repository.js";

export const searchRoutes = new Hono();

searchRoutes.get("/", async (context) => {
  const query = context.req.query("q") ?? "";
  const limit = context.req.query("limit");
  const results = await searchByTranslation(query, limit);

  return context.json({
    query,
    total: results.length,
    results,
  });
});

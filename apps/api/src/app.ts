import { Hono } from "hono";
import { cors } from "hono/cors";

import { healthRoutes } from "./routes/health.js";
import { searchRoutes } from "./routes/search.js";
import { surahRoutes } from "./routes/surah.js";

export function createApp() {
  const app = new Hono();

  app.use(
    "*",
    cors({
      origin: "*",
      allowMethods: ["GET"],
      allowHeaders: ["Content-Type"],
    }),
  );

  app.route("/health", healthRoutes);
  app.route("/surahs", surahRoutes);
  app.route("/search", searchRoutes);

  app.get("/", (context) =>
    context.json({
      message: "Quran API is running",
      endpoints: ["/health", "/surahs", "/surahs/:id/ayahs", "/search?q=..."],
    }),
  );

  return app;
}

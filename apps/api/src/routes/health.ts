import { Hono } from "hono";

export const healthRoutes = new Hono();

healthRoutes.get("/", (context) =>
  context.json({
    status: "ok",
    service: "quran-api",
  }),
);

import { serve } from "@hono/node-server";

import { createApp } from "./app.js";
import { getPort } from "./config/env.js";

const app = createApp();
const port = getPort();

serve(
  {
    fetch: app.fetch,
    port,
  },
  (info) => {
    console.log(`Quran API listening on http://localhost:${info.port}`);
  },
);

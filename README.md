# Quran Reader Monorepo

Professional monorepo structure for a Quran app with:

- **Backend**: Node.js + Hono (`apps/api`)
- **Frontend**: Next.js + SSG + Tailwind (`apps/web`)
- **Data ingestion**: Online Quran source (api.alquran.cloud) seeded into local dataset

## Project Structure

```text
apps/
  api/
    data/                 # Generated Quran dataset JSON
    scripts/              # Data ingestion scripts
    src/
      config/             # Environment and runtime config
      data/               # Data access/repository layer
      routes/             # HTTP route modules
      types/              # Shared API-side types
      app.ts              # Hono app composition
      index.ts            # Server entrypoint
  web/
    app/                  # Next.js app router pages
    components/           # UI components split by domain
      layout/
      reader/
      search/
      settings/
      surah/
    lib/                  # Server-side data and shared web types
```

## Commands

```bash
npm install
npm run seed
npm run dev:api
npm run dev:web
```

# API (Hono on Node.js)

Backend service for Quran data access and search.

## Endpoints

- `GET /health`
- `GET /surahs`
- `GET /surahs/:id/ayahs`
- `GET /search?q=<text>&limit=<number>`

## Data ingestion

```bash
npm run seed --workspace api
```

This fetches Quran data online from `api.alquran.cloud` and saves it to:

- `apps/api/data/quran.en-sahih.json`

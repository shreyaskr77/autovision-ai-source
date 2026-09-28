# AutoVision AI

AutoVision AI is a mobile vehicle-recognition app with a routed API preview and a documented FastAPI inference backend.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm --filter @workspace/autovision-mobile run dev` — run the Expo mobile client
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/autovision-mobile/` — Expo Router mobile client, local scan history, and AutoVision theme
- `artifacts/api-server/` — preview API adapter with upload validation and image preprocessing
- `backend/` — canonical FastAPI/PyTorch pipeline, model status, and classifier training script
- `lib/api-spec/openapi.yaml` — source-of-truth API contract

## Architecture decisions

- The mobile client uses local AsyncStorage for saved scans; no authentication or cloud database is required for the first version.
- The preview API and canonical FastAPI service both return explicit unavailable states when detector or classifier weights are missing.
- A generic object detector is never presented as a make/model classifier.
- Image uploads are capped at 10 MB and accepted only as JPEG, PNG, or WebP.

## Product

The first vertical slice supports gallery selection, camera capture, upload validation, analysis progress/error states, honest result rendering, local scan history, deletion, clearing history, and an about/limitations screen.

## User preferences

No additional user preferences recorded.

## Gotchas

- Model weights are intentionally not downloaded during startup; configure them before expecting recognition results.
- Expo Go can show a local React Native DevTools shared-library warning while Metro still starts normally.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details

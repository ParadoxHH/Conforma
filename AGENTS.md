# Repository Guidelines

## Project Structure & Module Organization
- `src/` holds the Express/Prisma API—controllers, services, routes, jobs, guards, and Swagger docs (`src/docs/swagger.yml`); shared helpers live in `src/utils` and `src/lib`.
- `frontend/` contains the Next.js client. Components sit in `frontend/src/components`, app routes in `frontend/src/app`, and Tailwind tweaks in `frontend/tailwind.config.js`.
- `tests/` mirrors backend services with Vitest specs (`*.service.test.ts`) and shared bootstrap logic in `tests/setup.ts`.
- Docker, devcontainer, and environment templates (`.env.example`) support local parity; adjust them whenever runtime assumptions change.

## Build, Test, and Development Commands
- Run `npm install` then `npm run dev` to start the API with nodemon on `src/index.ts`.
- Create production bundles via `npm run build`; serve them with `npm start` (reads from `dist/index.js`).
- Execute backend tests with `npm test`; coverage artifacts land in `coverage/`.
- After editing `src/prisma/schema.prisma`, refresh the client with `npx prisma generate`.
- For the Next.js app: `cd frontend && npm install`, then use `npm run dev`, `npm run build`, and `npm run lint` as needed.

## Coding Style & Naming Conventions
- Match the prevailing TypeScript style: 2-space indentation, single quotes, semicolons, and domain-driven filenames (`job.service.ts`, `admin.controller.ts`).
- Use `camelCase` for functions and variables, `PascalCase` for classes and React exports, and hyphenated file names that mirror those symbols.
- Let ESLint and Tailwind guide the frontend; build composable pieces in `frontend/src/components` and park shared helpers in `frontend/src/lib`.
- Keep configuration reads in `src/config`; clone `.env` from `.env.example` and never commit secrets.

## Testing Guidelines
- Add or update Vitest specs under `tests/`, keeping the `<feature>.service.test.ts` pattern, and reuse `tests/setup.ts` for shared mocks.
- Favor deterministic fixtures over live network calls, especially with SendGrid or Twilio adapters.
- Confirm `npm test` passes and coverage does not regress; check `coverage/index.html` when diagnosing gaps.

## Commit & Pull Request Guidelines
- Follow the repository’s Conventional Commit history (`fix(deploy): …`, `feat(auth): …`) with imperative, concise subjects.
- For each PR, summarize the change, link any issue, and list verification commands (`npm test`, `npm run lint`, `npm run build`). Attach screenshots or clips for UI updates.
- Keep PRs focused and coordinate Prisma schema updates with matching migrations, seeds, and docs.

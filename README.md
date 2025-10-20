# Conforma - Escrow for Texas Home Services

Conforma is a web application that allows homeowners to securely fund home-service projects via Escrow.com. Contractors get paid only when milestones are approved by the homeowner.

This repository contains the full monorepo for the Conforma application, including the backend API and the frontend web application.

## Tech Stack

### Backend

*   **Framework:** Node.js + TypeScript + Express
*   **Database:** Prisma + PostgreSQL
*   **Authentication:** JWT (HS256)
*   **Payments:** Escrow.com API
*   **Notifications:** SendGrid (Email) & Twilio (SMS)
*   **Background Jobs:** node-cron
*   **API Docs:** OpenAPI 3.1 (Swagger)

### Frontend

*   **Framework:** Next.js 14 (App Router) + TypeScript
*   **Styling:** TailwindCSS + shadcn/ui
*   **Animations:** Framer Motion
*   **Data Fetching:** React Query + Axios

## Phase 3 Highlights

* **Monetization ready:** Stripe-backed subscriptions at /pricing and /dashboard/billing, configurable platform fees, and tier-adjusted instant payout pricing.
* **Instant payout workflows:** Contractors request /dashboard/payouts instant transfers with transparent fee breakdowns from /api/jobs/{id}/fees.
* **AI dispute triage:** Admins trigger /ai/disputes/:id/triage to summarize evidence, with summaries rendered in /admin/disputes/[id].
* **Smart matching:** Project creation uses /match/contractors to surface verified, high-response contractors in /create-project.
* **Role dashboards:** /dashboard/analytics and /admin/analytics visualize revenue, SLA, and spend; CSV exports ship from /exports/accounting.csv.
* **Multi-state expansion:** /config/states governs review windows and fee caps for TX/OK/LA, with admin overrides via /jobs/{id}/state.
* **Referrals and credits:** /dashboard/referrals tracks codes, credits, and redemptions that auto-apply during plan upgrades.

## Phase 5 Highlights

* **AI verification pipeline:** Insurance and license uploads are OCR’d with Tesseract, parsed with local Ollama (or OpenAI fallback), auto-approved when confidence ≥ 0.8, and surfaced with admin audit drawers. Admins can reverify, override statuses, and adjust expirations from `/admin/verification`.
* **Risk scoring engine:** `/api/jobs/:id/fund` now runs deterministic risk checks (disposable emails, rapid funding, unsafe states, disputes, trade caps) persisting to `risk_events`. Configurable thresholds and trade caps live under `/api/admin/risk/config`.
* **Observability stack:** OpenTelemetry traces + Prometheus metrics are exposed at `/metrics` and `/ops/docker-compose.yml` spins up Prometheus/Grafana dashboards (latency/error rate, verification turnaround, payout SLO). Alerts can be defined directly inside Grafana.
* **Offline evidence capture:** Contractors can capture milestone evidence at `/capture`, queue media in IndexedDB, and background-sync via service worker + `BackgroundSync`. Duplicates are eliminated server-side with content hashes.
## Getting Started

### Prerequisites

*   Node.js (v18 or later)
*   npm
*   A PostgreSQL database (e.g., from Render or a local instance)
*   API keys for Escrow.com, SendGrid, and Twilio.

### Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Set up the Backend:**
    *   Navigate to the root directory.
    *   Install dependencies: `npm install`
    *   Create a `.env` file by copying `.env.example`.
    *   Fill in the required environment variables in the `.env` file (database URL, API keys, etc.).

3.  **Set up the Frontend:**
    *   Navigate to the `/frontend` directory.
    *   Install dependencies: `npm install`
    *   Create a `.env.local` file.
    *   Add `NEXT_PUBLIC_API_BASE_URL` and point it to your backend API URL (e.g., `http://localhost:3001/api`).

### Running the Application

1.  **Run the Backend:**
    *   From the root directory:
    *   Apply database migrations: `npx prisma migrate dev`
    *   (Optional) Seed the database: `npx prisma db seed`
    *   Start the development server: `npm run dev`
    *   The backend will be running at `http://localhost:3001`.
    *   API documentation is available at `http://localhost:3001/docs`.
    *   To view telemetry dashboards, run `docker compose -f ops/docker-compose.yml up` and visit Grafana at `http://localhost:3002` (default `admin/admin`) and Prometheus at `http://localhost:9090`. The API emits traces to `OTEL_EXPORTER_OTLP_ENDPOINT` and Prometheus metrics at `/metrics`.

2.  **Run the Frontend:**
    *   From the `/frontend` directory:
    *   Start the development server: `npm run dev`
    *   The frontend will be running at `http://localhost:3000`.

### Local Feature Tour
1. **Explore pricing** at /pricing to review Free/Pro/Verified tiers and feature breakdowns.
2. **Manage billing** from /dashboard/billing: upgrade with referral credits, open Stripe portal links, and confirm instant payout eligibility.
3. **Test instant payout** via /dashboard/payouts; trigger /payouts/{jobId}/instant and inspect /api/jobs/{id}/fees for breakdowns.
4. **Try smart matching** on /create-project to load /match/contractors recommendations tailored to trade, ZIP, and budget.
5. **Run AI triage** by visiting /admin/disputes/[id] and pressing "Run AI triage" to populate suggestions from /ai/disputes/:id/triage.
6. **Review analytics** on /dashboard/analytics and /admin/analytics, then download the CSV export via /exports/accounting.csv.
7. **Share referrals** at /dashboard/referrals and redeem a code to watch credits auto-apply on plan upgrades.
8. **Inspect verification decisions** at /dashboard/verification (contractor) and /admin/verification (admin) to review AI confidence, override outcomes, or request reverification.
9. **Exercise the risk engine** by funding jobs via /api/jobs/{id}/fund and view the latest score/reasons at /api/admin/risk/:jobId.
10. **Capture offline evidence** at /capture, queue media while offline, then reconnect to watch the background sync push assets upstream.
## Deployment

The backend is configured for deployment on **Render**, and the frontend is configured for **Vercel**.

### Backend (Render)

1.  Create a new "Web Service" on Render and connect it to this repository.
2.  Set the build command to `npm install && npm run build`.
3.  Set the start command to `npm start`.
4.  Add all the required environment variables from the `.env.example` file to the Render service configuration.

### Frontend (Vercel)

1.  Create a new project on Vercel and connect it to this repository.
2.  Set the root directory to `frontend`.
3.  Vercel should automatically detect the Next.js framework and configure the build settings.
4.  Add the `NEXT_PUBLIC_API_BASE_URL` environment variable and point it to your live Render backend URL.

## Environment Variables

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string for Prisma. |
| `JWT_SECRET` | HS256 secret for API authentication. |
| `ESCROW_API_KEY` | Escrow.com sandbox/live API key. |
| `SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL` | Required for invite/review/document notifications. |
| `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` | Optional SMS notifications. |
| `FILE_UPLOAD_BASE_URL` | Base URL for document upload links (defaults to `https://uploads.conforma.com`). |
| `FILE_CDN_BASE_URL` | Public CDN base for uploaded docs (defaults to `https://cdn.conforma.com`). |
| `FRONTEND_URL` | Used in invite emails to build acceptance links. |
| `STRIPE_SECRET` | Stripe secret key for plan activation and invoicing. |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret. |
| `STRIPE_PRICE_PRO`, `STRIPE_PRICE_VERIFIED` | Stripe price IDs mapped to Pro/Verified plans. |
| `PLATFORM_FEE_BPS` | Default platform fee in basis points (e.g., `150`). |
| `SUPPORT_EMAIL` | Outbound contact displayed when funding is flagged or blocked by the risk engine. |
| `STATE_WHITELIST` | Comma-separated list of homeowner states eligible for auto-approval. |
| `OLLAMA_URL`, `OLLAMA_MODEL` | Local LLM endpoint/model for AI document parsing (defaults to `http://localhost:11434` / `llama3.1:8b`). |
| `OPENAI_API_KEY`, `OPENAI_MODEL` | Optional fallback provider for AI document parsing (e.g., `gpt-4o-mini`). |
| `OCR_CONCURRENCY` | Number of parallel OCR workers used during document verification (default `2`). |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | OTLP gRPC collector endpoint for traces (default `http://localhost:4317`). |
| `METRICS_PORT` | Port exposed by the embedded Prometheus exporter (default `9464`). |
| `INSTANT_PAYOUT_ENABLED` | Toggle instant payout feature (`true`/`false`). |
| `INSTANT_PAYOUT_FEE_BPS` | Instant payout fee tier in basis points (e.g., `100`). |
| `AI_TRIAGE_ENABLED` | Enable AI dispute triage (`true`/`false`). |
| `AI_PROVIDER`, `AI_API_KEY` | AI vendor identifier (e.g., `openai`) and API key. |
| `ALLOWED_STATES` | Comma-delimited state codes Conforma operates in (e.g., `TX,OK,LA`). |
| `ACCOUNTING_EXPORT_CURRENCY` | Currency code for accounting exports (defaults to `USD`). |

Frontend `.env.local` must include `NEXT_PUBLIC_API_BASE_URL`.

## Testing & Linting

```bash
# Backend
npm run build
npm test

# Frontend
cd frontend
npm run lint
npm run test:e2e   # requires `npm run dev` in another terminal
```

Vitest suites cover invites, contractor search filtering, and review aggregation. The frontend lint pass keeps the new React Query surfaces healthy.






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

## Phase 2 Highlights

* **Profiles:** `/dashboard/profile` now manages avatars, bios, trades, aliases, and service areas.
* **Contractor discovery:** `/contractors` delivers rich filters (trade, ZIP radius, verified badges), ratings, and invite CTAs.
* **Invites:** Authenticated users invite non-members directly from contractor profiles. Invitees finish onboarding at `/invitations/[token]`.
* **Messaging:** Job-scoped chat threads live at `/dashboard/messages/[jobId]` with read receipts and notification hooks.
* **Ratings & reviews:** Homeowners review completed jobs; contractors see aggregated feedback under `/dashboard/reviews`.
* **Verification badges:** Contractors upload license/insurance docs at `/dashboard/verification`; admins triage in `/admin/verification`.
* **Notifications:** A header bell surfaces invite, message, review, and verification updates in real time.

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

2.  **Run the Frontend:**
    *   From the `/frontend` directory:
    *   Start the development server: `npm run dev`
    *   The frontend will be running at `http://localhost:3000`.

### Local Feature Tour

1. **Seed sample data** with `npx prisma db seed` to create demo homeowners, contractors, jobs, and verification docs.
2. **Search contractors** at `/contractors`, apply filters, and open public profiles.
3. **Send an invite** from a contractor profile. Copy the tokenized link and open it in a fresh session to complete onboarding via `/invitations/[token]`.
4. **Message the team** by visiting `/dashboard/messages/<jobId>` as a job participant.
5. **Submit a review** for any completed job from `/dashboard/reviews`.
6. **Upload license/insurance** at `/dashboard/verification` and approve/reject from `/admin/verification`.
7. **Check notifications** via the bell iconâ€"new invites, messages, reviews, and document decisions appear instantly.

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

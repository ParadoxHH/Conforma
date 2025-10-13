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

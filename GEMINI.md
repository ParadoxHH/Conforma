# Project: Conforma

This directory contains the project plan and requirements for **Conforma**, a Texas-only escrow platform for home-service projects.

## Project Overview

**Conforma** is a web application that allows homeowners to securely fund home-service projects via Escrow.com. Contractors get paid only when milestones are approved by the homeowner. The project is divided into a backend and a frontend, with detailed specifications for each.

### Backend

*   **Purpose:** To handle the core logic of the application, including user authentication, job and milestone management, escrow transactions, and notifications.
*   **Tech Stack:**
    *   Node.js + TypeScript + Express
    *   Prisma + PostgreSQL
    *   JWT (HS256) for authentication
    *   Escrow.com API for funding and payments
    *   SendGrid for email notifications
    *   Twilio for SMS notifications
    *   node-cron for background jobs
    *   OpenAPI 3.1 for API documentation
    *   Docker for containerization

### Frontend

*   **Purpose:** To provide a user-friendly interface for homeowners and contractors to interact with the platform, as well as a marketing website to attract new users.
*   **Tech Stack:**
    *   Next.js 14 (App Router) + TypeScript
    *   TailwindCSS + shadcn/ui
    *   Framer Motion for animations
    *   i18n for English and Spanish localization
    *   React Query for data fetching

## Development Stages

The project is broken down into the following stages:

*   **Stage 1: Backend Development:** Build the core backend functionality.
*   **Stage 2: Database Design:** Design the PostgreSQL schema using Prisma.
*   **Stage 3: Frontend Development:** Build the marketing and dashboard UI.
*   **Stage 4: Integration:** Connect the frontend and backend.
*   **Stage 5: Quality Assurance:** Write E2E and integration tests.
*   **Stage 6: DevOps:** Prepare the application for deployment.

## Building and Running

### Backend

```bash
# Install dependencies
npm install

# Run migrations
npx prisma migrate dev

# Seed the database
npx prisma db seed

# Start the development server
npm run dev
```

### Frontend

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Docker

```bash
# Build and run the containers
docker-compose up --build
```

## Development Conventions

*   **Code Style:** Follow standard conventions for TypeScript, Node.js, and React.
*   **Database Schema:** The database schema is defined in `src/prisma/schema.prisma`.
*   **API Documentation:** The backend API is documented using OpenAPI 3.1. The specification can be found at `docs/swagger.yml` and is served at `/docs` on the running backend.
*   **Testing:** Write unit and integration tests for the backend, and E2E tests for the frontend.
    *   Backend tests are run with `npm test`.
    *   Frontend E2E tests are run with `cd frontend && npm run test:e2e`.

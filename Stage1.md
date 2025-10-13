You are a senior backend engineer.  
Build the backend for **Conforma** — a Texas-only escrow platform for home-service projects.  
Purpose: Homeowners fund projects securely via Escrow.com; contractors get paid only when milestones are approved.  
Constraints: Solo founder, small budget, MVP web app only.

---

TECH STACK
- Node.js + TypeScript + Express
- ORM: Prisma + PostgreSQL
- Auth: JWT (HS256), Argon2 password hashing
- Roles: ADMIN, CONTRACTOR, HOMEOWNER
- Integrations: Escrow.com sandbox API (funding, release, refund)
- Notifications: SendGrid (email), Twilio (SMS)
- Background jobs: node-cron or BullMQ (for milestone auto-approve timers)
- API Docs: OpenAPI 3.1 (Swagger UI at /docs)
- Deployment-ready via Dockerfile + docker-compose (api + postgres)

---

REQUIREMENTS
1. Auth routes (register, login, me)
2. Job & Milestone management (1–3 milestones/job)
3. Escrow funding (create, fund, release, refund)
4. Dispute management (open, resolve with partial release/refund/resubmit)
5. Notifications (email/SMS)
6. Admin dashboard endpoints
7. Auto-approve milestones after 3 days (mid) / 5 days (final)
8. Audit logs for all state changes
9. Enforce TX-only homeowners
10. Serve OpenAPI docs

---

DELIVERABLES
- `/src` folder structure with routes, controllers, services
- Prisma schema + seed script
- JWT middleware + RBAC guard
- Background job script for timers
- Dockerfile + docker-compose
- README with setup instructions

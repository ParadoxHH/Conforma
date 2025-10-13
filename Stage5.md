You are a QA engineer.  
Write E2E and integration tests for **Conforma** backend + frontend.

---

BACKEND TESTS (Vitest/Jest)
- Auth register/login
- Contractor creates job with 3 milestones
- Homeowner accepts invite → FUNDING_REQUIRED
- Escrow funded webhook → IN_PROGRESS
- Milestone submit → approve → final release
- Auto-approve timer triggers
- Dispute → partial release resolution
- TX-only restriction

FRONTEND TESTS (Playwright)
- Load landing page + CTA visible
- EN/ES toggle switches text
- Lead form validates and submits
- Contractor Dashboard: create job, invite homeowner
- Homeowner Dashboard: approve milestone
- Admin Dashboard: resolve dispute

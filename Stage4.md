You are an integration engineer.  
Connect the Conforma front-end and backend together securely.

---

TASKS
- Create `/lib/api.ts` client for frontend (fetch wrapper with base URL + bearer token)
- Add hooks: useAuth(), useJobs(), useMilestones(), useDisputes()
- Wire all forms to backend routes (auth, create job, invite, approve/dispute)
- Handle error states (401, 403, 422) with toasts
- Protect routes by role
- Add Escrow.com sandbox webhook endpoint in backend
- Test end-to-end: create job → fund escrow (sandbox) → submit milestone → approve → payout

You are a database architect.  
Design the PostgreSQL schema for **Conforma**, using Prisma syntax.  
Goal: support escrow transactions, milestones, disputes, and notifications.

---

TABLES
Users (Admin, Contractor, Homeowner)
Contractors (trade, companyName, payoutAccount)
Homeowners (address, city, state=TX, zip)
Jobs (title, description, totalPrice, status, escrowTransactionId)
Milestones (jobId, title, price, status, submittedAt, approvedAt, reviewDeadlineAt)
EvidenceFiles (milestoneId, uploaderUserId, url, type)
Disputes (milestoneId, reasonText, status, resolutionNotes)
Notifications (userId, type, payload, sentAt)
AuditLogs (actorUserId, entity, entityId, action, metadata)
WebhookEvents (source, payload, processed)

---

RULES
- Homeowner.state must always be 'TX'
- Max 3 milestones/job
- Sum of milestone.price = job.totalPrice
- Auto-approve milestones past deadline
- Cascade delete dependent entities

---

OUTPUT
- Full `schema.prisma`
- Example seed script (admin, 1 contractor, 1 homeowner, 1 job with 3 milestones)
- SQL migration command

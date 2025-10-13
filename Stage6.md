You are a DevOps engineer.  
Prepare Conforma for deployment on Vercel (frontend) and Railway (backend).

---

BACKEND
- Railway Postgres + Node container
- `.env` variables for Escrow.com, SendGrid, Twilio, JWT_SECRET
- Add CORS to allow frontend domain
- Dockerfile + docker-compose for local dev

FRONTEND
- Vercel deploy via GitHub
- `.env` with NEXT_PUBLIC_API_BASE_URL
- Automatic previews per branch
- Optimize images + prefetch for top pages

DOCS
- README with setup steps
- Postman collection for API endpoints
- Monitoring: Railway logs, Pingdom uptime check

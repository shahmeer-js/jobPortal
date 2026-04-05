# Query Jobs — Microservices Job Platform

A **microservices-based Job Portal** with AI-powered **Resume Analyzer** + **Career Guide generation**, premium subscriptions, and production-grade observability.

## Architecture (Microservices)

Services:
- **auth** — authentication, forgot-password, tokens
- **user** — user profile, roles, preferences, saved jobs, applications (user-side)
- **job** — job posting, search/filtering, application workflow
- **payment** — Stripe billing, premium plans
- **utils** — shared packages (mails sending, ai features)

### High-level flow
- **Frontend (Next.js)** talks to services via REST (Node.js + Express + TypeScript).
- **Kafka** handles async events (email sending, application status change notifications, etc.).
- **Redis** stores short-lived sessions/OTPs for forgot-password flows.
- **NeonDB (Postgres)** is the primary database.
- **Cloudinary** stores images + resumes (PDF/DOCX).
- **Gemini API** analyzes resumes and generates career guidance content.
- **Observability** via Grafana + Prometheus + Loki + Winston logging.

---

## Tech Stack

### Backend
- **Node.js**, **Express.js**, **TypeScript**
- **NeonDB (PostgreSQL)**
- **Kafka** for event-driven workflows (emails, status updates)
- **Redis** for forgot-password session/OTP storage
- **Nodemailer** for email delivery
- **Cloudinary** for file uploads (profile images + resumes)
- **Stripe** for premium subscription payments
- **Gemini API** for:
  - Resume analyzer (skills, gaps, recommendations)
  - Career guide generation (roadmaps, role suggestions)
- **Docker** for containerization

### Frontend
- **Next.js**, **TypeScript**
- **Tailwind CSS**
- **shadcn/ui** component system

### Monitoring / Logging
- **Winston** for structured logs
- **Prometheus** for metrics
- **Grafana** for dashboards
- **Loki** for log aggregation (Grafana datasource)

---

## Repo Structure (suggested)

> Adjust if your repo structure differs.

```text
jobPortal/
  frontend/
  services/
    auth/                     # Auth microservice
    user/                     # User microservice
    job/                      # Job microservice
    payment/                  # Payment microservice
    utils/                    # utils microservices                 
```

---

## Features

### Core Platform
- User authentication + authorization
- Job posting and job search
- Apply to jobs + application tracking
- Application status changes with async email notifications

### AI (Gemini)
- **Resume Analyzer**: extracts skills, suggests improvements, highlights missing keywords
- **Career Guide Generator**: recommends roles, learning paths, and personalized roadmaps

### Premium Subscriptions (Stripe)
- Subscription plans (monthly)
- Subscription lifecycle:
  - created, renewed, canceled, payment_failed

### Uploads (Cloudinary)
- Profile images
- Resume uploads
- Secure URLs and metadata stored in DB

### Async Messaging (Kafka)
Event examples:
- `auth.forgot_password.requested` → email OTP/link
- `application.status.changed` → notify candidate/company
- `payment.subscription.updated` → update premium status

### Observability
- Prometheus metrics per service (`/metrics`)
- Structured logs via Winston → Loki
- Grafana dashboards for:
  - request rate, latency, errors (RED metrics)
  - payment error tracking

---

## Getting Started

### Prerequisites
- Node.js (LTS recommended)
- Docker
- Accounts / keys:
  - NeonDB Postgres
  - Cloudinary
  - Stripe
  - Gemini API

### 1) Clone
```bash
git clone https://github.com/shahmeerking231/jobPortal.git
cd jobPortal
```

### 2) Environment variables

Create `.env` files per service (example keys below).  
Recommended: use `.env.example` templates in each service.

#### All services have their own
```env
SERVICE_NAME=e.g.auth-service
PORT=4000

DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DB?sslmode=require

REDIS_URL=redis://localhost:6379

KAFKA_BROKERS=localhost:9092
KAFKA_CLIENT_ID=jobportal
KAFKA_GROUP_ID=jobportal-consumers

CLOUDINARY_CLOUD_NAME=xxxx
CLOUDINARY_API_KEY=xxxx
CLOUDINARY_API_SECRET=xxxx

GEMINI_API_KEY=xxxx

MAIL_USER=xxxx
MAIL_PASS=xxxx

STRIPE_SECRET_KEY=sk_test_xxx
FRONTEND_URL=http://localhost:3000
LOKI_URL=xxxx
```

### 3) Run locally (example)
```bash
# in each service directory
npm install
npm run dev
```

---

## API (Endpoints)

### Auth Service
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password/:session`

### User Service
- `GET /api/user/me`  - Get the profile
- `GET /api/user/:userId`  - Get user profile
- `PUT /api/user/update/profile`  - Update profile
- `PUT /api/user/update/pic`  - Update the profile pic
- `PUT /api/user/update/resume`  - Update resume
- `POST /api/user/skill/add`  - Add skill
- `DELETE /api/user/skill/remove`  - Remove skill
- `POST /api/user/apply/job`  - Apply for a Job
- `GET /api/user/application/all`  - Get all applications for a user

### Job Service
- `GET /api/job?title=&location=`  - Get all active Jobs
- `GET /api/job/:jobId`  - Get Single Job by id
- `POST /api/job/new`  - Create a new Job
- `PUT /api/job/update/:jobId`  - Update a Job
- `DELETE /api/job/:jobId`  - Delete a Job
- `GET /api/job/application/:applicationId`  - Get Job applications
- `PUT /api/job/application/:applicationId`  - Update Job application status
- `GET /api/job/company`  - Get all Companies
- `GET /api/job/company/:companyId`  - Get Company Details
- `POST /api/job/company/new`  - Create a new Company
- `DELETE /api/job/company/:companyId`  - Delete a Company

### Payment Service
- `POST /api/payments/checkout`  - For checkout
- `GET /api/payments/verify`  - For verifying payment

### Utils Service
- `POST /api/utils/upload`  - For file upload
- `POST /api/utils/carrer`  - For genertaing carrer guidance
- `POST /api/utils/resume-analyzer`  - For resume analyzing

### Common with all services
- `GET /metrics`

---

## Resume Analyzer + Career Guide (Gemini)

Typical workflow:
1. User uploads resume → stored on Cloudinary
2. Backend extracts text (PDF/DOCX parsing) and sends prompt to Gemini
3. Store:
   - extracted skills
   - ATS improvements
   - recommended roles
   - learning roadmap

---

## Monitoring Setup
- **Prometheus** scrapes each service `/metrics`
- **Winston → Loki** for centralized logs
- **Grafana** dashboards:
  - per-service request rate/latency/errors
  - payment success/fail

---

## Contributing
1. Fork the repo
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit: `git commit -m "feat: add ..."`
4. Push and open a PR

---

## Docker

### Backend Microservices images

1. Auth Service
```
https://hub.docker.com/repository/docker/shahmeer01/job_portal_auth
```

2. User Service
```
https://hub.docker.com/repository/docker/shahmeer01/job_portal_user
```

3. Job Service
```
https://hub.docker.com/repository/docker/shahmeer01/job_portal_job
```

4. Payment Service
```
https://hub.docker.com/repository/docker/shahmeer01/job_portal_payment
```

5. Utils Service
```
https://hub.docker.com/repository/docker/shahmeer01/job_portal_utils
```

### Backend Microservices images

```
https://hub.docker.com/repository/docker/shahmeer01/job_portal_frontend
```

---

## License
Add a license if you plan to open-source this project (MIT/Apache-2.0 recommended).

# 📄 PRODUCT REQUIREMENTS DOCUMENT (PRD) v1.0

## Web-Based Personal Asset Management System

---

# 1. Executive Summary

### Problem Statement

Pencatatan aset pribadi masih dilakukan melalui file Excel lokal yang tidak fleksibel, tidak memiliki histori terstruktur, serta tidak memiliki kontrol terhadap perubahan data historis.

### Proposed Solution

Membangun sistem web berbasis **Express.js + React + MySQL** untuk pencatatan dan monitoring aset investasi dengan dashboard pertumbuhan, snapshot manual, RBAC, audit log, automated SQL backup, serta mekanisme semi-immutable ledger untuk menjaga integritas data historis.

### Success Criteria (Measurable KPIs)

1. 100% snapshot dengan tanggal < hari ini tidak dapat diedit atau dihapus.
2. 100% snapshot dengan tanggal > hari ini ditolak saat pembuatan.
3. Dashboard 30 hari terakhir load < 700ms untuk ≤ 1.000 snapshot.
4. 100% Login, Create, Update, Delete event tercatat di audit log.
5. Database backup otomatis menghasilkan file `.sql` setiap hari dengan retention 30 hari.
6. Zero duplicate snapshot per asset per tanggal.

---

# 2. User Experience & Functionality

---

## User Personas

### 👤 Admin

- Full control system
- Manage users
- View audit logs
- Restore backup (manual)

### 👤 User

- Create & update asset
- Input snapshot nilai
- View dashboard

---

## System Constraints

- Currency: **IDR only (hard-coded, no multi-currency support)**
- Snapshot: Manual input (tidak wajib setiap hari)
- Snapshot tidak boleh future date
- Snapshot lampau bersifat immutable
- Max expected data: < 5.000 snapshot dalam 2 tahun
- Users: 2 (non multi-tenant)
- Timezone system: Asia/Jakarta (server authoritative)

---

## User Stories & Acceptance Criteria

---

### Story 1 — Authentication

**As a user**, I want to login securely so that asset data remains protected.

**Acceptance Criteria**

- Email + Password login
- Password hashed using bcrypt (≥ 10 salt rounds)
- JWT expiration 24 hours
- Login rate limit: max 5 attempts per 10 minutes
- Login event logged
- Password minimum 8 characters
- Server timezone Asia/Jakarta enforced

---

### Story 2 — Asset CRUD

**As a user**, I want to manage asset categories so I can track investments.

**Asset Fields**

- id
- name
- category (Stock / Gold / Crypto / Other)
- description (optional)
- created_by
- is_deleted (soft delete)
- created_at

**Acceptance Criteria**

- Admin: full CRUD
- User: Create + Update only
- Delete = soft delete
- Asset tidak memiliki versioning
- Index on (category)
- All changes logged

---

### Story 3 — Snapshot Value Tracking (Semi-Immutable Ledger)

**As a user**, I want historical financial data to remain protected from modification.

---

## Snapshot Rules

| Action | Today      | Past Date   | Future Date |
| ------ | ---------- | ----------- | ----------- |
| Create | ✅ Allowed | ✅ Allowed  | ❌ Rejected |
| Update | ✅ Allowed | ❌ Rejected | ❌ N/A      |
| Delete | ✅ Allowed | ❌ Rejected | ❌ N/A      |

---

### Snapshot Fields

- id
- asset_id
- snapshot_date (DATE)
- value (DECIMAL(18,2))
- created_by
- created_at

---

### Acceptance Criteria

- snapshot_date <= CURRENT_DATE (server-side validation)
- Update/Delete only allowed if snapshot_date = CURRENT_DATE
- Duplicate date per asset rejected (HTTP 409)
- Invalid future date rejected (HTTP 400)
- Unauthorized historical edit rejected (HTTP 403)
- Indexed by:
  - (asset_id, snapshot_date) UNIQUE
  - (snapshot_date)

- Query 30-day range < 500ms
- All rejected attempts logged in audit log

---

## Story 4 — Dashboard

**As a user**, I want to view total asset growth over time.

### Dashboard Requirements

- Default range: last 30 days
- Line chart: Total asset per day
- Carry-forward logic for missing dates
- Total Net Worth displayed in IDR
- Response time < 700ms

### Data Calculation Logic

For each date in range:

1. Fetch latest snapshot per asset ≤ date
2. SUM all values
3. Return daily aggregated total

All calculation executed server-side.

---

### Story 5 — Role-Based Access Control

| Role  | Permission                         |
| ----- | ---------------------------------- |
| Admin | Full CRUD + User Management + Logs |
| User  | Create + Update only               |

**Acceptance Criteria**

- Role middleware in Express
- Unauthorized → HTTP 403
- Admin-only route:
  - `/admin/users`
  - `/admin/logs`

---

### Story 6 — Audit Logging

Log events:

- LOGIN
- CREATE
- UPDATE
- DELETE
- FORBIDDEN_ATTEMPT (historical modification attempt)

**Log Schema**

- id
- user_id
- action_type
- entity_type
- entity_id
- ip_address
- created_at

**Acceptance Criteria**

- 100% coverage of all state-changing operations
- Historical edit attempts logged
- Indexed on (user_id, created_at)
- Retention: unlimited

---

### Story 7 — Automated SQL Backup

**As an Admin**, I want automated database backups.

---

## Backup Requirements

- Daily automatic backup
- Format: `.sql`
- Generated using `mysqldump`
- Filename format:

```
backup-YYYY-MM-DD.sql
```

- Stored in:
  `/private_backups`
- Directory not publicly accessible

---

### Acceptance Criteria

- Cron runs daily 02:00 Asia/Jakarta
- Backup size validated > 0 KB
- Retention policy: keep last 30 backups
- Auto-delete older backups
- Backup failure logged

---

## Non-Goals

- Real-time stock API sync
- Automatic asset valuation
- Multi-currency support
- Mobile native app
- Financial forecasting
- Multi-tenant SaaS
- 2FA Authentication
- Offsite backup (S3/Drive)

---

# 4. Technical Specifications

---

## Architecture Overview

### Frontend

- React SPA
- Axios
- Chart.js / Recharts
- Protected routes

### Backend

- Express.js REST API
- JWT Authentication
- Role middleware
- Ledger validation middleware
- Audit middleware

### Database

- MySQL 8
- Foreign key constraints enforced
- Unique constraint (asset_id, snapshot_date)
- Indexed date columns

---

## 4.1 Project Layout Structure

### Root Directory

```
asset-management-system/
│
├── backend/
├── frontend/
├── docker-compose.yml
├── README.md
└── .gitignore
```

### Design Principles

- Backend dan Frontend dipisahkan secara independen
- Tidak ada `.env` di root project
- Konfigurasi environment terisolasi per service
- Siap untuk Docker (development)
- Siap untuk deployment terpisah (production)

---

## 4.2 Backend Layout (Express.js)

```
backend/
│
├── src/
│   ├── app.js
│   ├── server.js
│   │
│   ├── config/
│   │   ├── database.js
│   │   ├── env.js
│   │   └── timezone.js
│   │
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── assets/
│   │   ├── snapshots/
│   │   ├── dashboard/
│   │   └── audit/
│   │
│   ├── middlewares/
│   ├── utils/
│   ├── database/
│   │   ├── migrations/
│   │   └── seeds/
│   │
│   └── jobs/
│       └── backup.job.js
│
├── backups/              (Generated SQL backups)
├── .env
├── .env.example
├── package.json
└── README.md
```

---

### Backend Environment Variables (.env)

File location:

```
backend/.env
```

Purpose:

- Database credentials
- JWT secret
- Server config
- Timezone enforcement

Example:

```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASS=password
DB_NAME=asset_db
JWT_SECRET=super_secret_key
TZ=Asia/Jakarta
```

Security Rule:

- `.env` must NOT be committed to repository
- `.env.example` must exist without sensitive values

---

## 4.3 Frontend Layout (React SPA)

```
frontend/
│
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   │
│   ├── routes/
│   ├── layouts/
│   ├── features/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── assets/
│   │   ├── snapshots/
│   │   └── users/
│   │
│   ├── components/
│   ├── services/
│   ├── hooks/
│   ├── utils/
│   └── constants/
│
├── public/
├── .env
├── .env.example
├── package.json
└── README.md
```

---

### Frontend Environment Variables (.env)

File location:

```
frontend/.env
```

Purpose:

- API base URL
- Public runtime configuration

Example (Vite):

```
VITE_API_URL=http://localhost:5000/api
```

Security Rule:

- No secret allowed in frontend `.env`
- All frontend env variables are publicly exposed after build

---

## 4.4 Environment Strategy

### Development

- Docker Compose optional
- Backend and frontend run independently
- Separate `.env` per service
- MySQL local or Docker container

### Production (Hostinger Deployment)

Backend:

- Upload backend folder
- Configure `.env` in server environment
- Cron configured for backup

Frontend:

- Build production bundle
- Upload static files to hosting
- Set `VITE_API_URL` to production API endpoint

---

## 4.5 .gitignore Requirement

Root `.gitignore` must include:

```
**/.env
node_modules
dist
build
```

---

## 4.6 Rationale

Separation of environment files ensures:

- Backend secrets remain private
- Frontend configuration remains public-safe
- No accidental secret exposure
- Clean Dev → Production transition
- Clear ownership per service

---

## 4.7 Compliance with PRD Requirements

This layout supports:

- RBAC implementation
- Ledger validation layer
- Audit logging
- Automated SQL backup
- Asia/Jakarta timezone enforcement
- Production-ready deployment

---

## Ledger Enforcement Logic

Before CREATE:

- Reject if snapshot_date > TODAY

Before UPDATE / DELETE:

- Fetch snapshot_date
- If snapshot_date != TODAY → return 403

Server date authoritative (Asia/Jakarta).

---

## Security Requirements

- bcrypt hashing
- JWT strong secret
- HTTPS production
- CORS whitelist
- Prepared statements
- ENV-based DB config
- Backup folder outside public root
- No client-side date trust

---

## Performance Requirements

| Component       | Target  |
| --------------- | ------- |
| Login API       | < 300ms |
| CRUD Asset      | < 400ms |
| Snapshot Insert | < 300ms |
| Dashboard 30d   | < 700ms |

---

# 5. Risks & Roadmap

---

## Technical Risks

| Risk                            | Impact              | Mitigation              |
| ------------------------------- | ------------------- | ----------------------- |
| Historical manipulation attempt | Data integrity risk | Server-side ledger rule |
| Carry-forward query slow        | Dashboard lag       | Future summary table    |
| Cron not supported by hosting   | Backup failure      | Manual validation       |
| Timezone mismatch               | Ledger rule broken  | Force Asia/Jakarta      |

---

## Phased Rollout

### Phase 1 — MVP (2–3 Weeks)

- Auth
- RBAC
- Asset CRUD
- Snapshot with ledger rule
- Dashboard 30d
- Audit log
- Daily SQL backup

---

### Phase 1.1

- Custom date range
- Export CSV
- Soft delete restore
- Monthly growth %

---

### Phase 2

- Precomputed daily summary table
- PWA support
- Category breakdown
- Asset comparison chart

---

# System Integrity Level

Semi-Immutable Financial Tracking System
Protected historical records
Controlled ledger editing
Suitable for personal financial discipline tracking

---

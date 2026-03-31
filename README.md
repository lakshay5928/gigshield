# ⚡ GigShield
### Parametric Income Protection for Grocery Delivery Workers
**Zepto / Blinkit | DEVTrails 2026 — Phase 2**

---

## 🚀 Quick Start (Local)

### Prerequisites
- Node.js v18+
- PostgreSQL (or free Supabase account)
- npm

---

### Step 1 — Clone & Setup

```bash
git clone https://github.com/lakshay5928/gigshield.git
cd gigshield
```

---

### Step 2 — Database Setup

**Option A: Supabase (Recommended — Free)**
1. Go to [supabase.com](https://supabase.com) → New Project
2. Go to SQL Editor → paste entire contents of `backend/db/schema.sql` → Run
3. Copy your connection string from Settings → Database

**Option B: Local PostgreSQL**
```bash
psql -U postgres -c "CREATE DATABASE gigshield;"
psql -U postgres -d gigshield -f backend/db/schema.sql
```

---

### Step 3 — Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:
```
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:password@localhost:5432/gigshield
JWT_SECRET=gigshield_super_secret_key
FRONTEND_URL=http://localhost:3000
```

Start backend:
```bash
npm run dev
```

✅ Backend running at: `http://localhost:5000`
✅ Health check: `http://localhost:5000/health`

---

### Step 4 — Frontend Setup

Open a new terminal:
```bash
cd frontend
npm install
cp .env.example .env
```

`.env` is already set to:
```
REACT_APP_API_URL=http://localhost:5000/api
```

Start frontend:
```bash
npm start
```

✅ App running at: `http://localhost:3000`

---

## 🎮 Demo Flow

### Worker Flow
| Step | URL | What to do |
|------|-----|-----------|
| 1 | `localhost:3000` | Register as worker (name, mobile, city, zone) |
| 2 | Auto-redirect | See AI-calculated weekly premium quote |
| 3 | Click Activate | Policy goes live |
| 4 | `localhost:3000/dashboard` | See active policy, trust level, claims |
| 5 | `localhost:3000/report` | Submit rain report (crowdsource) |

### Admin Flow
| Step | URL | What to do |
|------|-----|-----------|
| 1 | `localhost:3000/admin` | Overview — stats, charts, workers |
| 2 | `localhost:3000/admin/simulate` | Fire an alert (5 trigger types) |
| 3 | Watch dashboard | Claims auto-trigger for enrolled workers |
| 4 | `localhost:3000/admin/claims` | Approve/Reject YELLOW & RED claims |
| 5 | Go back to worker dashboard | See payout credited ✅ |

### Full Demo Script (2 min)
```
1. Register worker: Ravi Kumar, 9999999999, Mumbai, MUM-W14, Zepto, ₹65/hr
2. Activate policy (₹100/week)
3. Open Admin → /admin/simulate
4. Select Mumbai + MUM-W14 → Fire "Heavy Rain (Orange Alert)"
5. See: X workers triggered, confidence score shown
6. Open /admin/claims → GREEN = auto-paid, YELLOW/RED = manual review
7. Go back to worker dashboard → claim shows ₹XXX paid via UPI
```

---

## 🌐 Free Deployment

### Backend → Railway

1. Push code to GitHub
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Select repo → set **Root Directory** to `backend`
4. Add Environment Variables:
```
DATABASE_URL=<your supabase connection string>
JWT_SECRET=gigshield_super_secret_key
NODE_ENV=production
FRONTEND_URL=https://your-app.vercel.app
```
5. Railway auto-detects Node.js → runs `npm start`
6. Copy your URL: `https://gigshield-backend.up.railway.app`

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
2. Set **Root Directory** to `frontend`
3. Add Environment Variable:
```
REACT_APP_API_URL=https://gigshield-backend.up.railway.app/api
```
4. Deploy → get URL: `https://gigshield.vercel.app`
5. Go back to Railway → update `FRONTEND_URL` to your Vercel URL

### Deployed URLs
```
Worker App:      https://gigshield.vercel.app
Admin Panel:     https://gigshield.vercel.app/admin
Alert Simulator: https://gigshield.vercel.app/admin/simulate
API Health:      https://gigshield-backend.up.railway.app/health
```

---

## 📁 Project Structure

```
gigshield/
├── backend/
│   ├── app.js                          # Express server entry
│   ├── package.json
│   ├── .env.example
│   ├── config/
│   │   └── db.js                       # PostgreSQL connection
│   ├── db/
│   │   └── schema.sql                  # Full DB schema + seed data
│   ├── middleware/
│   │   ├── auth.js                     # JWT verification
│   │   └── errorHandler.js
│   ├── routes/
│   │   ├── workers.js                  # Register, login, profile
│   │   ├── policies.js                 # Create, manage, quote
│   │   ├── claims.js                   # List, stats, approve/reject
│   │   ├── payouts.js                  # History, simulate
│   │   └── alerts.js                   # 5 trigger types + rain reports
│   ├── services/
│   │   ├── alert-monitor/
│   │   │   ├── alertCron.js            # Auto-end expired alerts
│   │   │   └── confidenceScore.js      # Hybrid IMD+AWS+crowdsource score
│   │   ├── claim-engine/
│   │   │   └── claimOrchestrator.js    # Zero-touch auto claim processing
│   │   ├── fraud-detect/
│   │   │   └── fraudDetector.js        # 3-signal fraud detection
│   │   └── premium-calc/
│   │       └── premiumEngine.js        # AI dynamic premium + payout calc
│   └── mock/
│       └── razorpayMock.js             # Simulated UPI payout
│
└── frontend/
    ├── package.json
    ├── tailwind.config.js
    ├── vercel.json
    ├── .env.example
    ├── public/
    │   ├── index.html
    │   └── manifest.json               # PWA manifest
    └── src/
        ├── App.jsx                     # Router
        ├── index.js
        ├── index.css                   # Tailwind + global styles
        ├── shared/
        │   └── api.js                  # Axios with auth interceptor
        ├── worker-app/pages/
        │   ├── Onboarding.jsx          # 3-step registration
        │   ├── PremiumQuote.jsx        # AI quote + policy activation
        │   ├── Dashboard.jsx           # Policy, claims, trust level
        │   ├── ClaimStatus.jsx         # All claims with payout details
        │   └── RainReport.jsx          # Crowdsource rain report
        └── admin-dashboard/pages/
            ├── Overview.jsx            # Stats, charts, workers table
            ├── ClaimsManager.jsx       # Approve/reject YELLOW+RED claims
            └── AlertSimulator.jsx      # 5 disruption trigger buttons
```

---

## 🔌 API Reference

```
POST   /api/workers/register         Register new worker
POST   /api/workers/login            Login by mobile
GET    /api/workers/me               Get own profile (auth)
PATCH  /api/workers/earnings         Update declared earnings (auth)
GET    /api/workers/all              All workers (admin)

POST   /api/policies/create          Create weekly policy (auth)
GET    /api/policies/my              My policies (auth)
GET    /api/policies/quote?city=     Get premium quote
GET    /api/policies/all             All policies (admin)

POST   /api/alerts/trigger           Fire disruption alert (admin)
POST   /api/alerts/rain-report       Submit crowdsource report
GET    /api/alerts/active            Active alerts
GET    /api/alerts/all               All alerts
PATCH  /api/alerts/:id/end           End alert manually

GET    /api/claims/my                My claims (auth)
GET    /api/claims/all               All claims (admin)
GET    /api/claims/stats             Stats + loss ratio (admin)
PATCH  /api/claims/:id/approve       Approve + trigger payout
PATCH  /api/claims/:id/reject        Reject claim

GET    /api/payouts/my               My payout history (auth)
GET    /api/payouts/summary          Payout summary (auth)
GET    /api/payouts/all              All payouts (admin)
POST   /api/payouts/simulate         Manual payout simulation
```

---

## ✅ Phase 2 Checklist

| Requirement | Status | Where |
|---|---|---|
| Registration Process | ✅ | `Onboarding.jsx` + `routes/workers.js` |
| Insurance Policy Management | ✅ | `PremiumQuote.jsx` + `routes/policies.js` |
| Dynamic Premium Calculation | ✅ | `premiumEngine.js` — zone × seasonal × trust |
| Claims Management | ✅ | `ClaimsManager.jsx` + `routes/claims.js` |
| 3-5 Automated Triggers | ✅ | `AlertSimulator.jsx` — 5 triggers |
| Zero-touch Claim Process | ✅ | `claimOrchestrator.js` — fully automatic |
| AI Integration | ✅ | Progressive trust model + confidence score |
| Fraud Detection | ✅ | 3-signal: GPS accuracy + device ID + timing |
| Instant UPI Payout | ✅ | `razorpayMock.js` — simulated |
| Admin Dashboard | ✅ | `Overview.jsx` — charts + stats |

---

*Built for DEVTrails 2026 — Guidewire University Hackathon*
*GigShield operates as a technology and distribution platform. Insurance underwritten by licensed IRDAI partner.*

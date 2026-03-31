# GigShield Deployment Guide
# Backend → Railway | Database → Supabase | Frontend → Vercel

---

## Step 1: Database (Supabase — Free)

1. Go to https://supabase.com → New Project
2. Copy your **Connection String** from Settings → Database
3. Go to SQL Editor → paste content of `backend/db/schema.sql` → Run

---

## Step 2: Backend (Railway — Free)

1. Go to https://railway.app → New Project → Deploy from GitHub
2. Select your repo → set root directory to `backend`
3. Add Environment Variables:
   ```
   DATABASE_URL=postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres
   JWT_SECRET=gigshield_super_secret_change_this
   NODE_ENV=production
   FRONTEND_URL=https://your-app.vercel.app
   ```
4. Railway auto-detects Node.js and runs `npm start`
5. Copy your Railway URL e.g. `https://gigshield-backend.up.railway.app`

---

## Step 3: Frontend (Vercel — Free)

1. Go to https://vercel.com → New Project → Import from GitHub
2. Set root directory to `frontend`
3. Add Environment Variable:
   ```
   REACT_APP_API_URL=https://gigshield-backend.up.railway.app/api
   ```
4. Deploy → Vercel gives you URL e.g. `https://gigshield.vercel.app`
5. Go back to Railway → update `FRONTEND_URL` to your Vercel URL

---

## Step 4: Test It

```
Worker App:    https://gigshield.vercel.app
Admin Panel:   https://gigshield.vercel.app/admin
Simulate Alert: https://gigshield.vercel.app/admin/simulate
API Health:    https://gigshield-backend.up.railway.app/health
```

---

## Local Development

```bash
# Backend
cd backend
npm install
cp .env.example .env   # fill in your Supabase URL
npm run dev

# Frontend
cd frontend
npm install
cp .env.example .env   # set REACT_APP_API_URL=http://localhost:5000/api
npm start
```

---

## Demo Flow for Video

1. Open Worker App → Register as Ravi Kumar, Mumbai, MUM-W14
2. See Premium Quote → ₹100/week → Activate Policy
3. Open Admin → /admin/simulate
4. Fire "Heavy Rain (Orange Alert)" for MUM-W14, Mumbai
5. Go back to Worker Dashboard → see claim appear with GREEN flag
6. Check Claims → ₹142 payout credited instantly
7. Show Admin Claims Queue → GREEN auto-approved, YELLOW/RED need review

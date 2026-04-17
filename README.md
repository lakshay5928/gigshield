# ⚡ GigShield 

## 📊 Pitch Deck
https://your-drive-link

## 🎥 Demo Video
https://your-video-link

### Parametric Income Protection for Grocery Delivery Workers
**Zepto / Blinkit | DEVTrails 2026**

---

## 🤖 What's New in Phase 3

| Feature | Details |
|---|---|
| **Gradient Boosted Regressor** | Real scikit-learn ML model for dynamic premium — trained on 5000 samples |
| **Isolation Forest** | Unsupervised anomaly detection for fraud — 80%+ detection rate |
| **OpenWeatherMap API** | Live weather data integration — real rain/temperature/AQI |
| **Auto Weather Trigger** | System polls real weather and auto-fires alerts |
| **Predictive Analytics** | Next-month disruption risk forecast by city |
| **Loss Ratio Dashboard** | Weekly trend chart with target zone |
| **Fraud Center** | 5-signal detection dashboard with top risk workers |

---

## 🚀 Run Locally
Follow the steps below to run the full system (Frontend + Backend + ML API):

### Prerequisites
- Node.js v18+
- Python 3.9+
- Supabase free account

### Step 1 — Clone the repository
git clone <repo-link>
cd gigshield

### Step 2 — Database

1. [supabase.com](https://supabase.com) → New Project
2. SQL Editor → paste `backend/db/schema.sql` → Run
3. Settings → Database → copy URI connection string

### Step 3 — Backend

```bash
cd backend
npm install
cp .env.example .env
# Fill in DATABASE_URL from Supabase
# Add OPENWEATHER_API_KEY (optional — mock works without it)
npm run dev
# ✅ http://localhost:5000/health
```

### Step 4 — Python ML API (NEW)

```bash
cd ml
pip install -r requirements.txt

# Generate training data
python generate_data.py

# Train models (takes ~30 seconds)
python train_models.py

# Start ML API server
python ml_api.py
# ✅ ML API at http://localhost:5001/health
```

### Step 5 — Frontend

```bash
cd frontend
npm install
npm start
# ✅ http://localhost:3000
```

### Step 6 — OpenWeatherMap (Optional but Recommended)

1. Go to [openweathermap.org](https://openweathermap.org/api)
2. Sign up free → My API Keys → copy key
3. Add to `backend/.env`:
```
OPENWEATHER_API_KEY=your_key_here
```
4. Test: `http://localhost:5000/api/weather/zone?city=mumbai&ward_id=MUM-W14`

---

## 🎮 Demo Flow

### Worker Flow
```
localhost:3000           → Register (3 steps)
Auto-redirect            → AI Premium Quote (ML model)
Activate                 → Policy live
localhost:3000/dashboard → Claims, payouts, trust level
```

### Admin Flow
```
localhost:3000/admin             → Overview + instant payout speed
localhost:3000/admin/simulate    → Fire 5 disruption triggers
localhost:3000/admin/claims      → Approve/Reject flagged claims
localhost:3000/admin/fraud       → 5-signal Isolation Forest center
localhost:3000/admin/analytics   → Predictive risk + loss ratio
```

### Overall Flow
```
1. Register: Ravi Kumar, 9876543210, Mumbai, MUM-W14, Zepto, ₹65/hr
2. Show premium quote — ML model output with R² score
3. Activate policy (₹XXX/week)
4. Admin → Check real weather: /api/weather/zone?city=mumbai&ward_id=MUM-W14
5. Admin → Simulate → Fire Heavy Rain for MUM-W14
6. Worker dashboard → Claim appears, GREEN, ₹XXX paid (show ms)
7. Admin Fraud Center → Show 5 signals, Isolation Forest detection
8. Admin Analytics → Predictive forecast, loss ratio chart
```

---

## 📁 Project Structure

```
gigshield/
├── ml/                               ← NEW: Python ML models
│   ├── generate_data.py              # Synthetic training data (5000 samples)
│   ├── train_models.py               # Train GBR + Isolation Forest
│   ├── ml_api.py                     # Flask API serving models
│   ├── requirements.txt
│   ├── premium_model/                # Saved GBR model + encoder
│   └── fraud_model/                  # Saved Isolation Forest + scaler
│
├── backend/
│   ├── app.js
│   ├── routes/
│   │   ├── workers.js, policies.js, claims.js
│   │   ├── payouts.js, alerts.js, fraud.js, analytics.js
│   │   └── weather.js                ← NEW: Real weather API
│   └── services/
│       ├── ml/mlService.js           ← NEW: Node→Python ML bridge
│       ├── weather/weatherService.js ← NEW: OpenWeatherMap integration
│       ├── fraud-detect/fraudDetector.js
│       ├── claim-engine/claimOrchestrator.js
│       ├── premium-calc/premiumEngine.js (fallback)
│       └── alert-monitor/
│
└── frontend/
    └── src/
        ├── worker-app/pages/         # Onboarding, Quote, Dashboard, Claims, Rain
        └── admin-dashboard/pages/    # Overview, Claims, Simulator, Fraud, Analytics
```

---

## 🤖 ML Models

### 1. Gradient Boosted Regressor — Premium Pricing

```
Training data: 5000 synthetic samples (IMD historical patterns)
Features:      city, month, seasonal_factor, trust_week,
               declared_hourly, claims_last_month, years_on_platform,
               flood_risk, heat_risk, ward_disruption_freq
Target:        weekly_premium (₹60-120)
Performance:   MAE ~₹3.50, R² ~0.91, CV R² ~0.89
Fallback:      Rule-based formula (if ML API not running)
```

### 2. Isolation Forest — Fraud Detection

```
Training data: 2200 samples (2000 normal + 200 fraud)
Features:      gps_accuracy, claim_velocity_7d, ward_claims_5min,
               hour_of_claim, days_since_register, payout_amount
Contamination: 8% expected fraud rate
Performance:   ~80% fraud detection, ~3% false positive rate
Fallback:      5-signal rule-based detector
```

---

## 🌤️ Weather Integration

```
GET /api/weather/zone?city=mumbai&ward_id=MUM-W14
→ Real temperature, rainfall mm/hr, alert level, confidence score

POST /api/weather/auto-check { city, ward_id }
→ Auto-triggers alert if live weather warrants it

GET /api/weather/all-zones
→ Weather status for all major zones
```

Without API key: Intelligent seasonal mock data based on IMD monthly patterns.
With API key: Live OpenWeatherMap data with ward-level approximation.

---

## ✅ Complete Checklist

| Requirement | Status |
|---|---|
| Advanced Fraud Detection (5 signals) | ✅ |
| Isolation Forest ML model | ✅ |
| GPS Spoofing Detection | ✅ |
| Coordinated Ring Detection | ✅ |
| Instant Payout Simulated (Razorpay) | ✅ |
| Payout processing time (ms) tracked | ✅ |
| Worker Dashboard — earnings protected | ✅ |
| Admin Dashboard — loss ratios | ✅ |
| Predictive analytics — next week risk | ✅ |
| **AI/ML — GBR Premium Model** | ✅ |
| **AI/ML — Isolation Forest Fraud** | ✅ |
| **Real Weather API (OpenWeatherMap)** | ✅ |
| **Auto weather-triggered alerts** | ✅ |
| **ML API (Flask)** | ✅ |

---

*Built for DEVTrails 2026 — Guidewire University Hackathon *

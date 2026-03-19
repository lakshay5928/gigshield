# ⚡ GigShield
### Parametric Income Protection for Grocery Delivery Workers
**Segment: Zepto / Blinkit Delivery Partners | India**

> *"Hum ghante ke hisaab se compensate karte hain, assumptions ke hisaab se nahi."*

---

## 💡 Inspiration

Zepto and Blinkit promise 10-minute delivery. But no one promises anything to the delivery worker when it rains.

A Zepto delivery partner in Mumbai earns roughly ₹500–700 on a normal day. When a sudden downpour hits, orders dry up instantly. They cannot work. No orders = no income — yet their expenses don't pause: EMI, rent, family.

They bear **100% of the risk** of disruptions they have **zero control over.**

GigShield is not another insurance company. It is a **parametric trigger and distribution layer** that connects licensed insurers to delivery workers — making income protection instant, automatic, and fair.

---

## 🏗️ What GigShield Actually Is

**GigShield is an InsurTech platform, not an insurer.**

| Role | Who Does It |
|---|---|
| Risk underwriting | Licensed insurer partner (e.g. Digit Insurance, Acko) |
| Regulatory compliance | Partner insurer's existing IRDAI license |
| Capital adequacy | Partner insurer's balance sheet |
| Disruption detection | GigShield — hybrid confidence scoring |
| Worker onboarding & KYC | GigShield — DigiLocker + NSDL PAN API |
| Claim trigger | GigShield — automated, parametric |
| Payout disbursement | Partner insurer's licensed claims infrastructure |

GigShield earns a **distribution fee per policy** — similar to PolicyBazaar/Turtlemint, purpose-built for gig workers with parametric triggers.

---

## 🚀 What It Does

| Feature | Description |
|---|---|
| 🤖 AI Dynamic Premium | ₹60–₹120/week based on 34-year IMD historical model |
| 🌧️ Hybrid Trigger System | IMD alert + AWS station + worker crowdsource confidence score |
| ⏱️ Granular Hourly Payout | Alert duration × hourly baseline × severity multiplier |
| ✅ Minimal Verification | GPS zone-check + ward claim density — nothing invasive |
| 🛡️ 3-Signal Fraud Detection | Device consistency + claim timing + GPS accuracy metadata |
| 💸 Instant Payout | Via partner insurer's licensed UPI infrastructure |
| 📱 Platform-Independent | Workers onboard directly — no Zepto/Blinkit cooperation needed |

---

## 👷 Worker Persona

**Platform:** Zepto / Blinkit — Grocery Delivery (10-minute delivery segment)

**Why this segment:**
- 10-minute SLA = workers in tight hyperlocal zones = ideal for ward-level risk mapping
- Grocery delivery halts completely in disruptions — highest income sensitivity of any delivery category
- Severely underserved: no existing product covers hourly gig income loss

| Worker Profile | Details |
|---|---|
| Daily Earning (Normal) | ₹400 – ₹700 |
| Working Hours | 6–10 hrs/day \| Peak: 8–11am, 6–9pm |
| Disruption Exposure | High — outdoor, frequent short trips, no shelter during deliveries |
| Insurance Literacy | Low — needs zero-friction vernacular onboarding |
| Premium Preference | Weekly model aligns with weekly pay cycle |

---

## 🎬 Persona-Based Scenarios

### Scenario 1 — Heavy Rain, Mumbai (Environmental Disruption)

**Ravi Kumar, 28. Zepto Partner, Andheri West, Mumbai. 4 years on platform.**

Normal Tuesday: Ravi earns ₹620. Peak hours 8–11am and 7–10pm. Verified weekly earning: ₹580 average.

**June 15th, 2:47pm:** BMC declares Orange Alert for Andheri-Borivali zone. GigShield's confidence score hits 0.71 (IMD alert 0.40 + AWS station 0.24 + 6 worker reports in zone 0.07).

**What happens:**
```
2:47pm  → Alert confirmed. GigShield identifies 43 active workers in Zone W-14
2:48pm  → GPS zone-check: Ravi's last ping = Zone W-14 ✅
2:48pm  → Ward density: 38 of 43 workers claiming = 88% ✅ Normal for Orange Alert
2:49pm  → Payout calculated:
           Verified hourly rate: ₹58 (Week 9+, 90% of ₹65 declared, under city median cap)
           Alert duration: 3.5 hours
           Severity multiplier: 0.7 (Orange Alert)
           Payout = ₹58 × 3.5 × 0.7 = ₹142
2:49pm  → Payout request sent to partner insurer API
2:51pm  → Ravi receives ₹142 UPI transfer + push notification
           "GigShield: ₹142 credited for Orange Alert — Andheri West, 2:47pm–6:17pm"
```

Ravi filed zero forms. Made zero calls. Waited 4 minutes.

---

### Scenario 2 — Curfew/Strike, Bangalore (Social Disruption)

**Priya Nair, 24. Blinkit Partner, Koramangala, Bangalore. 1.5 years on platform.**

Normal Friday: Priya earns ₹540. She is in her 3rd week — progressive trust at 70%, verified 1 screenshot.

**October 3rd, 6am:** State government declares bandh for Koramangala-Indiranagar zone. GigShield pulls official SDMA notification.

**What happens:**
```
6:00am  → SDMA bandh notification confirmed for Zone B-07
6:01am  → 67 workers in Zone B-07 identified as active-status
6:02am  → Bandh duration: 6am–6pm = 12 hours → capped at 8 hrs (per-event max)
6:02am  → Payout calculated:
           Verified hourly rate: ₹47 (Week 3, 70% of ₹67 declared)
           Duration: 8 hours (capped)
           Multiplier: 1.0 (government-declared restriction)
           Payout = ₹47 × 8 × 1.0 = ₹376
6:03am  → Priya receives ₹376 UPI transfer before she even woke up
```

Priya's phone buzzed at 6:03am. She went back to sleep knowing she was covered.

---

### Scenario 3 — Fraud Attempt Caught (Fraud Detection)

**Unknown actor. GPS spoofed into Zone W-14, Mumbai during same June 15th Orange Alert.**

**What GigShield detects:**
```
Anomaly 1: Device ID "DV-8821" seen across 4 different worker accounts
           → Hard block. All 4 accounts flagged RED.

Anomaly 2: 11 new claims filed within 3 minutes of alert
           → Timing uniformity flag. Expected: claims spread over 20–40 min window.
           → All 11 moved to YELLOW for spot-check.

Anomaly 3: GPS accuracy for 3 claims = ±2m (suspiciously perfect)
           → Real outdoor GPS in rain = ±15–25m
           → All 3 moved to YELLOW.

Genuine workers like Ravi: GPS accuracy ±18m, normal timing → GREEN → instant payout
Fraud attempts: escalated to TPA → most abandon claim → pool protected
```

**Result:** ₹142 reached Ravi in 4 minutes. Fraud attempts blocked or abandoned. Pool intact.

---

## 💰 Weekly Premium Model — Honest Economics

### Premium Formula

```
Weekly Premium = Base Rate × Zone Risk Multiplier × Seasonal Factor
```

| Zone | Weekly Premium | Annual Premium | Cities |
|---|---|---|---|
| Low Risk | ₹60 – ₹70 | ~₹3,380 | Pune, Chandigarh |
| Medium Risk | ₹80 – ₹95 | ~₹4,550 | Bangalore, Delhi NCR |
| High Risk | ₹100 – ₹120 | ~₹5,720 | Mumbai, Chennai |

### Unit Economics (Mumbai — Worst Case)

```
Annual premium collected:        ₹100/week × 52 = ₹5,200/worker
Heavy rain alert days/year:      ~35 days (June–Sept, IMD 34-yr avg)
Avg alert duration per day:      2.5 hrs
Severity multiplier average:     0.6
Worker hourly baseline:          ₹60

Expected annual payout:          35 × 2.5 × 0.6 × ₹60 = ₹3,150/worker
Gross margin before ops:         ₹2,050 (~39%)
Reinsurance cost:                ~15–18% of gross premium = ~₹850
Net margin:                      ~₹1,200/worker
Loss ratio:                      ~60% — within industry standard (55–70%)
```

### Reinsurance Treaty Structure

```
Per-Event Limit:      ₹50L per zone per alert event
Aggregate Stop-Loss:  Triggers when total claims > 150% of annual premium collected
GigShield Retention:  First ₹10L per event
Premium to reinsurer: 15–18% of gross premium collected
```

### Adverse Selection Mitigation
- **Bulk fleet onboarding:** Enroll entire city clusters via fleet operators — both high and low risk workers together
- **Waiting period:** 2 weeks before first claim eligibility
- **Seasonal cap:** Max 20 claim-days per worker per monsoon season

### Cold Start — Honest Acknowledgment
- **Initial pricing:** Built on 34-year IMD historical archive — not 6-month pilot guesses
- **Safety buffer:** 40% added to all premiums until pilot validates predictions
- **Pilot role (6 months):** Validates model, does not build it
- **Reinsurer requirement:** Historical loss data required before treaty anyway

---

## ⚡ Parametric Trigger System

### Why Parametric (Not Indemnity)

Traditional insurance requires workers to prove they lost income — forms, documentation, 30-day waiting. Gig workers with low insurance literacy won't use it. Parametric triggers automatically on a measurable external event. No filing required.

### Trigger Source — Official Alerts + Crowdsource Confidence

We do not rely on raw weather API data alone. Raw data creates disputes. We use a **weighted confidence score**:

```
Trigger fires when Confidence Score ≥ 0.65

Score =
  IMD District Alert active       × 0.40 weight
  + Nearest AWS station reading   × 0.35 weight
  + Worker crowdsource reports    × 0.25 weight
  (5+ workers in ward confirm rain = confidence boost)
```

| Source | Alert Type | Coverage |
|---|---|---|
| IMD | Orange / Red weather alerts | All India |
| BMC Disaster Cell | Ward-level flood alerts | Mumbai (26 AWS stations) |
| SDMA | City-level disruption alerts | State capitals |
| Government notifications | Curfew, bandh, election restrictions | City-specific |

**Phase 1 Scope:** Mumbai and Delhi only — where AWS coverage is sufficient. Other cities added as networks mature.

### Automated Claim Flow

```
Confidence Score ≥ 0.65 for Zone / Ward
            ↓
GigShield identifies enrolled workers in affected zone
            ↓
2-layer verification (GPS zone-check + ward density)
            ↓
Alert window duration calculated (alert issued → alert lifted)
            ↓
Payout = Verified Hourly Rate × Alert Hours × Severity Multiplier
            ↓
Payout request → partner insurer's claims API
            ↓
Worker receives UPI transfer + push notification
```

### IMD Severity Multipliers

| Alert Level | IMD Definition | Multiplier |
|---|---|---|
| Yellow Alert | Heavy rain possible | 0.4 |
| Orange Alert | Heavy to very heavy rain | 0.7 |
| Red Alert | Extremely heavy / flooding | 1.0 |
| Bandh / Curfew | Government-declared restriction | 1.0 |
| IMD Heat Wave | > 45°C for 2+ days | 0.6 |
| Severe Pollution | AQI > 400 sustained | 0.4 |

### Payout Window Rules
- **Minimum:** 2 hours per event
- **Maximum per event:** 8 hours
- **Maximum per week:** 20 hours

---

## 💸 Payout Calculation — Progressive Trust Model

Self-declared earnings create moral hazard. We solve with progressive verification:

```
Weeks 1–4:   Pay at 50% of declared | Cap: city_median × 0.9
Weeks 5–8:   Pay at 70% of declared | Cap: city_median × 1.0
             (after 1 Zepto payout screenshot verified)
Week 9+:     Pay at 90% of declared | Cap: city_median × 1.2
             (after 3 screenshots + pattern established)

Hard floor:  Never below city_median × 0.5
Hard ceiling: Never above city_median × 1.5
```

**City median source:** NSSO gig worker earnings data + Zepto/Blinkit publicly stated partner earnings — no platform cooperation needed.

---

## ✅ Verification — Minimal and Defensible

### 2-Layer Check

**Layer 1: GPS zone-check with buffer**
```
Core zone (inside boundary):      Auto-approve
Buffer zone (0–50m outside):      Auto-approve — GPS ±15m error absorbed
Grey zone (50–200m outside):      YELLOW flag — worker can self-certify
Outside zone (200m+):             Claim denied — appeal within 24hrs
```

**Layer 2: Ward-level claim density**
- Large event: 60–80% of ward workers claiming → auto-approve all
- Anomaly: 3 claims when 500 workers enrolled → YELLOW flag

### What We Do NOT Collect

| Data | Why We Avoid |
|---|---|
| Continuous GPS tracking | Disproportionate — DPDP Act 2023 |
| Battery / accelerometer | Elevated permissions, legally sensitive |
| Network quality | Jio 5G works fine in rain — not a reliable signal |
| Photos / biometrics | AI-generated photos trivially bypass checks |

### Dispute Resolution
```
Worker appeals → submits text note explaining location
→ Partner insurer TPA reviews within 48 hours
→ Decision communicated with reason
→ Further escalation: IRDAI Bima Bharosa portal
```

---

## 🛡️ Adversarial Defense & Anti-Spoofing Strategy

### The Threat

A coordinated syndicate using GPS-spoofing apps can fake location inside a declared alert zone, trigger mass false claims, and drain the liquidity pool — organized via Telegram groups, while sitting at home.

**Simple GPS verification is obsolete. GigShield uses behavioral fingerprinting.**

### 3 Lightweight Detection Signals (No Invasive Permissions)

**Signal 1: Device ID consistency**
- Each device maps to exactly one worker account
- Same device across 3+ accounts = hard block
- Available from basic app analytics — zero extra permissions

**Signal 2: Claim timing uniformity**
- Genuine workers claim at varied times within alert window
- Fraud ring pattern: 50+ claims in 4-minute window = statistical anomaly

**Signal 3: GPS accuracy metadata**
- Real outdoor GPS in rain: ±15–30m, naturally fluctuates
- Spoofed GPS: ±2–3m, suspiciously perfect and static
- This metadata comes free with any GPS reading

### Structural Barriers

- **NSDL PAN deduplication:** Prevents same identity enrolling as multiple workers
- **Per-worker seasonal cap:** Max 20 claim-days limits maximum fraud extraction per identity
- **Low per-claim value:** ₹150–400 avg payout makes large-scale fraud effort-intensive

### Soft-Flag System

| Flag | Trigger | Action |
|---|---|---|
| 🟢 GREEN | All signals clean | Auto-approve, instant payout |
| 🟡 YELLOW | One anomaly signal | 24-hour hold, TPA spot-check |
| 🔴 RED | 2+ anomaly signals | Full TPA review before payout |

---

## 📱 Platform Independence — No Zepto/Blinkit Needed

### Worker Onboarding (Fully Self-Serve)

```
1. Download GigShield PWA (no app store needed)
2. Mobile number + OTP verification
3. Upload Zepto/Blinkit Partner ID via DigiLocker
4. PAN verification via NSDL API (₹2/query — no UIDAI license needed)
5. Select primary work zone (ward level)
6. Weekly earnings declaration (progressive trust applies)
7. Choose premium tier → pay via UPI
8. Policy active from next Monday
```

### Why No Platform Data Is Needed

| What we need | How we get it |
|---|---|
| Worker is a real delivery partner | DigiLocker partner ID document |
| Identity deduplication | NSDL PAN verification |
| Disruption occurred | IMD/BMC/SDMA official alert |
| Worker was in zone | Single GPS ping at alert time |
| Worker's earning rate | Self-declared + progressive verification |

---

## 📱 Web vs Mobile — Platform Choice Justification

**GigShield is built as a Progressive Web App (PWA), not a native Android/iOS app.**

**Why PWA over native:**

| Factor | PWA Advantage |
|---|---|
| Zero install friction | Workers open a URL — no app store, no storage needed on low-end phones |
| Low-end device support | PWA works on ₹4,000 Android phones with 1GB RAM — native apps often don't |
| Offline capability | PWA caches policy details and claim status for poor connectivity areas |
| Development speed | One codebase for all devices — critical in 6-week hackathon |
| Update instantly | No app store review delays when fixing bugs in later phases |

**Why not native:**
- Zepto/Blinkit workers already use browser-based partner portals — no new behavior required
- Native apps need Play Store approval which takes 3–7 days — incompatible with hackathon timeline
- Sensor access (camera, GPS) is fully available in PWA via browser APIs

---

## 🤖 AI / ML Usage

### 1. Dynamic Premium Calculation
- **Training data:** 34-year IMD historical alert archive, downscaled to ward level
- **Model:** Gradient Boosted Regressor
- **Features:** Alert frequency by zone, seasonal index, year-over-year variance
- **Output:** Weekly premium per zone
- **Buffer:** 40% safety margin until pilot validates

### 2. Progressive Earning Baseline
- **Source:** Self-declared earnings + Zepto payout screenshot spot-check
- **Model:** Rolling average with day-of-week and seasonal adjustment
- **Cap:** Hard ceiling at city_median × 1.5

### 3. Claim Anomaly Detection
- **Model:** Isolation Forest (unsupervised)
- **Features:** Ward density, timing distribution, device consistency, GPS accuracy
- **Output:** GREEN / YELLOW / RED per claim event

---

## ⚖️ Regulatory & Legal

### IRDAI — Partner Model (No Own License Needed)

| Requirement | How Addressed |
|---|---|
| Insurance underwriting license | Partner insurer (Digit / Acko) — already licensed |
| ₹100Cr+ capital adequacy | Partner insurer's balance sheet |
| TPA for claims | Partner insurer's existing TPA |
| GigShield registration | Corporate Agent license (~₹2L — not ₹100Cr) |

**IRDAI Regulatory Sandbox (2019):** Allows parametric InsurTech pilots for 6–12 months without full compliance. We will apply before going live.

### KYC — No UIDAI License Needed
- **DigiLocker API:** Partner ID / driving license sharing — open API
- **NSDL PAN verification:** Deduplication — public API, ₹2/query

### Data Privacy — DPDP Act 2023
- Collect only: mobile number, partner ID, work zone, GPS ping per claim event
- Explicit vernacular consent screen before any collection
- GPS data deleted within 48 hours of claim resolution
- No data shared with Zepto, Blinkit, or any third party
- Full right to deletion at any time

### RBI / Payment
- All payouts via partner insurer's licensed disbursement infrastructure
- GigShield holds no pre-funded escrow — eliminates RBI pre-paid instrument compliance entirely

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React.js + Tailwind CSS (PWA) | Worker app + Admin dashboard |
| Backend | Node.js + Express | API, claim engine, alert monitor |
| Database | PostgreSQL | Workers, policies, claims, audit logs |
| AI / ML | Python — scikit-learn | Premium model, anomaly detection |
| Alert Source | IMD API + BMC open data + crowdsource | Hybrid confidence scoring |
| KYC | DigiLocker API + NSDL PAN API | Worker identity verification |
| Payment (mock) | Razorpay Test Mode | UPI payout simulation |
| Maps | Google Maps API | Ward boundaries, GPS zone check |
| Hosting | Vercel (frontend) + Railway (backend) | Fast deploy, free tier |

---

## 🗓️ Development Plan

### Phase 1 — Ideation & Foundation (March 4–20) ✅
- [x] Problem research and persona definition
- [x] Core architecture design
- [x] Premium model logic
- [x] Fraud detection strategy
- [x] README documentation
- [ ] 2-minute video

### Phase 2 — Automation & Protection (March 21–April 4)

**Week 3 (March 21–27):**
- Worker registration flow (PWA onboarding + DigiLocker KYC)
- Premium calculator UI (zone selector → weekly quote)
- Policy creation and management (active / expired / paused states)
- Database schema and backend API setup

**Week 4 (March 28–April 4):**
- Mock alert trigger system (3–5 disruption types)
- Automated claim engine (confidence score → verification → payout request)
- Mock partner insurer API integration
- Basic claim status dashboard for workers
- 2-minute demo video

### Phase 3 — Scale & Optimise (April 5–17)

**Week 5 (April 5–11):**
- Isolation Forest fraud detection model — live on all claims
- Admin dashboard: loss ratios, fraud flags, zone anomaly map
- Instant UPI payout simulation via Razorpay test mode
- Worker dashboard: earnings protected, coverage status, claim history

**Week 6 (April 12–17):**
- Predictive analytics: next-week disruption risk forecast
- Full end-to-end demo: simulate rainstorm → auto-trigger → payout in < 5 min
- Performance optimization and bug fixes
- 5-minute demo video + Final pitch deck

---

## 📁 Repository Structure

```
gigshield/
├── frontend/
│   ├── worker-app/           # PWA: onboarding, policy, claim status, rain report
│   └── admin-dashboard/      # Claims, fraud flags, zone confidence map
├── backend/
│   ├── routes/               # workers, policies, claims, payouts, alerts
│   ├── services/
│   │   ├── alert-monitor/    # IMD + BMC + crowdsource confidence scoring
│   │   ├── premium-calc/     # GBR premium model integration
│   │   ├── claim-engine/     # Parametric trigger + 2-layer verification
│   │   └── fraud-detect/     # Isolation Forest anomaly detection
│   └── mock/
│       ├── insurer-api/      # Mock Digit/Acko partner insurer
│       └── payment-api/      # Mock UPI disbursement
├── ml/
│   ├── premium_model/        # GBR on 34-year IMD historical data
│   ├── anomaly_detect/       # Isolation Forest fraud detection
│   └── earning_baseline/     # Progressive trust earning model
├── data/
│   └── imd_historical/       # 34-year IMD district alert archive
└── README.md
```

---

## 🧱 Challenges & Honest Status

| Challenge | Status | Approach |
|---|---|---|
| IRDAI regulation | Solved | Partner model — Corporate Agent license only |
| Platform cooperation | Not needed | Platform-independent design |
| IMD data coarseness | Solved | Hybrid confidence score (IMD + AWS + crowdsource) |
| Actuarial cold start | Solved | 34-yr IMD historical pricing; pilot validates |
| Self-declared earnings | Solved | Progressive trust + hard city median cap |
| GPS spoofing | Mitigated | Device ID + timing + GPS accuracy metadata |
| Organized fraud rings | Mitigated | NSDL dedup + seasonal cap + TPA review |
| GPS boundary disputes | Solved | 50m buffer + 48hr appeal mechanism |
| Aadhaar/UIDAI license | Solved | DigiLocker + NSDL PAN — no CIDR needed |
| UPI/RBI compliance | Solved | Payouts via partner insurer infrastructure |
| DPDP Act 2023 | Solved | Minimal data + explicit consent |

---

## ✅ What Works Well

- **Genuine need** — gig workers have real income risk with zero protection today
- **Hourly granularity** — no existing product compensates by the hour
- **Hybrid trigger** — defensible, dispute-resistant, ground-truth aware
- **Platform-independent** — removes biggest go-to-market blocker
- **InsurTech partner model** — regulatory problem solved without own license
- **Progressive earnings trust** — self-declaration bias controlled systematically
- **Honest unit economics** — loss ratio ~60%, viable with standard reinsurance

---

## 🔭 Real-World Roadmap (Post-Hackathon)

1. **Month 1–3:** Partner with Digit Insurance / Acko for distribution agreement
2. **Month 4–6:** Apply for IRDAI Regulatory Sandbox
3. **Month 6–12:** 500-worker pilot, Mumbai + Delhi, conservative pricing, data collection
4. **Year 2:** Adjust pricing on real loss ratios, expand to 3 cities
5. **Year 3:** Open API for platforms if they choose to integrate

---

*Built for DEVTrails 2026 — Guidewire University Hackathon*

*GigShield does not underwrite insurance directly. All products are underwritten by licensed IRDAI-registered insurer partners. GigShield operates as a technology and distribution platform.*

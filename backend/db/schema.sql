CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS workers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mobile VARCHAR(10) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  pan VARCHAR(10) UNIQUE,
  platform VARCHAR(20) DEFAULT 'zepto',
  city VARCHAR(50) NOT NULL,
  ward_id VARCHAR(20) NOT NULL,
  declared_hourly_rate NUMERIC(8,2) DEFAULT 60,
  verified_screenshots INT DEFAULT 0,
  trust_week INT DEFAULT 1,
  digilocker_verified BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS policies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id UUID REFERENCES workers(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'active',
  weekly_premium NUMERIC(8,2) NOT NULL,
  zone_risk_multiplier NUMERIC(4,2) DEFAULT 1.0,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source VARCHAR(30) DEFAULT 'imd',
  ward_id VARCHAR(20) NOT NULL,
  city VARCHAR(50) NOT NULL,
  alert_level VARCHAR(20) NOT NULL,
  severity_multiplier NUMERIC(4,2) NOT NULL,
  confidence_score NUMERIC(4,2) NOT NULL,
  started_at TIMESTAMP NOT NULL,
  ended_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id UUID REFERENCES workers(id) ON DELETE CASCADE,
  policy_id UUID REFERENCES policies(id),
  alert_id UUID REFERENCES alerts(id),
  status VARCHAR(20) DEFAULT 'pending',
  flag VARCHAR(10) DEFAULT 'GREEN',
  disruption_hours NUMERIC(5,2),
  hourly_rate_used NUMERIC(8,2),
  severity_multiplier NUMERIC(4,2),
  payout_amount NUMERIC(10,2),
  fraud_signals JSONB DEFAULT '[]',
  fraud_score INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  claim_id UUID REFERENCES claims(id),
  worker_id UUID REFERENCES workers(id),
  amount NUMERIC(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  upi_ref VARCHAR(100),
  paid_at TIMESTAMP,
  processing_ms INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rain_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id UUID REFERENCES workers(id),
  ward_id VARCHAR(20) NOT NULL,
  city VARCHAR(50) NOT NULL,
  reported_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fraud_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  claim_id UUID REFERENCES claims(id),
  worker_id UUID REFERENCES workers(id),
  signal_type VARCHAR(50),
  signal_detail TEXT,
  score INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS city_config (
  city VARCHAR(50) PRIMARY KEY,
  median_hourly NUMERIC(8,2),
  zone_risk VARCHAR(20),
  base_premium NUMERIC(8,2),
  disruption_days_per_year INT DEFAULT 20
);

INSERT INTO city_config VALUES
  ('mumbai',    65, 'high',   100, 35),
  ('delhi',     60, 'medium',  85, 25),
  ('bangalore', 58, 'medium',  80, 20),
  ('chennai',   62, 'high',    95, 30),
  ('pune',      55, 'low',     65, 15)
ON CONFLICT DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_workers_mobile  ON workers(mobile);
CREATE INDEX IF NOT EXISTS idx_claims_worker   ON claims(worker_id);
CREATE INDEX IF NOT EXISTS idx_claims_alert    ON claims(alert_id);
CREATE INDEX IF NOT EXISTS idx_payouts_worker  ON payouts(worker_id);
CREATE INDEX IF NOT EXISTS idx_alerts_ward     ON alerts(ward_id, city);
CREATE INDEX IF NOT EXISTS idx_rain_ward       ON rain_reports(ward_id, reported_at);
CREATE INDEX IF NOT EXISTS idx_fraud_worker    ON fraud_logs(worker_id);

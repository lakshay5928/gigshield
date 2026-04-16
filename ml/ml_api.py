"""
GigShield ML API — Flask Server
Serves trained ML models via REST endpoints

Run: python ml_api.py
Port: 5001
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import json
import os

app = Flask(__name__)
CORS(app)

# ── Load Models ───────────────────────────────────────────────
BASE = os.path.dirname(__file__)

try:
    gbr_model    = joblib.load(f'{BASE}/premium_model/gbr_model.pkl')
    city_encoder = joblib.load(f'{BASE}/premium_model/city_encoder.pkl')
    gbr_features = joblib.load(f'{BASE}/premium_model/features.pkl')
    with open(f'{BASE}/premium_model/model_meta.json') as f:
        gbr_meta = json.load(f)
    print("✅ Premium model loaded")
except Exception as e:
    print(f"⚠️  Premium model not found: {e}")
    gbr_model = None

try:
    iso_forest    = joblib.load(f'{BASE}/fraud_model/iso_forest.pkl')
    fraud_scaler  = joblib.load(f'{BASE}/fraud_model/scaler.pkl')
    fraud_features = joblib.load(f'{BASE}/fraud_model/features.pkl')
    with open(f'{BASE}/fraud_model/model_meta.json') as f:
        fraud_meta = json.load(f)
    print("✅ Fraud model loaded")
except Exception as e:
    print(f"⚠️  Fraud model not found: {e}")
    iso_forest = None

SEASONAL = [0.7, 0.7, 0.8, 0.9, 0.9, 1.3, 1.5, 1.5, 1.3, 1.0, 0.8, 0.7]
CITY_CONFIG = {
    'mumbai':    {'median_hourly': 65, 'base_premium': 100, 'flood_risk': 0.8, 'heat_risk': 0.2, 'disruption_freq': 0.096},
    'delhi':     {'median_hourly': 60, 'base_premium': 85,  'flood_risk': 0.4, 'heat_risk': 0.7, 'disruption_freq': 0.068},
    'bangalore': {'median_hourly': 58, 'base_premium': 80,  'flood_risk': 0.3, 'heat_risk': 0.3, 'disruption_freq': 0.055},
    'chennai':   {'median_hourly': 62, 'base_premium': 95,  'flood_risk': 0.7, 'heat_risk': 0.5, 'disruption_freq': 0.082},
    'pune':      {'median_hourly': 55, 'base_premium': 65,  'flood_risk': 0.2, 'heat_risk': 0.2, 'disruption_freq': 0.041},
}

from datetime import datetime

# ── Health Check ──────────────────────────────────────────────
@app.route('/health')
def health():
    return jsonify({
        'status': 'ok',
        'service': 'GigShield ML API',
        'models': {
            'premium_gbr': gbr_model is not None,
            'fraud_isolation_forest': iso_forest is not None,
        }
    })

# ── Premium Prediction ────────────────────────────────────────
@app.route('/predict/premium', methods=['POST'])
def predict_premium():
    if gbr_model is None:
        return jsonify({'error': 'Model not loaded — run train_models.py first'}), 503

    data = request.json
    city = data.get('city', 'mumbai').lower()
    cfg  = CITY_CONFIG.get(city, CITY_CONFIG['mumbai'])

    try:
        city_enc = city_encoder.transform([city])[0]
    except:
        city_enc = 0

    month = datetime.now().month - 1
    seasonal = SEASONAL[month]
    trust_week = int(data.get('trust_week', 1))

    features = np.array([[
        city_enc,
        month,
        seasonal,
        trust_week,
        float(data.get('declared_hourly_rate', cfg['median_hourly'])),
        int(data.get('claims_last_month', 0)),
        float(data.get('years_on_platform', 1.0)),
        cfg['flood_risk'],
        cfg['heat_risk'],
        cfg['disruption_freq'],
        cfg['median_hourly'],
        cfg['base_premium'],
    ]])

    raw_premium = float(gbr_model.predict(features)[0])
    premium = round(max(60, min(120, raw_premium)), 2)

    # Confidence interval (±1 MAE)
    mae = gbr_meta.get('mae', 3.5)

    return jsonify({
        'weekly_premium': premium,
        'premium_range': {
            'low': max(60, round(premium - mae, 2)),
            'high': min(120, round(premium + mae, 2))
        },
        'model_confidence': f"R²={gbr_meta.get('r2', 0):.3f}",
        'inputs': {
            'city': city,
            'seasonal_factor': seasonal,
            'trust_week': trust_week,
            'zone_risk': 'high' if cfg['flood_risk'] > 0.6 else 'medium' if cfg['flood_risk'] > 0.3 else 'low',
            'city_median_hourly': cfg['median_hourly'],
        },
        'model': 'GradientBoostingRegressor',
        'training_samples': gbr_meta.get('training_samples', 5000),
    })

# ── Fraud Detection ───────────────────────────────────────────
@app.route('/predict/fraud', methods=['POST'])
def predict_fraud():
    if iso_forest is None:
        return jsonify({'error': 'Model not loaded — run train_models.py first'}), 503

    data = request.json

    features = np.array([[
        float(data.get('gps_accuracy', 22)),
        int(data.get('claim_velocity_7d', 0)),
        int(data.get('ward_claims_5min', 5)),
        int(data.get('hour_of_claim', datetime.now().hour)),
        float(data.get('days_since_register', 90)),
        float(data.get('payout_amount', 150)),
    ]])

    scaled = fraud_scaler.transform(features)
    prediction = iso_forest.predict(scaled)[0]   # 1=normal, -1=anomaly
    score = iso_forest.score_samples(scaled)[0]  # more negative = more anomalous

    # Convert to 0-100 risk score
    risk_score = round(max(0, min(100, (-score + 0.3) * 150)), 1)

    flag = 'GREEN'
    if risk_score >= 60:
        flag = 'RED'
    elif risk_score >= 30:
        flag = 'YELLOW'

    return jsonify({
        'flag': flag,
        'risk_score': risk_score,
        'is_anomaly': prediction == -1,
        'isolation_score': round(float(score), 4),
        'explanation': (
            'Claim pattern consistent with genuine disruption' if flag == 'GREEN'
            else 'Minor anomaly detected — queued for review' if flag == 'YELLOW'
            else 'High anomaly score — multiple fraud signals detected'
        ),
        'model': 'IsolationForest',
        'contamination': fraud_meta.get('contamination', 0.08),
    })

# ── Model Info ────────────────────────────────────────────────
@app.route('/models/info')
def model_info():
    return jsonify({
        'premium_model': gbr_meta if gbr_model else None,
        'fraud_model': fraud_meta if iso_forest else None,
    })

if __name__ == '__main__':
    print("\n🤖 GigShield ML API starting on port 5001...")
    app.run(host='0.0.0.0', port=5001, debug=False)

"""
GigShield — ML Model Training
1. Gradient Boosted Regressor — Dynamic Premium Calculation
2. Isolation Forest — Anomaly/Fraud Detection

Run: python train_models.py
"""
import pandas as pd
import numpy as np
import joblib
import json
from sklearn.ensemble import GradientBoostingRegressor, IsolationForest
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import mean_absolute_error, r2_score
import warnings
warnings.filterwarnings('ignore')

print("=" * 60)
print("GigShield ML Model Training")
print("=" * 60)

# ── Load Data ─────────────────────────────────────────────────
df = pd.read_csv('data/training_data.csv')
print(f"\n✅ Loaded {len(df)} training samples")

# ── 1. GRADIENT BOOSTED REGRESSOR — Premium Model ─────────────
print("\n[1/2] Training Premium Model (Gradient Boosted Regressor)...")

le = LabelEncoder()
df['city_enc'] = le.fit_transform(df['city'])

FEATURES = [
    'city_enc', 'month', 'seasonal_factor', 'trust_week',
    'declared_hourly_rate', 'claims_last_month', 'years_on_platform',
    'flood_risk_score', 'heat_risk_score', 'ward_disruption_freq',
    'city_median_hourly', 'city_base_premium'
]

X = df[FEATURES]
y = df['weekly_premium']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

gbr = GradientBoostingRegressor(
    n_estimators=200,
    learning_rate=0.08,
    max_depth=4,
    min_samples_leaf=10,
    subsample=0.8,
    random_state=42
)
gbr.fit(X_train, y_train)

y_pred = gbr.predict(X_test)
mae = mean_absolute_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)
cv_scores = cross_val_score(gbr, X, y, cv=5, scoring='r2')

print(f"  MAE:  ₹{mae:.2f}")
print(f"  R²:   {r2:.4f}")
print(f"  CV R²: {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")

# Feature importance
importances = dict(zip(FEATURES, gbr.feature_importances_))
top_features = sorted(importances.items(), key=lambda x: x[1], reverse=True)[:5]
print(f"  Top features: {[f[0] for f in top_features]}")

# Save model + encoder
joblib.dump(gbr, 'premium_model/gbr_model.pkl')
joblib.dump(le, 'premium_model/city_encoder.pkl')
joblib.dump(FEATURES, 'premium_model/features.pkl')

# Save model metadata
meta = {
    'model_type': 'GradientBoostingRegressor',
    'n_estimators': 200,
    'features': FEATURES,
    'mae': round(mae, 2),
    'r2': round(r2, 4),
    'cv_r2_mean': round(cv_scores.mean(), 4),
    'cv_r2_std': round(cv_scores.std(), 4),
    'training_samples': len(df),
    'cities': list(le.classes_),
    'premium_range': {'min': 60, 'max': 120},
}
with open('premium_model/model_meta.json', 'w') as f:
    json.dump(meta, f, indent=2)

print(f"  ✅ Model saved → premium_model/gbr_model.pkl")

# ── 2. ISOLATION FOREST — Fraud Detection ─────────────────────
print("\n[2/2] Training Fraud Detection Model (Isolation Forest)...")

# Generate fraud detection training data
np.random.seed(42)
n_normal = 2000
n_fraud  = 200

# Normal claim behavior
normal = pd.DataFrame({
    'gps_accuracy':        np.random.normal(22, 7, n_normal),          # ±15-30m real GPS
    'claim_velocity_7d':   np.random.poisson(1.5, n_normal),           # 0-3 claims/week
    'ward_claims_5min':    np.random.poisson(5, n_normal),             # spread out
    'hour_of_claim':       np.random.normal(14, 4, n_normal),          # during work hours
    'days_since_register': np.random.exponential(90, n_normal),        # established workers
    'payout_amount':       np.random.normal(180, 60, n_normal),        # reasonable
    'label': 0
})

# Fraudulent claim behavior
fraud = pd.DataFrame({
    'gps_accuracy':        np.random.uniform(0.5, 4, n_fraud),        # suspiciously perfect
    'claim_velocity_7d':   np.random.randint(6, 15, n_fraud),         # too many claims
    'ward_claims_5min':    np.random.randint(40, 100, n_fraud),       # coordinated spike
    'hour_of_claim':       np.random.choice([0,1,2,3], n_fraud),      # odd hours
    'days_since_register': np.random.uniform(1, 10, n_fraud),         # brand new accounts
    'payout_amount':       np.random.uniform(400, 1000, n_fraud),     # inflated
    'label': 1
})

fraud_df = pd.concat([normal, fraud], ignore_index=True)
FRAUD_FEATURES = ['gps_accuracy','claim_velocity_7d','ward_claims_5min','hour_of_claim','days_since_register','payout_amount']

scaler = StandardScaler()
X_fraud = scaler.fit_transform(fraud_df[FRAUD_FEATURES])

iso_forest = IsolationForest(
    n_estimators=150,
    contamination=0.08,   # expect ~8% fraud rate
    random_state=42,
    max_samples='auto'
)
iso_forest.fit(X_fraud)

# Validate
preds = iso_forest.predict(X_fraud)
fraud_detected = sum(1 for p, l in zip(preds, fraud_df['label']) if p == -1 and l == 1)
false_positives = sum(1 for p, l in zip(preds, fraud_df['label']) if p == -1 and l == 0)
print(f"  Fraud detected: {fraud_detected}/{n_fraud} ({fraud_detected/n_fraud*100:.0f}%)")
print(f"  False positives: {false_positives}/{n_normal} ({false_positives/n_normal*100:.1f}%)")

joblib.dump(iso_forest, 'fraud_model/iso_forest.pkl')
joblib.dump(scaler, 'fraud_model/scaler.pkl')
joblib.dump(FRAUD_FEATURES, 'fraud_model/features.pkl')

fraud_meta = {
    'model_type': 'IsolationForest',
    'n_estimators': 150,
    'contamination': 0.08,
    'features': FRAUD_FEATURES,
    'fraud_detection_rate': round(fraud_detected/n_fraud, 3),
    'false_positive_rate': round(false_positives/n_normal, 3),
    'training_samples': len(fraud_df),
}
with open('fraud_model/model_meta.json', 'w') as f:
    json.dump(fraud_meta, f, indent=2)

print(f"  ✅ Model saved → fraud_model/iso_forest.pkl")

print("\n" + "=" * 60)
print("✅ All models trained successfully!")
print(f"  Premium GBR: MAE=₹{mae:.2f}, R²={r2:.4f}")
print(f"  Fraud IF: {fraud_detected/n_fraud*100:.0f}% detection rate")
print("=" * 60)

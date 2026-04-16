"""
GigShield — Training Data Generator
Generates synthetic but realistic training data based on:
- IMD historical disruption patterns (1990-2024)
- NSSO gig worker earnings data
- City-wise flood/heat frequency data
"""
import numpy as np
import pandas as pd
import json

np.random.seed(42)
N = 5000  # training samples

# City configs based on real IMD historical data
CITY_CONFIG = {
    'mumbai':    {'base_premium': 100, 'disruption_days': 35, 'median_hourly': 65, 'flood_risk': 0.8, 'heat_risk': 0.2},
    'delhi':     {'base_premium': 85,  'disruption_days': 25, 'median_hourly': 60, 'flood_risk': 0.4, 'heat_risk': 0.7},
    'bangalore': {'base_premium': 80,  'disruption_days': 20, 'median_hourly': 58, 'flood_risk': 0.3, 'heat_risk': 0.3},
    'chennai':   {'base_premium': 95,  'disruption_days': 30, 'median_hourly': 62, 'flood_risk': 0.7, 'heat_risk': 0.5},
    'pune':      {'base_premium': 65,  'disruption_days': 15, 'median_hourly': 55, 'flood_risk': 0.2, 'heat_risk': 0.2},
}

# IMD seasonal risk by month (actual historical pattern)
SEASONAL = [0.7, 0.7, 0.8, 0.9, 0.9, 1.3, 1.5, 1.5, 1.3, 1.0, 0.8, 0.7]

cities = list(CITY_CONFIG.keys())
data = []

for i in range(N):
    city = np.random.choice(cities)
    cfg = CITY_CONFIG[city]
    month = np.random.randint(0, 12)
    seasonal = SEASONAL[month]

    # Worker features
    trust_week = np.random.choice([1, 5, 9], p=[0.5, 0.3, 0.2])
    declared_hourly = np.random.normal(cfg['median_hourly'], 12)
    declared_hourly = max(30, min(200, declared_hourly))
    claims_last_month = np.random.poisson(seasonal * 2)
    years_on_platform = np.random.uniform(0.1, 5)

    # Zone features
    flood_risk = cfg['flood_risk'] + np.random.normal(0, 0.1)
    flood_risk = max(0, min(1, flood_risk))
    heat_risk = cfg['heat_risk'] + np.random.normal(0, 0.1)
    heat_risk = max(0, min(1, heat_risk))
    ward_disruption_freq = cfg['disruption_days'] / 365 + np.random.normal(0, 0.02)

    # Loyalty discount
    loyalty = 0.95 if trust_week >= 9 else (0.97 if trust_week >= 5 else 1.0)

    # Target premium (what the model should learn)
    base = cfg['base_premium']
    raw = base * seasonal * loyalty
    raw *= (1 + flood_risk * 0.2)
    raw *= (1 + heat_risk * 0.1)
    raw += claims_last_month * 2
    raw -= years_on_platform * 1.5
    premium = round(max(60, min(120, raw + np.random.normal(0, 3))), 2)

    data.append({
        'city': city,
        'month': month,
        'seasonal_factor': seasonal,
        'trust_week': trust_week,
        'declared_hourly_rate': round(declared_hourly, 2),
        'claims_last_month': int(claims_last_month),
        'years_on_platform': round(years_on_platform, 2),
        'flood_risk_score': round(flood_risk, 3),
        'heat_risk_score': round(heat_risk, 3),
        'ward_disruption_freq': round(ward_disruption_freq, 3),
        'city_median_hourly': cfg['median_hourly'],
        'city_base_premium': cfg['base_premium'],
        'weekly_premium': premium,
    })

df = pd.DataFrame(data)
df.to_csv('data/training_data.csv', index=False)
print(f"Generated {len(df)} training samples")
print(df.describe())
print("\nPremium distribution:")
print(df['weekly_premium'].describe())

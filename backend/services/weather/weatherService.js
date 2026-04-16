// ─── GigShield Weather Service ───────────────────────────────────────────
// Real OpenWeatherMap API integration
// Free tier: 1000 calls/day — sufficient for hackathon
// Sign up at: openweathermap.org/api → Current Weather Data (free)

const axios = require('axios');

const OWM_KEY = process.env.OPENWEATHER_API_KEY;
const OWM_BASE = 'https://api.openweathermap.org/data/2.5';

// City coordinates for hyperlocal weather
const CITY_COORDS = {
  mumbai:    { lat: 19.0760, lon: 72.8777, owm_id: 1275339 },
  delhi:     { lat: 28.6139, lon: 77.2090, owm_id: 1273294 },
  bangalore: { lat: 12.9716, lon: 77.5946, owm_id: 1277333 },
  chennai:   { lat: 13.0827, lon: 80.2707, owm_id: 1264527 },
  pune:      { lat: 18.5204, lon: 73.8567, owm_id: 1259229 },
};

// Ward-level coordinate offsets (simulate hyperlocal)
const WARD_OFFSETS = {
  'MUM-W07': { lat: 0.02, lon: -0.01 },
  'MUM-W14': { lat: 0.05, lon: 0.03  },
  'MUM-W22': { lat: -0.03, lon: 0.02 },
  'MUM-W31': { lat: 0.08, lon: -0.02 },
  'DEL-W11': { lat: 0.03, lon: 0.01  },
  'DEL-W22': { lat: -0.02, lon: 0.04 },
  'DEL-W34': { lat: 0.06, lon: -0.03 },
  'BLR-W09': { lat: 0.02, lon: 0.02  },
  'BLR-W17': { lat: -0.04, lon: 0.01 },
  'CHN-W05': { lat: 0.03, lon: 0.02  },
  'PUN-W08': { lat: 0.01, lon: 0.01  },
};

/**
 * Get real weather for a city+ward combination
 */
async function getWeatherForZone(city, wardId) {
  const cityData = CITY_COORDS[city?.toLowerCase()];
  if (!cityData) return getFallbackWeather(city, wardId);

  // Apply ward offset for hyperlocal approximation
  const offset = WARD_OFFSETS[wardId] || { lat: 0, lon: 0 };
  const lat = cityData.lat + offset.lat;
  const lon = cityData.lon + offset.lon;

  // If no API key, use intelligent mock based on season
  if (!OWM_KEY || OWM_KEY === 'YOUR_API_KEY_HERE') {
    console.log('[Weather] No API key — using seasonal mock data');
    return getSeasonalMock(city, wardId);
  }

  try {
    const [current, forecast] = await Promise.all([
      axios.get(`${OWM_BASE}/weather?lat=${lat}&lon=${lon}&appid=${OWM_KEY}&units=metric`),
      axios.get(`${OWM_BASE}/forecast?lat=${lat}&lon=${lon}&appid=${OWM_KEY}&units=metric&cnt=8`),
    ]);

    return parseWeatherResponse(current.data, forecast.data, city, wardId);
  } catch (err) {
    console.error('[Weather] API error:', err.message, '— using seasonal mock');
    return getSeasonalMock(city, wardId);
  }
}

function parseWeatherResponse(current, forecast, city, wardId) {
  const rain1h = current.rain?.['1h'] || 0;
  const temp   = current.main.temp;
  const aqi    = 150; // AQI requires separate API call — simulated

  // Determine alert level from real data
  let alertLevel = null;
  let severityMultiplier = 0;
  let confidence = 0;

  if (rain1h >= 35.5) {
    alertLevel = 'red'; severityMultiplier = 1.0; confidence = 0.92;
  } else if (rain1h >= 7.5) {
    alertLevel = 'orange'; severityMultiplier = 0.7; confidence = 0.85;
  } else if (rain1h >= 2.5) {
    alertLevel = 'yellow'; severityMultiplier = 0.4; confidence = 0.72;
  } else if (temp >= 45) {
    alertLevel = 'heatwave'; severityMultiplier = 0.6; confidence = 0.88;
  } else if (aqi >= 400) {
    alertLevel = 'pollution'; severityMultiplier = 0.4; confidence = 0.80;
  }

  // Next 24hr forecast
  const next24h = forecast.list.map(f => ({
    time: f.dt_txt,
    rain: f.rain?.['3h'] || 0,
    temp: f.main.temp,
    weather: f.weather[0]?.description,
  }));
  const maxRainForecast = Math.max(...next24h.map(f => f.rain));

  return {
    source: 'openweathermap_live',
    city, ward_id: wardId,
    current: {
      temp_celsius: Math.round(temp),
      rain_mm_per_hour: rain1h,
      weather_description: current.weather[0]?.description,
      humidity: current.main.humidity,
      wind_speed: current.wind.speed,
      feels_like: Math.round(current.main.feels_like),
    },
    alert_level: alertLevel,
    severity_multiplier: severityMultiplier,
    confidence_score: confidence,
    disruption_active: alertLevel !== null,
    forecast_24h: next24h,
    max_rain_forecast_mm: Math.round(maxRainForecast * 10) / 10,
    risk_tomorrow: maxRainForecast >= 7.5 ? 'HIGH' : maxRainForecast >= 2.5 ? 'MEDIUM' : 'LOW',
  };
}

// Intelligent seasonal mock (when no API key)
function getSeasonalMock(city, wardId) {
  const month = new Date().getMonth(); // 0-11
  const isMonsoon = month >= 5 && month <= 8;
  const isPreMonsoon = month === 4 || month === 9;

  const rain = isMonsoon
    ? Math.random() * 20 // 0-20mm/hr in monsoon
    : isPreMonsoon
    ? Math.random() * 5
    : Math.random() * 1;

  const temp = city === 'delhi' && (month >= 3 && month <= 5) ? 38 + Math.random() * 8 : 28 + Math.random() * 5;

  let alertLevel = null, multiplier = 0, confidence = 0;
  if (rain >= 35.5)      { alertLevel = 'red';    multiplier = 1.0; confidence = 0.90; }
  else if (rain >= 7.5)  { alertLevel = 'orange'; multiplier = 0.7; confidence = 0.83; }
  else if (rain >= 2.5)  { alertLevel = 'yellow'; multiplier = 0.4; confidence = 0.70; }
  else if (temp >= 45)   { alertLevel = 'heatwave'; multiplier = 0.6; confidence = 0.85; }

  return {
    source: 'seasonal_mock',
    city, ward_id: wardId,
    current: {
      temp_celsius: Math.round(temp),
      rain_mm_per_hour: Math.round(rain * 10) / 10,
      weather_description: rain > 7.5 ? 'heavy rain' : rain > 2.5 ? 'moderate rain' : 'clear sky',
      humidity: isMonsoon ? 85 + Math.random() * 10 : 50 + Math.random() * 20,
    },
    alert_level: alertLevel,
    severity_multiplier: multiplier,
    confidence_score: confidence,
    disruption_active: alertLevel !== null,
    note: 'Set OPENWEATHER_API_KEY in .env for live data',
  };
}

function getFallbackWeather(city, wardId) {
  return { source: 'fallback', city, ward_id: wardId, alert_level: null, disruption_active: false };
}

module.exports = { getWeatherForZone, CITY_COORDS };

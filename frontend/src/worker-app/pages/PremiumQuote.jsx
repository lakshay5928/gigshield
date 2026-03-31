import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../../shared/api';

export default function PremiumQuote() {
  const nav      = useNavigate();
  const { state } = useLocation();
  const p        = state?.premium || { weekly_premium: 80, zone_risk: 'medium', city_median_hourly: 60 };
  const worker   = state?.worker  || JSON.parse(localStorage.getItem('gs_worker') || '{}');
  const [loading, setLoading] = useState(false);

  const examplePayout = Math.round(p.city_median_hourly * 0.5 * 3 * 0.7);

  async function activate() {
    setLoading(true);
    try {
      await API.post('/policies/create');
      toast.success('Coverage activated! You are now protected ✅');
      nav('/dashboard');
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to activate');
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm p-7">

        <div className="text-center mb-6">
          <h1 className="text-2xl font-black text-green-700">⚡ Your Coverage</h1>
          <p className="text-gray-400 text-sm mt-1">AI-priced based on your zone risk</p>
        </div>

        {/* Premium Hero */}
        <div className="bg-gradient-to-br from-green-700 to-green-900 rounded-2xl p-6 text-white mb-5">
          <p className="text-green-300 text-sm">Weekly Premium</p>
          <div className="flex items-end gap-2 mt-1">
            <span className="text-5xl font-black">₹{p.weekly_premium}</span>
            <span className="text-green-300 mb-1">/week</span>
          </div>
          <p className="text-green-300 text-xs mt-2">Auto-renews every Monday</p>

          <div className="grid grid-cols-3 gap-2 mt-4 text-center text-sm">
            <div className="bg-white/15 rounded-xl p-2">
              <p className="text-green-300 text-xs">Zone Risk</p>
              <p className="font-bold capitalize">{p.zone_risk}</p>
            </div>
            <div className="bg-white/15 rounded-xl p-2">
              <p className="text-green-300 text-xs">City Rate</p>
              <p className="font-bold">₹{p.city_median_hourly}/hr</p>
            </div>
            <div className="bg-white/15 rounded-xl p-2">
              <p className="text-green-300 text-xs">Season</p>
              <p className="font-bold">{p.seasonal_factor ? `${p.seasonal_factor}×` : '—'}</p>
            </div>
          </div>
        </div>

        {/* Covered events */}
        <div className="space-y-2 mb-5">
          <p className="font-bold text-gray-700 text-sm">Covered Events:</p>
          {[
            ['🌧️','Heavy Rain / Flood','IMD Orange + Red Alert'],
            ['🌡️','Extreme Heat Wave','IMD >45°C'],
            ['🚫','Curfew / Bandh / Strike','Govt. declared'],
            ['💨','Severe Pollution','CPCB AQI >400'],
            ['🌩️','Yellow Alert','Light disruption'],
          ].map(([icon, label, sub]) => (
            <div key={label} className="flex items-center gap-3 p-2.5 bg-green-50 rounded-xl">
              <span className="text-xl">{icon}</span>
              <div>
                <p className="text-sm font-semibold text-gray-800">{label}</p>
                <p className="text-xs text-gray-400">{sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Example */}
        <div className="bg-blue-50 rounded-xl p-4 mb-5 text-sm">
          <p className="font-bold text-blue-800 mb-1">Example payout:</p>
          <p className="text-gray-600">
            Orange Alert × 3 hrs × ₹{Math.round(p.city_median_hourly * 0.5)}/hr =&nbsp;
            <span className="font-black text-green-700">₹{examplePayout}</span>
          </p>
          <p className="text-xs text-gray-400 mt-1">Credited via UPI in under 5 minutes. No forms.</p>
        </div>

        <button onClick={activate} disabled={loading} className="btn-primary w-full text-base">
          {loading ? 'Activating...' : `Activate for ₹${p.weekly_premium}/week ✓`}
        </button>
        <p className="text-center text-xs text-gray-400 mt-3">
          Underwritten by partner insurer • IRDAI Sandbox compliant
        </p>
      </div>
    </div>
  );
}

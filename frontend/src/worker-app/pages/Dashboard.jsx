import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../../shared/api';

const FLAG_PILL = {
  GREEN:  'bg-green-100 text-green-700',
  YELLOW: 'bg-yellow-100 text-yellow-700',
  RED:    'bg-red-100 text-red-700',
};

export default function Dashboard() {
  const nav = useNavigate();
  const [worker,      setWorker]      = useState(null);
  const [claims,      setClaims]      = useState([]);
  const [activeAlert, setActiveAlert] = useState(null);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const [wRes, cRes, aRes] = await Promise.all([
        API.get('/workers/me'),
        API.get('/claims/my'),
        API.get('/alerts/active'),
      ]);
      setWorker(wRes.data);
      setClaims(cRes.data);
      if (aRes.data.length) setActiveAlert(aRes.data[0]);
    } catch { toast.error('Failed to load dashboard'); }
    setLoading(false);
  }

  function logout() {
    localStorage.clear();
    nav('/');
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="text-4xl mb-3">⚡</div>
        <p className="text-green-700 font-semibold">Loading...</p>
      </div>
    </div>
  );

  const totalEarned  = claims.filter(c => c.status === 'paid').reduce((s, c) => s + parseFloat(c.payout_amount || 0), 0);
  const recentClaims = claims.slice(0, 4);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-green-700 text-white px-5 pt-10 pb-6">
        <div className="flex justify-between items-start max-w-md mx-auto">
          <div>
            <p className="text-green-300 text-sm">Welcome back</p>
            <h1 className="text-xl font-black">{worker?.name}</h1>
            <p className="text-green-300 text-xs mt-0.5 capitalize">{worker?.platform} • {worker?.city} • {worker?.ward_id}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => nav('/report')}
              className="bg-white/20 hover:bg-white/30 text-white rounded-xl px-3 py-2 text-xs font-semibold">
              🌧️ Report
            </button>
            <button onClick={logout}
              className="bg-white/20 hover:bg-white/30 text-white rounded-xl px-3 py-2 text-xs font-semibold">
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 -mt-3 pb-8 space-y-4">

        {/* Active Alert Banner */}
        {activeAlert && (
          <div className="bg-orange-500 text-white rounded-2xl p-4 shadow-lg">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="font-black">{activeAlert.alert_level?.toUpperCase()} Alert Active</p>
                <p className="text-orange-100 text-xs">{activeAlert.ward_id} • Payout processing automatically...</p>
              </div>
            </div>
          </div>
        )}

        {/* Policy Card */}
        <div className="card">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Policy Status</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`w-2.5 h-2.5 rounded-full ${worker?.policy_status === 'active' ? 'bg-green-500' : 'bg-red-400'}`} />
                <span className="font-black text-lg">
                  {worker?.policy_status === 'active' ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Weekly Premium</p>
              <p className="text-2xl font-black text-green-700 mt-1">
                {worker?.weekly_premium ? `₹${worker.weekly_premium}` : '—'}
              </p>
            </div>
          </div>

          {worker?.end_date && (
            <p className="text-xs text-gray-400 mb-4">
              Expires: {new Date(worker.end_date).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
            </p>
          )}

          <div className="grid grid-cols-3 gap-3">
            {[
              ['Total Claims', worker?.total_claims || 0, 'text-blue-600'],
              ['Total Earned', `₹${Math.round(totalEarned)}`, 'text-green-600'],
              ['Trust Level', `W${worker?.trust_week || 1}`, 'text-purple-600'],
            ].map(([label, val, color]) => (
              <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-400">{label}</p>
                <p className={`font-black text-lg mt-0.5 ${color}`}>{val}</p>
              </div>
            ))}
          </div>

          {worker?.policy_status !== 'active' && (
            <button onClick={() => nav('/quote')} className="btn-primary w-full mt-4">
              Activate Coverage
            </button>
          )}
        </div>

        {/* Trust Progress */}
        <div className="card">
          <p className="font-bold text-gray-800 mb-3">Earnings Trust Progress</p>
          <div className="flex gap-2 mb-2">
            {[['W1-4', '50%', 1], ['W5-8', '70%', 5], ['W9+', '90%', 9]].map(([label, pct, thresh]) => (
              <div key={label} className={`flex-1 rounded-xl p-2.5 text-center transition-all
                ${(worker?.trust_week || 1) >= thresh ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                <p className="text-xs font-bold">{label}</p>
                <p className="text-sm font-black">{pct}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400">
            {worker?.verified_screenshots || 0}/3 screenshots verified •&nbsp;
            {(worker?.verified_screenshots || 0) < 3
              ? `Upload ${3 - (worker?.verified_screenshots || 0)} more to reach 90%`
              : 'Max trust level reached!'}
          </p>
        </div>

        {/* Recent Claims */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <p className="font-bold text-gray-800">Recent Claims</p>
            <button onClick={() => nav('/claims')} className="text-green-700 text-sm font-semibold">View All →</button>
          </div>
          {recentClaims.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-3xl mb-2">📋</p>
              <p className="text-gray-400 text-sm">No claims yet. You're covered!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentClaims.map(c => (
                <div key={c.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-semibold capitalize">{c.alert_level || 'Alert'} Disruption</p>
                    <p className="text-xs text-gray-400">
                      {new Date(c.created_at).toLocaleDateString('en-IN')} • {c.disruption_hours}h
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-black ${c.status === 'paid' ? 'text-green-600' : 'text-orange-500'}`}>
                      {c.status === 'paid' ? `₹${Math.round(c.payout_amount)}` : '⏳'}
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${FLAG_PILL[c.flag] || FLAG_PILL.GREEN}`}>
                      {c.flag}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

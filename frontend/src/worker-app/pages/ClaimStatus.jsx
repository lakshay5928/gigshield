import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../shared/api';

const FLAG = {
  GREEN:  { pill: 'bg-green-100 text-green-700',  label: 'Auto-Approved' },
  YELLOW: { pill: 'bg-yellow-100 text-yellow-700', label: 'Under Review' },
  RED:    { pill: 'bg-red-100 text-red-700',       label: 'Flagged' },
};
const STATUS = {
  paid:     'bg-green-100 text-green-700',
  approved: 'bg-blue-100 text-blue-700',
  flagged:  'bg-red-100 text-red-700',
  rejected: 'bg-gray-100 text-gray-500',
  pending:  'bg-orange-100 text-orange-700',
};

export default function ClaimStatus() {
  const nav = useNavigate();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/claims/my').then(r => { setClaims(r.data); setLoading(false); });
  }, []);

  const total   = claims.length;
  const paid    = claims.filter(c => c.status === 'paid').length;
  const earned  = claims.filter(c => c.status === 'paid').reduce((s,c) => s + parseFloat(c.payout_amount || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-green-700 text-white px-5 pt-10 pb-6">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => nav('/dashboard')} className="text-green-300 text-xl font-bold">←</button>
            <h1 className="text-xl font-black">All Claims</h1>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            {[['Total', total, ''], ['Paid Out', paid, ''], ['Total Earned', `₹${Math.round(earned)}`, '']].map(([l, v]) => (
              <div key={l} className="bg-white/15 rounded-xl p-3">
                <p className="text-green-300 text-xs">{l}</p>
                <p className="font-black text-lg">{v}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-4 space-y-3">
        {loading ? (
          <p className="text-center py-10 text-gray-400">Loading...</p>
        ) : claims.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-3">📋</p>
            <p className="text-gray-500 font-semibold">No claims yet</p>
            <p className="text-gray-400 text-sm mt-1">When a disruption is detected in your zone, claims auto-trigger.</p>
          </div>
        ) : claims.map(c => (
          <div key={c.id} className="card">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="font-bold capitalize">{c.alert_level || 'Alert'} Disruption</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(c.created_at).toLocaleString('en-IN', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}
                </p>
              </div>
              <span className={`text-xs px-3 py-1 rounded-full font-bold ${(FLAG[c.flag] || FLAG.GREEN).pill}`}>
                {(FLAG[c.flag] || FLAG.GREEN).label}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center text-xs mb-3">
              {[
                ['Hours', `${c.disruption_hours}h`],
                ['Rate', `₹${Math.round(c.hourly_rate_used)}`],
                ['Multiplier', `${c.severity_multiplier}×`],
                ['Payout', `₹${Math.round(c.payout_amount)}`],
              ].map(([label, val]) => (
                <div key={label} className="bg-gray-50 rounded-xl p-2">
                  <p className="text-gray-400">{label}</p>
                  <p className="font-black text-sm mt-0.5">{val}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <span className={`text-xs px-3 py-1.5 rounded-full font-semibold ${STATUS[c.status] || STATUS.pending}`}>
                {c.status?.toUpperCase()}
              </span>
              {c.upi_ref && (
                <p className="text-xs text-gray-400 font-mono">{c.upi_ref?.slice(0, 20)}...</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

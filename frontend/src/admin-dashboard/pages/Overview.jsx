import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from 'recharts';
import API from '../../shared/api';

const FLAG_COLORS = { GREEN: '#16a34a', YELLOW: '#d97706', RED: '#dc2626' };

export default function AdminOverview() {
  const nav = useNavigate();
  const [stats,   setStats]   = useState(null);
  const [workers, setWorkers] = useState([]);
  const [alerts,  setAlerts]  = useState([]);

  useEffect(() => {
    Promise.all([
      API.get('/claims/stats'),
      API.get('/workers/all'),
      API.get('/alerts/all'),
    ]).then(([s, w, a]) => {
      setStats(s.data);
      setWorkers(w.data);
      setAlerts(a.data);
    });
  }, []);

  const flagData = (stats?.by_flag || []).map(f => ({
    name: f.flag,
    value: parseInt(f.count),
    color: FLAG_COLORS[f.flag] || '#94a3b8',
  }));

  const cityData = Object.entries(
    workers.reduce((acc, w) => { acc[w.city] = (acc[w.city] || 0) + 1; return acc; }, {})
  ).map(([city, count]) => ({ city: city.charAt(0).toUpperCase() + city.slice(1), count }));

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-green-700 text-white px-6 py-5">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-black">⚡ GigShield Admin</h1>
            <p className="text-green-300 text-xs mt-0.5">Insurance Operations Dashboard</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => nav('/admin/claims')}
              className="bg-white/20 hover:bg-white/30 text-white rounded-xl px-4 py-2 text-sm font-semibold">
              Claims Queue
            </button>
            <button onClick={() => nav('/admin/simulate')}
              className="bg-white text-green-700 rounded-xl px-4 py-2 text-sm font-bold hover:bg-green-50">
              🌧️ Simulate Alert
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Enrolled Workers', value: workers.length,                    color: 'text-blue-600' },
            { label: 'Total Claims',     value: stats?.total_claims || 0,           color: 'text-green-600' },
            { label: 'Total Payouts',    value: `₹${Math.round(stats?.total_payout || 0)}`, color: 'text-purple-600' },
            { label: 'Loss Ratio',       value: stats?.loss_ratio || '0%',          color: 'text-orange-600' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm">
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">{s.label}</p>
              <p className={`text-3xl font-black mt-1 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {/* Fraud Flag Distribution */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4">Claim Flag Distribution</h3>
            {flagData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={flagData} dataKey="value" cx="50%" cy="50%" outerRadius={70}
                      label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                      {flagData.map((f, i) => <Cell key={i} fill={f.color} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-4 mt-2">
                  {flagData.map(f => (
                    <div key={f.name} className="flex items-center gap-1.5 text-xs">
                      <div className="w-3 h-3 rounded-full" style={{ background: f.color }} />
                      <span className="font-semibold">{f.name} ({f.value})</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-48 text-gray-300">
                <p>No claims yet — trigger an alert to see data</p>
              </div>
            )}
          </div>

          {/* Workers by City */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4">Workers by City</h3>
            {cityData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={cityData} barSize={32}>
                  <XAxis dataKey="city" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#1A6B3C" radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-48 text-gray-300">
                <p>No workers enrolled yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4">Recent Alerts ({alerts.length})</h3>
          {alerts.length === 0 ? (
            <p className="text-gray-400 text-center py-6 text-sm">No alerts yet. Use the simulator to trigger one.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-400 border-b uppercase tracking-wide">
                    <th className="pb-3">Level</th>
                    <th className="pb-3">Zone</th>
                    <th className="pb-3">City</th>
                    <th className="pb-3">Confidence</th>
                    <th className="pb-3">Duration</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {alerts.slice(0, 10).map(a => {
                    const hrs = a.ended_at
                      ? ((new Date(a.ended_at) - new Date(a.started_at)) / 3600000).toFixed(1)
                      : '—';
                    return (
                      <tr key={a.id} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="py-3">
                          <span className={`font-bold capitalize ${
                            a.alert_level === 'red'    ? 'text-red-600' :
                            a.alert_level === 'orange' ? 'text-orange-500' :
                            a.alert_level === 'bandh'  ? 'text-gray-700' : 'text-yellow-600'
                          }`}>{a.alert_level}</span>
                        </td>
                        <td className="py-3 font-mono text-xs">{a.ward_id}</td>
                        <td className="py-3 capitalize">{a.city}</td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-1.5">
                              <div className="bg-green-500 h-1.5 rounded-full"
                                style={{ width: `${(parseFloat(a.confidence_score) * 100).toFixed(0)}%` }} />
                            </div>
                            <span className="text-xs">{(parseFloat(a.confidence_score) * 100).toFixed(0)}%</span>
                          </div>
                        </td>
                        <td className="py-3">{hrs}h</td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            a.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {a.is_active ? '● ACTIVE' : 'ENDED'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Workers Table */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4">Enrolled Workers</h3>
          {workers.length === 0 ? (
            <p className="text-gray-400 text-center py-6 text-sm">No workers registered yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-400 border-b uppercase tracking-wide">
                    <th className="pb-3">Name</th>
                    <th className="pb-3">Mobile</th>
                    <th className="pb-3">City</th>
                    <th className="pb-3">Ward</th>
                    <th className="pb-3">Platform</th>
                    <th className="pb-3">Trust</th>
                  </tr>
                </thead>
                <tbody>
                  {workers.slice(0, 15).map(w => (
                    <tr key={w.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-2.5 font-semibold">{w.name}</td>
                      <td className="py-2.5 text-gray-500">{w.mobile}</td>
                      <td className="py-2.5 capitalize">{w.city}</td>
                      <td className="py-2.5 font-mono text-xs">{w.ward_id}</td>
                      <td className="py-2.5 capitalize">{w.platform}</td>
                      <td className="py-2.5">
                        <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs font-bold">
                          W{w.trust_week}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

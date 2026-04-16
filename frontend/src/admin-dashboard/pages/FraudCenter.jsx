import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import API from '../../shared/api';

export default function FraudCenter() {
  const nav = useNavigate();
  const [fraudStats, setFraudStats] = useState(null);
  const [recentFlagged, setRecentFlagged] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    Promise.all([API.get('/fraud/stats'),API.get('/fraud/recent')])
      .then(([s,r])=>{ setFraudStats(s.data); setRecentFlagged(r.data); setLoading(false); });
  },[]);

  const signalData = (fraudStats?.by_signal_type||[]).map(s=>({ name:s.signal_type?.replace(/_/g,' '), count:parseInt(s.count), score:parseInt(s.total_score) }));

  const SIGNAL_INFO = {
    GPS_SPOOFED:        { desc:'GPS accuracy <4m — physically impossible outdoors', color:'text-red-600' },
    GPS_SUSPICIOUS:     { desc:'GPS accuracy 4-8m — suspiciously precise', color:'text-orange-500' },
    DEVICE_SHARED:      { desc:'Same device used by multiple worker accounts', color:'text-red-600' },
    HIGH_VELOCITY:      { desc:'6+ claims in 7 days — above normal frequency', color:'text-orange-500' },
    ELEVATED_FREQ:      { desc:'4-5 claims in 7 days — slightly elevated', color:'text-yellow-600' },
    COORDINATED_RING:   { desc:'50+ claims from same ward in 5 minutes', color:'text-red-600' },
    WARD_SPIKE:         { desc:'30+ claims from same ward in 5 minutes', color:'text-orange-500' },
    WEATHER_MISMATCH:   { desc:'Alert type inconsistent with city climate', color:'text-yellow-600' },
    WARD_DENSITY_ANOMALY: { desc:'Very few workers claiming during major alert', color:'text-yellow-600' },
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-red-700 text-white px-6 py-5">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div>
            <div className="flex items-center gap-3 mb-1"><button onClick={()=>nav('/admin')} className="text-red-300 text-xl font-bold">←</button><h1 className="text-xl font-black">🛡️ Fraud Detection Center</h1></div>
            <p className="text-red-300 text-xs">Phase 3 — Advanced 5-Signal Isolation Forest Detection</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">

        {/* Detection Method Cards */}
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { icon:'📡', title:'GPS Accuracy Analysis', desc:'Real outdoor GPS: ±15-30m. Spoofed: ±1-5m (perfect = suspicious)', tag:'Signal 1' },
            { icon:'📱', title:'Device Fingerprinting', desc:'Same device across multiple worker accounts = hard block', tag:'Signal 2' },
            { icon:'⏱️', title:'Claim Velocity Check', desc:'6+ claims/7 days triggers elevated fraud score', tag:'Signal 3' },
          ].map(c=>(
            <div key={c.title} className="bg-white rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-2"><span className="text-2xl">{c.icon}</span><span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">{c.tag}</span></div>
              <p className="font-bold text-gray-800 text-sm">{c.title}</p>
              <p className="text-xs text-gray-500 mt-1">{c.desc}</p>
            </div>
          ))}
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { icon:'🏘️', title:'Ward Density (Coordinated Ring)', desc:'50+ claims from same ward in 5-min window = fraud syndicate detected', tag:'Signal 4' },
            { icon:'🌤️', title:'Weather-Zone Mismatch', desc:'Alert type inconsistent with historical city climate patterns', tag:'Signal 5' },
          ].map(c=>(
            <div key={c.title} className="bg-white rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-2"><span className="text-2xl">{c.icon}</span><span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">{c.tag}</span></div>
              <p className="font-bold text-gray-800 text-sm">{c.title}</p>
              <p className="text-xs text-gray-500 mt-1">{c.desc}</p>
            </div>
          ))}
        </div>

        {/* Flag Summary */}
        <div className="grid grid-cols-3 gap-4">
          {[['🟢 GREEN','Auto-approved — instant payout',fraudStats?.by_flag?.find(f=>f.flag==='GREEN')?.count||0,'bg-green-50 border-green-200'],['🟡 YELLOW','Minor anomaly — manual review',fraudStats?.by_flag?.find(f=>f.flag==='YELLOW')?.count||0,'bg-yellow-50 border-yellow-200'],['🔴 RED','High risk — blocked',fraudStats?.by_flag?.find(f=>f.flag==='RED')?.count||0,'bg-red-50 border-red-200']].map(([l,d,c,cls])=>(
            <div key={l} className={`border-2 rounded-2xl p-4 ${cls}`}>
              <p className="font-bold text-sm">{l}</p>
              <p className="text-xs text-gray-500 mt-1">{d}</p>
              <p className="text-3xl font-black mt-2">{c}</p>
            </div>
          ))}
        </div>

        {/* Signal Frequency Chart */}
        {signalData.length>0&&(
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4">Signal Frequency</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={signalData} barSize={28}>
                <XAxis dataKey="name" tick={{fontSize:10}} angle={-20} textAnchor="end" height={50}/>
                <YAxis tick={{fontSize:12}}/>
                <Tooltip/>
                <Bar dataKey="count" fill="#dc2626" radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Top Risk Workers */}
        {fraudStats?.top_risk_workers?.length>0&&(
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4">⚠️ High Risk Workers</h3>
            <div className="overflow-x-auto"><table className="w-full text-sm">
              <thead><tr className="text-left text-xs text-gray-400 border-b uppercase tracking-wide"><th className="pb-3">Name</th><th className="pb-3">Mobile</th><th className="pb-3">City</th><th className="pb-3">Signals</th><th className="pb-3">Risk Score</th></tr></thead>
              <tbody>{fraudStats.top_risk_workers.map((w,i)=>(
                <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-2.5 font-semibold">{w.name}</td>
                  <td className="py-2.5 text-gray-500">{w.mobile}</td>
                  <td className="py-2.5 capitalize">{w.city}</td>
                  <td className="py-2.5">{w.signal_count}</td>
                  <td className="py-2.5"><span className={`px-2 py-0.5 rounded-full text-xs font-bold ${w.total_score>=5?'bg-red-100 text-red-700':w.total_score>=2?'bg-yellow-100 text-yellow-700':'bg-green-100 text-green-700'}`}>{w.total_score}</span></td>
                </tr>
              ))}</tbody>
            </table></div>
          </div>
        )}

        {/* Recent Flagged Claims */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4">Recent Flagged Claims</h3>
          {loading?<p className="text-gray-400 text-center py-6">Loading...</p>:recentFlagged.length===0?<p className="text-gray-400 text-center py-6 text-sm">No flagged claims yet.</p>:(
            <div className="space-y-3">{recentFlagged.slice(0,8).map(c=>(
              <div key={c.id} className="border border-red-100 rounded-xl p-4">
                <div className="flex justify-between items-start mb-2">
                  <div><p className="font-semibold text-sm">{c.name} <span className="text-gray-400 text-xs">{c.mobile}</span></p><p className="text-xs text-gray-500 capitalize">{c.city} • {c.alert_level} Alert</p></div>
                  <div className="text-right"><span className={`text-xs px-2 py-1 rounded-full font-bold ${c.flag==='RED'?'bg-red-100 text-red-700':'bg-yellow-100 text-yellow-700'}`}>{c.flag}</span><p className="text-xs text-gray-500 mt-1">Score: {c.fraud_score}</p></div>
                </div>
                <div className="space-y-1">{JSON.parse(c.fraud_signals||'[]').map((s,i)=>{
                  const info=SIGNAL_INFO[s.type]||{desc:s.type,color:'text-gray-600'};
                  return<p key={i} className={`text-xs ${info.color}`}>• <b>{s.type}</b>: {info.desc}</p>;
                })}</div>
              </div>
            ))}</div>
          )}
        </div>
      </div>
    </div>
  );
}

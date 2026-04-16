import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid, Legend } from 'recharts';
import API from '../../shared/api';

export default function Analytics() {
  const nav = useNavigate();
  const [predictive, setPredictive] = useState(null);
  const [lossRatio, setLossRatio] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    Promise.all([API.get('/analytics/predictive'),API.get('/analytics/loss-ratio')])
      .then(([p,l])=>{ setPredictive(p.data); setLossRatio(l.data); setLoading(false); });
  },[]);

  const RISK_COLOR = { HIGH:'bg-red-100 text-red-700 border-red-200', MEDIUM:'bg-yellow-100 text-yellow-700 border-yellow-200', LOW:'bg-green-100 text-green-700 border-green-200' };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-accent-500 text-white px-6 py-5" style={{background:'#2E5FA3'}}>
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div>
            <div className="flex items-center gap-3 mb-1"><button onClick={()=>nav('/admin')} className="text-blue-300 text-xl font-bold">←</button><h1 className="text-xl font-black">📊 Predictive Analytics</h1></div>
            <p className="text-blue-300 text-xs">Phase 3 — Next-week disruption risk + loss ratio forecasting</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">

        {/* Predictive Risk */}
        {predictive&&(
          <>
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">Next Month Risk Forecast</h3>
                  <p className="text-gray-500 text-sm mt-1">{predictive.next_month} — Seasonal Factor: <span className="font-bold">{predictive.seasonal_factor}×</span></p>
                </div>
                <div className={`px-4 py-2 rounded-xl border-2 text-sm font-bold ${RISK_COLOR[predictive.predictions?.[0]?.risk_level]||RISK_COLOR.MEDIUM}`}>
                  {predictive.predictions?.[0]?.risk_level||'MEDIUM'} RISK
                </div>
              </div>
              <div className="mt-4 bg-blue-50 rounded-xl p-4 text-sm text-blue-800">
                💡 <b>Recommendation:</b> {predictive.recommendation}
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(predictive.predictions||[]).map(p=>(
                <div key={p.city} className={`border-2 rounded-2xl p-5 ${RISK_COLOR[p.risk_level]||''}`}>
                  <div className="flex justify-between items-center mb-3">
                    <p className="font-black capitalize text-lg">{p.city}</p>
                    <span className={`text-xs px-2 py-1 rounded-full font-bold ${RISK_COLOR[p.risk_level]}`}>{p.risk_level}</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    {[['Enrolled Workers',p.enrolled_workers],['Expected Disruption Days',p.expected_disruption_days],['Expected Claims',p.expected_claims],['Expected Payout',p.expected_payout],['Seasonal Factor',`${p.seasonal_factor}×`]].map(([l,v])=>(
                      <div key={l} className="flex justify-between"><span className="opacity-70">{l}</span><span className="font-bold">{v}</span></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Loss Ratio Chart */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-1">Loss Ratio — Weekly Trend</h3>
          <p className="text-gray-400 text-xs mb-4">Target: ~60% | Below 55% = over-priced | Above 70% = under-priced</p>
          {lossRatio.length===0?(
            <div className="flex items-center justify-center h-48 text-gray-300"><p>No data yet — trigger alerts to see trend</p></div>
          ):(
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={lossRatio}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                <XAxis dataKey="week" tick={{fontSize:11}} tickFormatter={v=>new Date(v).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}/>
                <YAxis tick={{fontSize:11}} unit="%"/>
                <Tooltip formatter={(v)=>`${v}%`}/>
                <Legend/>
                <Line type="monotone" dataKey="loss_ratio" stroke="#1A6B3C" strokeWidth={2} dot={{fill:'#1A6B3C'}} name="Loss Ratio %"/>
              </LineChart>
            </ResponsiveContainer>
          )}
          <div className="flex gap-4 mt-3 text-xs">
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-green-500 rounded-full"/><span>Target zone: 55-70%</span></div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-red-400 rounded-full"/><span>Danger: &gt;70%</span></div>
          </div>
        </div>

        {/* Weekly Premiums vs Payouts */}
        {lossRatio.length>0&&(
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4">Premium vs Payout (₹)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={lossRatio}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                <XAxis dataKey="week" tick={{fontSize:11}} tickFormatter={v=>new Date(v).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}/>
                <YAxis tick={{fontSize:11}}/>
                <Tooltip formatter={v=>`₹${v}`}/>
                <Legend/>
                <Bar dataKey="premium" fill="#2E5FA3" radius={[4,4,0,0]} name="Premiums Collected"/>
                <Bar dataKey="paid" fill="#1A6B3C" radius={[4,4,0,0]} name="Payouts Made"/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

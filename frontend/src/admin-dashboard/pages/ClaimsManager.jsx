import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../../shared/api';

const FLAG_S={GREEN:'bg-green-100 text-green-700',YELLOW:'bg-yellow-100 text-yellow-700',RED:'bg-red-100 text-red-700'};
const STATUS_S={paid:'bg-green-100 text-green-700',approved:'bg-blue-100 text-blue-700',flagged:'bg-red-100 text-red-700',rejected:'bg-gray-100 text-gray-500',pending:'bg-orange-100 text-orange-700'};

// Safe JSON parse helper
const safeParseJSON = (str) => {
  if (!str) return [];
  try {
    return JSON.parse(str);
  } catch(e) {
    return [];
  }
};

export default function ClaimsManager() {
  const nav = useNavigate();
  const [claims, setClaims] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(()=>{
    Promise.all([API.get('/claims/all'),API.get('/claims/stats')]).then(([c,s])=>{ 
      setClaims(c.data); 
      setStats(s.data); 
      setLoading(false); 
    }).catch(err=>{
      console.error('Failed to load claims:', err);
      setLoading(false);
    });
  },[]);

  const filtered = filter==='ALL'?claims:claims.filter(c=>c.flag===filter);
  const counts = {ALL:claims.length,GREEN:0,YELLOW:0,RED:0};
  claims.forEach(c=>{if(counts[c.flag]!==undefined)counts[c.flag]++;});

  async function approve(id){
    try{ 
      const{data}=await API.patch(`/claims/${id}/approve`); 
      toast.success(`✅ Paid! UPI: ${data.upi_ref?.slice(0,20)} (${data.processing_ms}ms)`); 
      setClaims(cs=>cs.map(c=>c.id===id?{...c,status:'paid',flag:'GREEN'}:c)); 
    } catch{ 
      toast.error('Failed'); 
    }
  }
  
  async function reject(id){
    try{ 
      await API.patch(`/claims/${id}/reject`); 
      toast.error('Claim rejected'); 
      setClaims(cs=>cs.map(c=>c.id===id?{...c,status:'rejected'}:c)); 
    } catch{ 
      toast.error('Failed'); 
    }
  }

  // Render fraud signals safely
  const renderFraudSignals = (fraudSignals) => {
    const signals = safeParseJSON(fraudSignals);
    if (signals.length === 0) return null;
    return (
      <div className="bg-red-50 rounded-xl p-2.5 mb-3">
        <p className="text-xs font-bold text-red-700 mb-1">🚩 Fraud Signals:</p>
        {signals.map((s,i) => (
          <p key={i} className="text-xs text-red-600">• {s.type} {s.detail ? `(${s.detail})` : ''}</p>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-green-700 text-white px-6 py-5">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <button onClick={()=>nav('/admin')} className="text-green-300 text-xl font-bold">←</button>
            <div>
              <h1 className="text-xl font-black">Claims Queue</h1>
              <p className="text-green-300 text-xs">{claims.length} total claims</p>
            </div>
          </div>
          {stats&&<div className="grid grid-cols-4 gap-3 text-center text-xs">
            {[['Avg Payout',`₹${Math.round(stats.avg_payout)}`],['Loss Ratio',stats.loss_ratio],['Avg Speed',`${stats.avg_processing_ms}ms`],['Total Paid',`₹${Math.round(stats.total_payout)}`]].map(([l,v])=>(
              <div key={l} className="bg-white/15 rounded-xl p-2"><p className="text-green-300">{l}</p><p className="font-black">{v}</p></div>
            ))}
          </div>}
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 py-5">
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
          {['ALL','GREEN','YELLOW','RED'].map(f=>(
            <button key={f} onClick={()=>setFilter(f)} className={`px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition ${filter===f?'bg-green-700 text-white shadow-md':'bg-white text-gray-600 hover:bg-gray-50'}`}>
              {f} <span className="opacity-70">({counts[f]})</span>
            </button>
          ))}
        </div>
        {loading?<p className="text-center py-16 text-gray-400">Loading...</p>:filtered.length===0?(
          <div className="text-center py-16 bg-white rounded-2xl"><p className="text-4xl mb-3">✅</p><p className="text-gray-500 font-semibold">No {filter!=='ALL'?filter:''} claims</p></div>
        ):(
          <div className="space-y-3">{filtered.map(c=>(
            <div key={c.id} className="bg-white rounded-2xl p-5 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-bold text-gray-900">{c.name}<span className="text-gray-400 font-normal ml-2 text-sm">{c.mobile}</span></p>
                  <p className="text-sm text-gray-500 mt-0.5 capitalize">{c.city} • {c.ward_id} • {c.alert_level?.toUpperCase()} Alert</p>
                  <p className="text-xs text-gray-400 mt-0.5">{new Date(c.created_at).toLocaleString('en-IN')}</p>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${FLAG_S[c.flag]||''}`}>{c.flag}</span>
                  {c.fraud_score>0&&<p className="text-xs text-red-500 mt-1">Risk Score: {c.fraud_score}</p>}
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center text-xs mb-3">
                {[['Hours',`${c.disruption_hours}h`],['Rate',`₹${Math.round(c.hourly_rate_used)}`],['Mult',`${c.severity_multiplier}×`],['Payout',`₹${Math.round(c.payout_amount)}`]].map(([l,v])=>(
                  <div key={l} className="bg-gray-50 rounded-xl p-2.5"><p className="text-gray-400">{l}</p><p className="font-black">{v}</p></div>
                ))}
              </div>
              {renderFraudSignals(c.fraud_signals)}
              <div className="flex items-center justify-between">
                <span className={`text-xs px-3 py-1.5 rounded-full font-semibold ${STATUS_S[c.status]||''}`}>{c.status?.toUpperCase()}</span>
                <div className="flex items-center gap-2">
                  {c.payout_status==='paid'&&c.processing_ms>0&&<p className="text-xs text-green-600">⚡ {c.processing_ms}ms</p>}
                  {['YELLOW','RED'].includes(c.flag)&&!['paid','rejected'].includes(c.status)&&(
                    <div className="flex gap-2">
                      <button onClick={()=>reject(c.id)} className="px-4 py-1.5 bg-red-100 text-red-700 rounded-xl text-xs font-bold hover:bg-red-200 transition">✕ Reject</button>
                      <button onClick={()=>approve(c.id)} className="px-4 py-1.5 bg-green-700 text-white rounded-xl text-xs font-bold hover:bg-green-800 transition">✓ Approve & Pay</button>
                    </div>
                  )}
                  {c.status==='paid'&&<p className="text-xs text-green-600 font-semibold">💸 UPI Credited</p>}
                </div>
              </div>
            </div>
          ))}</div>
        )}
      </div>
    </div>
  );
}
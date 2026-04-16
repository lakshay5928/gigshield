import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../../shared/api';

const TRIGGERS = [
  { id:'rain',      icon:'🌧️', label:'Heavy Rain',       alert_level:'orange',   source:'imd',  duration:3, multiplier:'0.7×', desc:'IMD Orange Alert — heavy rainfall' },
  { id:'flood',     icon:'🌊', label:'Flood / Red Alert', alert_level:'red',      source:'bmc',  duration:5, multiplier:'1.0×', desc:'BMC Red Alert — flooding' },
  { id:'bandh',     icon:'🚫', label:'Bandh / Curfew',    alert_level:'bandh',    source:'sdma', duration:8, multiplier:'1.0×', desc:'SDMA govt-declared restriction' },
  { id:'heatwave',  icon:'🌡️', label:'Heat Wave',         alert_level:'heatwave', source:'imd',  duration:6, multiplier:'0.6×', desc:'IMD Heat Wave — >45°C' },
  { id:'pollution', icon:'💨', label:'Severe Pollution',  alert_level:'pollution',source:'cpcb', duration:4, multiplier:'0.4×', desc:'CPCB AQI > 400' },
];
const CITIES = { mumbai:['MUM-W07','MUM-W14','MUM-W22','MUM-W31'], delhi:['DEL-W11','DEL-W22','DEL-W34'], bangalore:['BLR-W09','BLR-W17','BLR-W25'], chennai:['CHN-W05','CHN-W13'], pune:['PUN-W08','PUN-W16'] };

export default function AlertSimulator() {
  const nav = useNavigate();
  const [city, setCity] = useState('mumbai');
  const [ward, setWard] = useState('MUM-W14');
  const [firing, setFiring] = useState(null);
  const [result, setResult] = useState(null);

  async function fire(t) {
    setFiring(t.id);
    try {
      const { data } = await API.post('/alerts/trigger', { ward_id:ward, city, alert_level:t.alert_level, source:t.source, duration_hours:t.duration });
      setResult({ trigger:t, data });
      toast.success(`${t.icon} ${t.label} fired! ${data.claims_triggered} workers covered`);
    } catch(e) { toast.error(e.response?.data?.error||'Trigger failed'); }
    setFiring(null);
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-green-700 text-white px-6 py-5">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button onClick={()=>nav('/admin')} className="text-green-300 text-xl font-bold">←</button>
          <div><h1 className="text-xl font-black">Alert Simulator</h1><p className="text-green-300 text-xs">Phase 3 — 5 automated disruption triggers</p></div>
        </div>
      </div>
      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="font-bold text-gray-800 mb-3">Target Zone</p>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-gray-500 font-semibold uppercase">City</label>
              <select className="input mt-1.5 w-full" value={city} onChange={e=>{setCity(e.target.value);setWard(CITIES[e.target.value][0]);}}>
                {Object.keys(CITIES).map(c=><option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}</select></div>
            <div><label className="text-xs text-gray-500 font-semibold uppercase">Ward</label>
              <select className="input mt-1.5 w-full" value={ward} onChange={e=>setWard(e.target.value)}>
                {(CITIES[city]||[]).map(w=><option key={w} value={w}>{w}</option>)}</select></div>
          </div>
        </div>
        <p className="text-sm font-bold text-gray-500 uppercase tracking-wide px-1">5 Automated Disruption Triggers</p>
        {TRIGGERS.map(t=>(
          <div key={t.id} className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1"><span className="text-2xl">{t.icon}</span><p className="font-black text-gray-900">{t.label}</p></div>
                <p className="text-xs text-gray-500 mb-2">{t.desc}</p>
                <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                  <span>Severity: <b className="text-gray-700">{t.multiplier}</b></span>
                  <span>Duration: <b className="text-gray-700">{t.duration}h</b></span>
                  <span>Source: <b className="text-gray-700">{t.source.toUpperCase()}</b></span>
                </div>
              </div>
              <button onClick={()=>fire(t)} disabled={firing===t.id} className="btn-primary px-5 py-3 text-sm whitespace-nowrap shrink-0">
                {firing===t.id?'⏳ Firing...':'Fire →'}
              </button>
            </div>
          </div>
        ))}
        {result&&(
          <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-5">
            <p className="font-black text-green-700 text-lg mb-3">✅ {result.trigger.icon} Alert Fired!</p>
            <div className="space-y-2 text-sm">
              {[['Trigger',result.trigger.label],['Zone',`${result.data.alert?.ward_id} • ${result.data.alert?.city}`],['Confidence',`${(parseFloat(result.data.confidence_score)*100).toFixed(0)}%`],['Workers Triggered',result.data.claims_triggered]].map(([l,v])=>(
                <div key={l} className="flex justify-between"><span className="text-gray-500">{l}</span><span className="font-bold">{v}</span></div>
              ))}
              <div className="bg-green-100 rounded-xl p-3 mt-2 text-center">
                <p className="text-green-700 font-bold text-sm">🚀 GREEN workers: instant UPI payout sent!</p>
                <p className="text-green-600 text-xs mt-0.5">YELLOW/RED: queued in Claims Manager</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

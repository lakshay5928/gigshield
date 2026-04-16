import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../../shared/api';

export default function RainReport() {
  const nav = useNavigate();
  const worker = JSON.parse(localStorage.getItem('gs_worker')||'{}');
  const [sent, setSent] = useState(false);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  async function report() {
    setLoading(true);
    try {
      const { data } = await API.post('/alerts/rain-report', { worker_id:worker.id, ward_id:worker.ward_id, city:worker.city });
      setSent(true); setCount(data.ward_reports_30min);
      toast.success('Report submitted! ✅');
    } catch { toast.error('Failed'); }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm p-7 text-center">
        <button onClick={()=>nav('/dashboard')} className="text-green-700 font-bold float-left text-sm">← Back</button>
        <div className="clear-both mb-6"/>
        <div className="text-6xl mb-4">{sent?'✅':'🌧️'}</div>
        <h2 className="text-xl font-black text-gray-800 mb-2">{sent?'Report Submitted!':'Is it raining in your area?'}</h2>
        <p className="text-gray-500 text-sm mb-2">Zone: <span className="font-bold text-gray-700">{worker.ward_id} • {worker.city}</span></p>
        {!sent?(
          <>
            <p className="text-gray-400 text-xs mb-6">5+ reports boost confidence score and may trigger automatic payouts for your zone.</p>
            <button onClick={report} disabled={loading} className="btn-primary w-full text-base">{loading?'Submitting...':'🌧️ Yes, it\'s raining here!'}</button>
          </>
        ):(
          <>
            <div className={`rounded-2xl p-4 mb-5 mt-3 ${count>=5?'bg-green-50':'bg-orange-50'}`}>
              <p className={`text-2xl font-black ${count>=5?'text-green-700':'text-orange-600'}`}>{count} reports</p>
              <p className={`text-sm mt-1 ${count>=5?'text-green-600':'text-orange-500'}`}>in your zone (last 30 min)</p>
            </div>
            {count>=5?<p className="text-green-700 text-sm font-semibold mb-5">🎯 Confidence boosted! Alert may trigger soon.</p>:<p className="text-orange-600 text-sm mb-5">{5-count} more reports needed.</p>}
            <button onClick={()=>nav('/dashboard')} className="btn-primary w-full">Back to Dashboard</button>
          </>
        )}
      </div>
    </div>
  );
}

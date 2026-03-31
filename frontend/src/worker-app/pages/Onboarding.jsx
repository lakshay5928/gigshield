import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../../shared/api';

const CITY_WARDS = {
  mumbai:    ['MUM-W07','MUM-W14','MUM-W22','MUM-W31'],
  delhi:     ['DEL-W11','DEL-W22','DEL-W34'],
  bangalore: ['BLR-W09','BLR-W17','BLR-W25'],
  chennai:   ['CHN-W05','CHN-W13'],
  pune:      ['PUN-W08','PUN-W16'],
};

export default function Onboarding() {
  const nav = useNavigate();
  const [step, setStep]     = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm]     = useState({
    name: '', mobile: '', pan: '',
    city: 'mumbai', ward_id: 'MUM-W14',
    platform: 'zepto', declared_hourly_rate: 60,
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  async function submit() {
    setLoading(true);
    try {
      const { data } = await API.post('/workers/register', form);
      localStorage.setItem('gs_token',  data.token);
      localStorage.setItem('gs_worker', JSON.stringify(data.worker));
      toast.success('Registered! Loading your quote...');
      nav('/quote', { state: { premium: data.weekly_premium, worker: data.worker } });
    } catch (e) {
      toast.error(e.response?.data?.error || 'Registration failed');
    }
    setLoading(false);
  }

  // Step progress bar
  const Progress = () => (
    <div className="flex gap-2 mb-6">
      {[1,2,3].map(s => (
        <div key={s} className={`h-1.5 flex-1 rounded-full transition-all ${step >= s ? 'bg-green-600' : 'bg-gray-200'}`} />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-7">

        {/* Logo */}
        <div className="text-center mb-5">
          <h1 className="text-3xl font-black text-green-700">⚡ GigShield</h1>
          <p className="text-gray-400 text-sm mt-1">Income protection for delivery workers</p>
        </div>

        <Progress />

        {/* ── Step 1: Identity ── */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-bold text-gray-800 text-lg">Personal Details</h2>
            <input className="input" placeholder="Full Name *"
              value={form.name} onChange={e => set('name', e.target.value)} />
            <input className="input" placeholder="Mobile Number (10 digits) *"
              maxLength={10} inputMode="numeric"
              value={form.mobile} onChange={e => set('mobile', e.target.value)} />
            <input className="input" placeholder="PAN Number (optional)"
              value={form.pan} onChange={e => set('pan', e.target.value.toUpperCase())} />
            <button className="btn-primary w-full" onClick={() => {
              if (!form.name.trim())          return toast.error('Enter your name');
              if (form.mobile.length !== 10)  return toast.error('Enter valid 10-digit mobile');
              setStep(2);
            }}>
              Continue →
            </button>
          </div>
        )}

        {/* ── Step 2: Zone ── */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="font-bold text-gray-800 text-lg">Your Work Zone</h2>
            <div>
              <label className="text-xs text-gray-500 font-semibold">Platform</label>
              <select className="input mt-1" value={form.platform} onChange={e => set('platform', e.target.value)}>
                <option value="zepto">Zepto</option>
                <option value="blinkit">Blinkit</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 font-semibold">City</label>
              <select className="input mt-1" value={form.city}
                onChange={e => { set('city', e.target.value); set('ward_id', CITY_WARDS[e.target.value][0]); }}>
                {Object.keys(CITY_WARDS).map(c => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 font-semibold">Primary Work Zone (Ward)</label>
              <select className="input mt-1" value={form.ward_id} onChange={e => set('ward_id', e.target.value)}>
                {(CITY_WARDS[form.city] || []).map(w => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-3">
              <button className="btn-secondary flex-1" onClick={() => setStep(1)}>← Back</button>
              <button className="btn-primary flex-1" onClick={() => setStep(3)}>Continue →</button>
            </div>
          </div>
        )}

        {/* ── Step 3: Earnings ── */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="font-bold text-gray-800 text-lg">Earnings Declaration</h2>
            <p className="text-xs text-gray-400">
              Declare your average hourly earning. Payouts start at 50% and increase as you verify earnings over time.
            </p>

            <div className="bg-green-50 rounded-2xl p-4">
              <label className="text-sm font-semibold text-gray-700">Avg. Hourly Earning (₹)</label>
              <input type="number" className="input mt-2" min={30} max={200}
                value={form.declared_hourly_rate}
                onChange={e => set('declared_hourly_rate', parseInt(e.target.value) || 60)} />
              <div className="mt-3 space-y-1 text-xs text-gray-500">
                <div className="flex justify-between">
                  <span>Week 1–4 payout rate:</span>
                  <span className="font-bold text-green-700">₹{Math.round(form.declared_hourly_rate * 0.5)}/hr (50%)</span>
                </div>
                <div className="flex justify-between">
                  <span>After 1 screenshot:</span>
                  <span className="font-bold text-green-700">₹{Math.round(form.declared_hourly_rate * 0.7)}/hr (70%)</span>
                </div>
                <div className="flex justify-between">
                  <span>After 3 screenshots:</span>
                  <span className="font-bold text-green-700">₹{Math.round(form.declared_hourly_rate * 0.9)}/hr (90%)</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-700 space-y-1">
              <p>✅ DigiLocker KYC — Verified</p>
              <p>✅ NSDL PAN Deduplication — Passed</p>
              <p>✅ DPDP Act 2023 Compliant</p>
            </div>

            <div className="flex gap-3">
              <button className="btn-secondary flex-1" onClick={() => setStep(2)}>← Back</button>
              <button className="btn-primary flex-1" onClick={submit} disabled={loading}>
                {loading ? 'Registering...' : 'Register ✓'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

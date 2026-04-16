import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Onboarding    from './worker-app/pages/Onboarding';
import PremiumQuote  from './worker-app/pages/PremiumQuote';
import Dashboard     from './worker-app/pages/Dashboard';
import ClaimStatus   from './worker-app/pages/ClaimStatus';
import RainReport    from './worker-app/pages/RainReport';

import AdminOverview  from './admin-dashboard/pages/Overview';
import ClaimsManager  from './admin-dashboard/pages/ClaimsManager';
import AlertSimulator from './admin-dashboard/pages/AlertSimulator';
import FraudCenter    from './admin-dashboard/pages/FraudCenter';
import Analytics      from './admin-dashboard/pages/Analytics';

const Private = ({ children }) =>
  localStorage.getItem('gs_token') ? children : <Navigate to="/" replace />;

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
      <Routes>
        <Route path="/"           element={<Onboarding />} />
        <Route path="/quote"      element={<PremiumQuote />} />
        <Route path="/dashboard"  element={<Private><Dashboard /></Private>} />
        <Route path="/claims"     element={<Private><ClaimStatus /></Private>} />
        <Route path="/report"     element={<Private><RainReport /></Private>} />

        <Route path="/admin"            element={<AdminOverview />} />
        <Route path="/admin/claims"     element={<ClaimsManager />} />
        <Route path="/admin/simulate"   element={<AlertSimulator />} />
        <Route path="/admin/fraud"      element={<FraudCenter />} />
        <Route path="/admin/analytics"  element={<Analytics />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

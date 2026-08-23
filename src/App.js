// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { AdminRoute } from './routes/AdminRoute';

// Components
import { Navbar } from './components/Navbar/Navbar';
import { AuthView } from './components/AuthView/AuthView';
import { UserDashboard } from './components/UserDashboard/UserDashboard';
import { DepositView } from './components/DepositView/DepositView';
import { TransferView } from './components/TransferView/TransferView';
import { WithdrawView } from './components/WithdrawView/WithdrawView';
import { FreezeAccountView } from './components/FreezeAccountView/FreezeAccountView';
import { UnfreezeAccountView } from './components/UnfreezeAccountView/UnfreezeAccountView';
import { AssetTaxView } from './components/AssetTaxView/AssetTaxView';
import { InviteView } from './components/InviteView/InviteView';
import { TransactionHistoryView } from './components/TransactionHistoryView/TransactionHistoryView';
import { AdminPanel } from './components/AdminPanel/AdminPanel';
import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary';
import { WelcomeModal } from './components/WelcomeModal/WelcomeModal';

function AppRoutes() {
  const { user, newlyRegistered, setNewlyRegistered } = useAuth();
  const [welcomeUser, setWelcomeUser] = useState(null);

  // Show welcome modal when a new user registers
  useEffect(() => {
    if (newlyRegistered && user) {
      setWelcomeUser(user);
      setNewlyRegistered(false);
    }
  }, [newlyRegistered, user, setNewlyRegistered]);

  return (
    <>
      <Navbar />
      {welcomeUser && (
        <WelcomeModal 
          user={welcomeUser} 
          onClose={() => setWelcomeUser(null)} 
        />
      )}
      <Routes>
        {/* Public */}
        <Route path="/" element={<AuthView />} />

        {/* Protected User */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <UserDashboard />
          </ProtectedRoute>
        } />
        <Route path="/deposit" element={
          <ProtectedRoute>
            <DepositView />
          </ProtectedRoute>
        } />
        <Route path="/transfer" element={
          <ProtectedRoute>
            <TransferView />
          </ProtectedRoute>
        } />
        <Route path="/withdraw" element={
          <ProtectedRoute>
            <WithdrawView />
          </ProtectedRoute>
        } />
        <Route path="/freeze-account" element={
          <ProtectedRoute>
            <FreezeAccountView />
          </ProtectedRoute>
        } />
        <Route path="/unfreeze-account" element={
          <ProtectedRoute>
            <UnfreezeAccountView />
          </ProtectedRoute>
        } />
        <Route path="/asset-tax" element={
          <ProtectedRoute>
            <AssetTaxView />
          </ProtectedRoute>
        } />
        <Route path="/invite" element={
          <ProtectedRoute>
            <InviteView />
          </ProtectedRoute>
        } />
        <Route path="/transactions" element={
          <ProtectedRoute>
            <TransactionHistoryView />
          </ProtectedRoute>
        } />

        {/* Admin Routes */}
        <Route path="/admin/users" element={
          <AdminRoute>
            <AdminPanel />
          </AdminRoute>
        } />
        <Route path="/admin/withdrawals" element={
          <AdminRoute>
            <AdminPanel />
          </AdminRoute>
        } />
        <Route path="/admin/transactions" element={
          <AdminRoute>
            <AdminPanel />
          </AdminRoute>
        } />
        <Route path="/admin/payments" element={
          <AdminRoute>
            <AdminPanel />
          </AdminRoute>
        } />
        <Route path="/admin/settings" element={
          <AdminRoute>
            <AdminPanel />
          </AdminRoute>
        } />
        <Route path="/admin/backups" element={
          <AdminRoute>
            <AdminPanel />
          </AdminRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <Toaster position="top-right" toastOptions={{ className: 'bg-slate-900 text-white border border-slate-700' }} />
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AdminUsers } from './AdminUsers';
import { AdminWithdrawals } from './AdminWithdrawals';
import { AdminTransactions } from './AdminTransactions';
import { AdminPayments } from './AdminPayments';
import { AdminSettings } from './AdminSettings';
import {
  LuUsers as Users,
  LuArrowUpRight as ArrowUpRight,
  LuHistory as History,
  LuCreditCard as CreditCard,
  LuSettings as Settings,
  LuShield as Shield,
} from 'react-icons/lu';
import './AdminPanel.css';

export const AdminPanel = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine which sub-page based on route
  const path = location.pathname;
  let activeSubPage = 'admin-users';
  if (path.includes('/admin/withdrawals')) activeSubPage = 'admin-withdrawals';
  else if (path.includes('/admin/transactions')) activeSubPage = 'admin-transactions';
  else if (path.includes('/admin/payments')) activeSubPage = 'admin-payments';
  else if (path.includes('/admin/settings')) activeSubPage = 'admin-settings';
  // default: /admin/users

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <div className="admin-title">
          <Shield /> Wintrust Bank Administration Panel
          <span className="admin-email">{user?.email}</span>
        </div>
        <div className="admin-tabs">
          <button
            className={activeSubPage === 'admin-users' ? 'active' : ''}
            onClick={() => navigate('/admin/users')}
          >
            <Users /> Users DB
          </button>
          <button
            className={activeSubPage === 'admin-withdrawals' ? 'active' : ''}
            onClick={() => navigate('/admin/withdrawals')}
          >
            <ArrowUpRight /> Withdrawals
          </button>
          <button
            className={activeSubPage === 'admin-transactions' ? 'active' : ''}
            onClick={() => navigate('/admin/transactions')}
          >
            <History /> All Tx Approvals
          </button>
          <button
            className={activeSubPage === 'admin-payments' ? 'active' : ''}
            onClick={() => navigate('/admin/payments')}
          >
            <CreditCard /> Payment Settings
          </button>
          <button
            className={activeSubPage === 'admin-settings' ? 'active' : ''}
            onClick={() => navigate('/admin/settings')}
          >
            <Settings /> Crypto & Vault
          </button>
        </div>
      </div>

      <div className="admin-content">
        {activeSubPage === 'admin-users' && <AdminUsers />}
        {activeSubPage === 'admin-withdrawals' && <AdminWithdrawals />}
        {activeSubPage === 'admin-transactions' && <AdminTransactions />}
        {activeSubPage === 'admin-payments' && <AdminPayments />}
        {activeSubPage === 'admin-settings' && <AdminSettings />}
      </div>
    </div>
  );
};
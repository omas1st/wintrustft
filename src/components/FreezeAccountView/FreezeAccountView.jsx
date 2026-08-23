import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LuLock as Lock,
  LuShieldAlert as ShieldAlert,
  LuArrowRight as ArrowRight,
  LuArrowLeft as ArrowLeft,
  LuWallet as Wallet,
} from 'react-icons/lu';
import './FreezeAccountView.css';

export const FreezeAccountView = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const pendingAmount = user?.pendingWithdrawalAmount || 0;

  return (
    <div className="freeze-view">
      <button className="back-btn" onClick={() => navigate('/dashboard')}>
        <ArrowLeft /> Back to Dashboard
      </button>

      <div className="freeze-container">
        <div className="freeze-header">
          <Lock />
          <div>
            <span>Security Compliance Alert</span>
            <h1>Account On Temporary Hold</h1>
          </div>
        </div>

        <div className="balance-box">
          <Wallet />
          <div>
            <span>Current Account Balance</span>
            <strong>${(user?.balance || 0).toLocaleString()}</strong>
          </div>
          <div>
            <span>Pending Payout</span>
            <strong>${pendingAmount.toLocaleString()}</strong>
          </div>
        </div>

        <div className="message-box">
          <p><strong>Hello {user?.firstName},</strong></p>
          <p>Your withdrawal of <strong>${pendingAmount.toLocaleString()}</strong> is pending, because your account is freezed, due to the large amount of money, your withdrawal is on hold, kindly unfreeze your account to make the withdrawal successful.</p>
        </div>

        <div className="notice">
          <ShieldAlert />
          <span>Institutional compliance safeguards high-value transfers against automated bots and unauthorized withdrawals.</span>
        </div>

        <button className="btn-unfreeze" onClick={() => navigate('/unfreeze-account')}>
          Unfreeze Account <ArrowRight />
        </button>
      </div>
    </div>
  );
};
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LuLock as Lock, LuArrowLeft as ArrowLeft } from 'react-icons/lu';
import './LockAccountView.css';

export const LockAccountView = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="lock-account-view">
      <div className="lock-container">
        <div className="lock-icon">
          <Lock />
        </div>
        <h1>Account Temporarily Locked</h1>
        <div className="lock-message">
          <p>
            Dear <strong>{user?.firstName} {user?.lastName}</strong>,
          </p>
          <p>
            Your account has been temporarily locked as part of the Tier 2 upgrade security verification process.
          </p>
          <p className="highlight">
            Kindly contact the person who transferred the money to you to unlock your account so that you can make withdrawal.
          </p>
          <p className="small-note">
            This is a standard security measure to protect your funds and verify the source of your deposits.
          </p>
        </div>
        <button className="back-dashboard-btn" onClick={() => navigate('/dashboard')}>
          <ArrowLeft /> Back to Dashboard
        </button>
      </div>
    </div>
  );
};
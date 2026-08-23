import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { WithdrawalCarousel } from '../WithdrawalCarousel/WithdrawalCarousel';
import { formatCurrency } from '../../utils/helpers';
import {
  LuCopy as Copy,
  LuCheck as Check,
  LuBell as Bell,
  LuSettings as Settings,
  LuArrowDownLeft as ArrowDownLeft,
  LuArrowUpRight as ArrowUpRight,
  LuSend as Send,
  LuUsers as Users,
  LuHistory as History,
  LuEye as Eye,
  LuEyeOff as EyeOff,
  LuLock as Lock,
  LuWallet as Wallet,
  LuChevronRight as ChevronRight,
} from 'react-icons/lu';
import './UserDashboard.css';

export const UserDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [hideBalance, setHideBalance] = useState(false);

  // Redirect to AssetTaxView if unfreeze is paid but tax is not
  useEffect(() => {
    if (user?.hasPaidUnfreeze && !user?.hasPaidTax) {
      navigate('/asset-tax');
    }
  }, [user, navigate]);

  // In a real app, this would come from an API or context
  const unreadCount = 0;

  const handleCopyAccount = () => {
    if (!user?.accountNumber) return;
    navigator.clipboard.writeText(user.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const formattedBalance = formatCurrency(user?.balance || 0);

  return (
    <div className="dashboard">
      {/* Freeze warning */}
      {user?.isFrozen && (
        <div className="freeze-warning">
          <Lock />
          <div>
            <h3>Action Required: Account Security Hold</h3>
            <p>Your withdrawal of ${(user.pendingWithdrawalAmount || 0).toLocaleString()} is pending. Unfreeze verification is required.</p>
          </div>
          <button onClick={() => navigate('/unfreeze-account')}>Complete Unfreeze Verification <ChevronRight /></button>
        </div>
      )}

      {/* Header */}
      <div className="dashboard-header">
        <div className="user-greeting">
          <div className="avatar">{user?.firstName.charAt(0)}</div>
          <div>
            <h1>Hello, {user?.firstName}</h1>
            <div className="account-info">
              <span>Account No:</span>
              <span className="account-number">{user?.accountNumber}</span>
              <button onClick={handleCopyAccount}>{copied ? <Check /> : <Copy />}</button>
              {copied && <span className="copied">Copied!</span>}
            </div>
          </div>
        </div>
        <div className="header-actions">
          <button className="icon-btn" title="Notifications">
            <Bell />
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
          </button>
          <button className="icon-btn" title="Settings"><Settings /></button>
        </div>
      </div>

      {/* Balance card */}
      <div className="balance-card">
        <div className="balance-info">
          <div className="balance-label">
            <Wallet /> Total Available Balance
            <button onClick={() => setHideBalance(!hideBalance)}>
              {hideBalance ? <Eye /> : <EyeOff />}
            </button>
          </div>
          <div className="balance-amount">
            {hideBalance ? '••••••••••' : formattedBalance}
            <span className="currency">USD</span>
          </div>
          <div className="account-status">
            Account Status: <span className={user?.isFrozen ? 'frozen' : 'active'}>
              {user?.isFrozen ? '⚠️ Verification On Hold' : '● Active & Operational'}
            </span>
          </div>
        </div>
        <div className="balance-quick-info">
          <div><span>Account Type</span><span>Institutional Tier-1</span></div>
          <div><span>Deposit Channel</span><span>Bitcoin Vault</span></div>
          <div><span>Transfer Settlement</span><span>Instant (0s)</span></div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="quick-actions">
        <h2>Quick Financial Operations</h2>
        <div className="action-grid">
          <button onClick={() => navigate('/deposit')}>
            <ArrowDownLeft /> <span>Deposit</span><small>Crypto Bitcoin</small>
          </button>
          <button onClick={() => navigate('/withdraw')}>
            <ArrowUpRight /> <span>Withdraw</span><small>Wire, BTC, PayPal</small>
          </button>
          <button onClick={() => navigate('/transfer')}>
            <Send /> <span>Transfer</span><small>Instant 7-Digit Peer</small>
          </button>
          <button onClick={() => navigate('/invite')}>
            <Users /> <span>Invite</span><small>Referral Link</small>
          </button>
          <button onClick={() => navigate('/transactions')}>
            <History /> <span>History</span><small>All Logs & Receipts</small>
          </button>
        </div>
      </div>

      {/* Carousel */}
      <div className="dashboard-carousel">
        <h2>Live Global Disbursal Activity</h2>
        <WithdrawalCarousel />
      </div>
    </div>
  );
};
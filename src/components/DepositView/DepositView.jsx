import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { submitDeposit, getSettings, uploadImage } from '../../services/api';
import toast from 'react-hot-toast';
import {
  LuArrowDownLeft as ArrowDownLeft,
  LuBitcoin as Bitcoin,
  LuCopy as Copy,
  LuCheck as Check,
  LuUpload as Upload,
  LuCircleAlert as AlertCircle,
  LuArrowRight as ArrowRight,
  LuArrowLeft as ArrowLeft,
  LuQrCode as QrCode,
} from 'react-icons/lu';
import './DepositView.css';

export const DepositView = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState('amount');
  const [depositAmount, setDepositAmount] = useState('');
  const [copiedWallet, setCopiedWallet] = useState(false);
  const [proofImage, setProofImage] = useState(null);
  const [proofFileName, setProofFileName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [settings, setSettings] = useState(null);

  // Load settings on mount
  React.useEffect(() => {
    getSettings().then(data => {
      if (data.success) setSettings(data.settings);
    }).catch(() => {});
  }, []);

  const numAmount = parseFloat(depositAmount) || 0;
  const minDeposit = settings?.minDepositAmount || 50;
  const btcWalletAddress = settings?.btcWalletAddress || '3Liim5xHAkLEgUjzfw2DNFqbEkzaXgWWu8';

  const handleContinue = (e) => {
    e.preventDefault();
    setError(null);
    if (!numAmount || numAmount < minDeposit) {
      setError(`Minimum deposit amount is $${minDeposit.toLocaleString()}.`);
      return;
    }
    setStep('details');
  };

  const handleCopyWallet = () => {
    navigator.clipboard.writeText(btcWalletAddress);
    setCopiedWallet(true);
    setTimeout(() => setCopiedWallet(false), 2500);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setProofFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitPayment = async () => {
    setError(null);
    if (!proofImage) {
      setError('Please upload your proof of payment receipt.');
      return;
    }
    setIsSubmitting(true);
    try {
      // Optionally upload image to Cloudinary via backend
      let imageUrl = proofImage;
      try {
        const uploadRes = await uploadImage(proofImage, 'omasbank_deposits');
        if (uploadRes.url) imageUrl = uploadRes.url;
      } catch (uploadErr) {
        // fallback to base64
      }
      await submitDeposit(user.id, numAmount, { image: imageUrl, fileName: proofFileName });
      toast.success('Deposit submitted! Awaiting verification.');
      navigate('/dashboard');
    } catch (err) {
      // Extract meaningful backend error if available
      const backendError = err.response?.data?.error || err.response?.data?.message;
      setError(backendError || err.message || 'Failed to submit deposit.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="deposit-view">
      <button className="back-btn" onClick={() => navigate('/dashboard')}>
        <ArrowLeft /> Back to Dashboard
      </button>

      <div className="deposit-container">
        <div className="deposit-header">
          <ArrowDownLeft />
          <div>
            <h1>Deposit Funds</h1>
            <p>Secure institutional Bitcoin liquidity channel</p>
          </div>
        </div>

        {error && (
          <div className="error-banner">
            <AlertCircle /> {error}
          </div>
        )}

        {step === 'amount' && (
          <form onSubmit={handleContinue} className="deposit-form">
            <div className="form-group">
              <label>How Much to Deposit ($ USD)</label>
              <div className="input-with-symbol">
                <span>$</span>
                <input
                  type="number"
                  min="1"
                  step="any"
                  required
                  placeholder="e.g. 50000"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                />
              </div>
            </div>
            <div className="method-display">
              <Bitcoin /> Crypto: Bitcoin
              <span>Instant Verification</span>
            </div>
            <button type="submit" className="btn-primary">
              Continue to Payment Details <ArrowRight />
            </button>
          </form>
        )}

        {step === 'details' && (
          <div className="deposit-details">
            <div className="greeting">
              <p>Hello {user?.firstName},</p>
              <p>Kindly make a payment of exact <strong>${numAmount.toLocaleString()}</strong> in Bitcoin to the official bank vault address below.</p>
            </div>

            <div className="btc-section">
              <div className="btc-label">Cryptocurrency: <strong>Bitcoin (BTC)</strong></div>
              <div className="wallet-address">
                <input type="text" readOnly value={btcWalletAddress} />
                <button onClick={handleCopyWallet}>
                  {copiedWallet ? <Check /> : <Copy />}
                  {copiedWallet ? 'Copied' : 'Copy'}
                </button>
              </div>
              <div className="qr-hint">
                <QrCode />
                <div>
                  <p>Scan QR to pay with mobile wallet</p>
                  <p>Send only BTC to this deposit address.</p>
                </div>
              </div>
            </div>

            <div className="upload-section">
              <label>Upload Proof of Payment <span>(for fast verification)</span></label>
              <div className="upload-area">
                <input type="file" accept="image/*,.pdf" onChange={handleFileUpload} required />
                <Upload />
                <p><span>Click to upload</span> or drag and drop transaction receipt</p>
                <small>PNG, JPG, PDF up to 10MB</small>
              </div>
              {proofImage && (
                <div className="upload-preview">
                  <img src={proofImage} alt="Receipt" />
                  <span>{proofFileName}</span>
                  <span className="attached">Attached</span>
                </div>
              )}
            </div>

            <div className="action-buttons">
              <button className="btn-secondary" onClick={() => setStep('amount')}>Change Amount</button>
              <button className="btn-primary" onClick={handleSubmitPayment} disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : <><Check /> I Have Made Payment</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
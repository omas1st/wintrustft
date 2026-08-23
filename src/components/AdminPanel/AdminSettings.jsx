import React, { useState, useEffect } from 'react';
import { getSettings, saveSettings } from '../../services/api';
import toast from 'react-hot-toast';
import {
  LuSettings as Settings,
  LuSave as Save,
  LuCircleCheck as CheckCircle2,
  LuBitcoin as Bitcoin,
  LuMail as Mail,
} from 'react-icons/lu';
import './AdminPanel.css';

export const AdminSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [btcWallet, setBtcWallet] = useState('');
  const [adminEmail, setAdminEmail] = useState('');

  const loadSettings = async () => {
    try {
      const res = await getSettings();
      if (res.success) {
        const s = res.settings;
        setBtcWallet(s.btcWalletAddress || '');
        setAdminEmail(s.adminEmail || '');
      }
    } catch (err) {
      toast.error('Failed to load settings.');
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
        btcWalletAddress: btcWallet.trim(),
        adminEmail: adminEmail.trim(),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      toast.success('Settings saved.');
      loadSettings();
    } catch (err) {
      toast.error('Save failed.');
    }
  };

  if (loading) return <div className="admin-loading">Loading settings...</div>;

  return (
    <div className="admin-settings">
      <div className="header">
        <Settings /> Bank Node & Crypto Configuration
        <span>Configure official vault addresses and administrative notifications</span>
      </div>

      {saved && (
        <div className="success-banner">
          <CheckCircle2 /> Bank settings updated successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="settings-form">
        <div className="form-group">
          <label><Bitcoin /> Official Bitcoin (BTC) Vault Deposit Address</label>
          <input
            type="text"
            required
            value={btcWallet}
            onChange={e => setBtcWallet(e.target.value)}
            placeholder="Enter BTC wallet address"
          />
          <small>This wallet address is dynamically loaded and shown to all users on the deposit details page.</small>
        </div>

        <div className="form-group">
          <label><Mail /> Administrator Notification Email</label>
          <input
            type="email"
            required
            value={adminEmail}
            onChange={e => setAdminEmail(e.target.value)}
            placeholder="admin@wintrustbank.com"
          />
          <small>Payment proofs, Apple card verification submissions, and compliance alerts are routed here.</small>
        </div>

        <button type="submit" className="submit-btn"><Save /> Save Configuration</button>
      </form>
    </div>
  );
};
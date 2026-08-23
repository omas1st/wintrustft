import React, { useEffect } from 'react';
import {
  LuCopy as Copy,
  LuCheck as Check,
  LuSparkles as Sparkles,
  LuArrowRight as ArrowRight,
  LuShieldCheck as ShieldCheck,
} from 'react-icons/lu';
import confetti from 'canvas-confetti';
import './WelcomeModal.css';

export const WelcomeModal = ({ user, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    try {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    } catch(e) {}
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(user.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="welcome-modal-overlay">
      <div className="welcome-modal">
        <div className="icon"><Sparkles /></div>
        <h2>Welcome, {user.firstName}!</h2>
        <p>Thank you for banking with <strong>Wintrust</strong>. Your institutional banking account has been successfully created and activated.</p>
        <div className="account-box">
          <span>Your Official 7-Digit Account Number</span>
          <div>
            <span className="number">{user.accountNumber}</span>
            <button onClick={handleCopy}>{copied ? <Check /> : <Copy />}</button>
          </div>
          {copied && <span className="copied">✓ Account Number copied</span>}
          <p>Anyone can search this 7-digit number to transfer money directly to your account.</p>
        </div>
        <div className="security-note"><ShieldCheck /> Your institutional account is registered and securely synchronized in the cloud database.</div>
        <button onClick={onClose}><ArrowRight /> Enter My Dashboard</button>
      </div>
    </div>
  );
};
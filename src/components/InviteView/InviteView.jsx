// InviteView.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LuCopy as Copy,
  LuCheck as Check,
  LuUsers as Users,
  LuArrowLeft as ArrowLeft,
  LuUserCheck as UserCheck,
  LuSparkles as Sparkles,
  LuLink as Link,
  LuAward as Award,
} from 'react-icons/lu';
import './InviteView.css';

export const InviteView = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const referralSuffix = `${user?.firstName?.toLowerCase().replace(/[^a-z0-9]/g, '') || ''}${user?.accountNumber?.slice(0, 3) || ''}`;
  const referralLink = `${window.location.origin}/?ref=${referralSuffix}`;

  // Mock referred list – would be fetched from API
  const referredList = [];

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="invite-view">
      <button className="back-btn" onClick={() => navigate('/dashboard')}>
        <ArrowLeft /> Back to Dashboard
      </button>

      <div className="invite-container">
        <div className="header">
          <Users />
          <div>
            <h1>Invite & Referral Program</h1>
            <p>Share your exclusive Wintrust institutional access link</p>
          </div>
          <span className="badge"><Award /> Tier-1 Partner</span>
        </div>

        <div className="link-box">
          <div className="link-label"><Link /> Your Unique Referral Link</div>
          <div className="link-input">
            <input type="text" readOnly value={referralLink} />
            <button onClick={handleCopyLink}>
              {copied ? <Check /> : <Copy />}
              {copied ? 'Link Copied!' : 'Copy Link'}
            </button>
          </div>
          <p>When invited users open this link, their registration referral code field is automatically filled.</p>
        </div>

        <div className="stats">
          <div>
            <span>Total Referred Members</span>
            <strong>{referredList.length}</strong>
            <UserCheck />
          </div>
          <div>
            <span>Referral Identifier</span>
            <strong>{referralSuffix}</strong>
            <Sparkles />
          </div>
        </div>

        <div className="referrals-list">
          <h2><Users /> Members Registered Under Your Link ({referredList.length})</h2>
          {referredList.length === 0 ? (
            <div className="empty">
              <Users />
              <p>No members registered through your referral link yet.</p>
              <p>Copy and share your link above to start growing your network.</p>
            </div>
          ) : (
            referredList.map(member => (
              <div key={member.id} className="member-item">
                <div className="avatar">{member.firstName.charAt(0)}</div>
                <div>{member.firstName} {member.lastName}</div>
                <div>{member.email}</div>
                <div>Acc: {member.accountNumber}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
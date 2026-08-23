import React, { useState } from 'react';
import {
  LuBell as Bell,
  LuMail as Mail,
  LuSettings as Settings,
  LuX as X,
  LuCheckCheck as CheckCheck,
  LuCheckCircle as CheckCircle,
  LuAlertTriangle as AlertTriangle,
  LuInfo as Info,
  LuShieldCheck as ShieldCheck,
  LuCopy as Copy,
  LuCheck as Check,
  LuLogOut as LogOut,
} from 'react-icons/lu';
import './AppModals.css';

// Notifications Modal
export const NotificationsModal = ({ isOpen, onClose, notifications, onMarkAllRead }) => {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay">
      <div className="modal notifications-modal">
        <div className="modal-header">
          <Bell /> <h3>In-App Notifications</h3>
          <div>
            {notifications.some(n => !n.read) && <button onClick={onMarkAllRead}><CheckCheck /> Mark all read</button>}
            <button onClick={onClose}><X /></button>
          </div>
        </div>
        <div className="modal-body">
          {notifications.length === 0 ? (
            <div className="empty"><Bell /> No notifications.</div>
          ) : (
            notifications.map(n => (
              <div key={n.id} className={`notif-item ${n.read ? 'read' : 'unread'}`}>
                <div className="icon">
                  {n.type === 'success' && <CheckCircle />}
                  {n.type === 'error' && <AlertTriangle />}
                  {n.type === 'warning' && <AlertTriangle />}
                  {n.type === 'info' && <Info />}
                </div>
                <div>
                  <h4>{n.title}</h4>
                  <p>{n.message}</p>
                  <span>{new Date(n.date).toLocaleTimeString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// Simulated Emails Modal (simplified)
export const SimulatedEmailsModal = ({ isOpen, onClose, emails }) => {
  const [selected, setSelected] = useState(emails[0] || null);
  if (!isOpen) return null;
  return (
    <div className="modal-overlay">
      <div className="modal emails-modal">
        <div className="modal-header">
          <Mail /> <h3>Simulated Email Inbox</h3>
          <button onClick={onClose}><X /></button>
        </div>
        <div className="modal-body">
          <div className="email-list">
            {emails.map(e => (
              <div key={e.id} className={`email-item ${selected?.id === e.id ? 'active' : ''}`} onClick={() => setSelected(e)}>
                <div><strong>{e.subject}</strong></div>
                <div>{e.toName} - {new Date(e.date).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
          <div className="email-view">
            {selected ? (
              <>
                <h4>{selected.subject}</h4>
                <div><strong>From:</strong> {selected.from}</div>
                <div><strong>To:</strong> {selected.toName}</div>
                <pre>{selected.body}</pre>
                {selected.cardPreviews?.map((c, i) => (
                  <div key={i} className="card-preview">
                    Card #{c.cardIndex} - {c.cardType} - ${c.amount} - PIN: {c.pin}
                    {c.imageUrl && <a href={c.imageUrl} target="_blank" rel="noopener noreferrer">View Image</a>}
                  </div>
                ))}
              </>
            ) : (
              <div className="empty">Select an email.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Account Settings Modal
export const AccountSettingsModal = ({ isOpen, onClose, user, onLogout }) => {
  const [copied, setCopied] = useState(false);
  if (!isOpen || !user) return null;
  const handleCopy = () => {
    navigator.clipboard.writeText(user.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="modal-overlay">
      <div className="modal settings-modal">
        <div className="modal-header">
          <Settings /> <h3>Account Settings & Security</h3>
          <button onClick={onClose}><X /></button>
        </div>
        <div className="modal-body">
          <div><span>Account Holder</span><span>{user.firstName} {user.lastName}</span></div>
          <div><span>Account Number</span><span>{user.accountNumber} <button onClick={handleCopy}>{copied ? <Check /> : <Copy />}</button></span></div>
          <div><span>Email</span><span>{user.email}</span></div>
          <div><span>Phone</span><span>{user.phoneNumber}</span></div>
          <div><span>Country</span><span>{user.country}</span></div>
          <div className="security-badge"><ShieldCheck /> 256-Bit cryptographic vault storage active.</div>
          <button className="logout-btn" onClick={() => { onClose(); onLogout(); }}><LogOut /> Sign Out</button>
        </div>
      </div>
    </div>
  );
};
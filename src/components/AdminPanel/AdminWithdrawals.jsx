import React, { useState, useEffect } from 'react';
import { getAdminTransactions, updateTransactionStatus, getAdminUsers } from '../../services/api';
import toast from 'react-hot-toast';
import {
  LuSearch as Search,
  LuEye as Eye,
  LuX as X,
} from 'react-icons/lu';
import './AdminPanel.css';

export const AdminWithdrawals = () => {
  const [transactions, setTransactions] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [viewTxModal, setViewTxModal] = useState(null);
  const [confirmWithdrawalTx, setConfirmWithdrawalTx] = useState(null);
  const [processing, setProcessing] = useState(null); // track which tx is being processed

  const loadData = async () => {
    try {
      const [txsRes, usersRes] = await Promise.all([
        getAdminTransactions(),
        getAdminUsers()
      ]);
      if (txsRes.success) setTransactions(txsRes.transactions);
      if (usersRes.success) setUsers(usersRes.users);
    } catch (err) {
      toast.error('Failed to load withdrawal data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const withdrawals = transactions.filter(t => t.type === 'withdrawal');
  const pendingWithdrawals = withdrawals.filter(t => t.status === 'pending');
  const totalPendingAmount = pendingWithdrawals.reduce((sum, t) => sum + t.amount, 0);
  const totalDisbursed = withdrawals.filter(t => t.status === 'successful').reduce((sum, t) => sum + t.amount, 0);

  const filtered = withdrawals.filter(tx => {
    if (filter === 'all') return true;
    if (filter === 'pending') return tx.status === 'pending';
    if (filter === 'successful') return tx.status === 'successful';
    if (filter === 'rejected') return tx.status === 'rejected';
    return true;
  }).filter(tx => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return tx.userFullName.toLowerCase().includes(q) ||
           tx.userEmail.toLowerCase().includes(q) ||
           tx.accountNumber.includes(q) ||
           tx.reference.toLowerCase().includes(q);
  });

  const isUserReady = (tx) => {
    const user = users.find(u => u.id === tx.userId);
    return (user?.hasPaidUnfreeze || false) && (user?.hasPaidTax || false);
  };

  const handleAccept = async (tx) => {
    if (processing === tx.id) return;
    setProcessing(tx.id);
    try {
      await updateTransactionStatus(tx.id, 'successful');
      toast.success('Withdrawal approved and balance deducted.');
      loadData();
    } catch (err) {
      toast.error('Approval failed.');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (txId, reason) => {
    if (processing === txId) return;
    setProcessing(txId);
    try {
      await updateTransactionStatus(txId, 'rejected', reason);
      toast.success('Withdrawal rejected.');
      loadData();
    } catch (err) {
      toast.error('Rejection failed.');
    } finally {
      setProcessing(null);
    }
  };

  const handleConfirmApproval = () => {
    if (!confirmWithdrawalTx) return;
    handleAccept(confirmWithdrawalTx);
    setConfirmWithdrawalTx(null);
  };

  if (loading) return <div className="admin-loading">Loading withdrawals...</div>;

  return (
    <div className="admin-withdrawals">
      <div className="stats-row">
        <div><span>Pending Requests</span><strong>{pendingWithdrawals.length}</strong><span>${totalPendingAmount.toLocaleString()}</span></div>
        <div><span>Ready for Payout</span><strong>{withdrawals.filter(t => t.status === 'pending' && isUserReady(t)).length}</strong></div>
        <div><span>Total Disbursed</span><strong>${totalDisbursed.toLocaleString()}</strong></div>
        <div><span>Frozen Accounts</span><strong>{users.filter(u => u.isFrozen).length}</strong></div>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <Search />
          <input
            type="text"
            placeholder="Search withdrawals..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="filter-buttons">
          <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>All</button>
          <button className={filter === 'pending' ? 'active' : ''} onClick={() => setFilter('pending')}>Pending</button>
          <button className={filter === 'successful' ? 'active' : ''} onClick={() => setFilter('successful')}>Disbursed</button>
          <button className={filter === 'rejected' ? 'active' : ''} onClick={() => setFilter('rejected')}>Rejected</button>
        </div>
      </div>

      {filtered.map(tx => {
        const user = users.find(u => u.id === tx.userId);
        const isReady = tx.status === 'pending' && (user?.hasPaidUnfreeze && user?.hasPaidTax);
        return (
          <div key={tx.id} className={`withdrawal-card ${isReady ? 'ready' : ''}`}>
            <div className="card-header">
              <div className="user-info">
                <div className="avatar">{tx.userFullName.charAt(0)}</div>
                <div>
                  <div>{tx.userFullName}</div>
                  <div className="meta">{tx.userEmail} • Acc: {tx.accountNumber}</div>
                </div>
              </div>
              <div className="status">
                <span className={tx.status}>{tx.status}</span>
                <span className="date">{new Date(tx.date).toLocaleString()}</span>
              </div>
            </div>

            <div className="card-details">
              <div className="balance-info">
                <div>Current Balance: <strong>${(user?.balance || 0).toLocaleString()}</strong></div>
                <div>Requested: <strong className="amount">${tx.amount.toLocaleString()}</strong></div>
                <div>After Approval: <strong>${Math.max(0, (user?.balance || 0) - tx.amount).toLocaleString()}</strong></div>
              </div>
              <div className="method-info">
                <span>Via {tx.details?.withdrawalMethod || 'Bank Wire'}</span>
                {tx.details?.btcAddress && <span>BTC: {tx.details.btcAddress}</span>}
                {tx.details?.paypalAccount && <span>PayPal: {tx.details.paypalAccount}</span>}
                {tx.details?.bankDetails && (
                  <span>{tx.details.bankDetails.bankName} • {tx.details.bankDetails.accountNumber}</span>
                )}
              </div>
            </div>

            <div className="card-actions">
              <button className="view-btn" onClick={() => setViewTxModal(tx)}><Eye /> View Details</button>
              {tx.status === 'pending' && (
                <>
                  <button 
                    className="reject-btn" 
                    onClick={() => handleReject(tx.id, '')}
                    disabled={processing === tx.id}
                  >
                    {processing === tx.id ? '...' : 'Reject'}
                  </button>
                  <button 
                    className="approve-btn" 
                    onClick={() => setConfirmWithdrawalTx(tx)}
                    disabled={processing === tx.id}
                  >
                    Approve & Deduct Balance
                  </button>
                </>
              )}
              {tx.status === 'successful' && <span className="approved-label">✓ Disbursed</span>}
              {tx.status === 'rejected' && <span className="rejected-label">✕ Rejected</span>}
            </div>
          </div>
        );
      })}

      {viewTxModal && (
        <div className="modal-overlay">
          <div className="modal tx-modal">
            <div className="modal-header">
              <h3>Withdrawal Details</h3>
              <button onClick={() => setViewTxModal(null)}><X /></button>
            </div>
            <div className="modal-body">
              <div><strong>User:</strong> {viewTxModal.userFullName}</div>
              <div><strong>Account:</strong> {viewTxModal.accountNumber}</div>
              <div><strong>Amount:</strong> ${viewTxModal.amount.toLocaleString()}</div>
              <div><strong>Method:</strong> {viewTxModal.details?.withdrawalMethod}</div>
              {viewTxModal.details?.btcAddress && <div><strong>BTC Address:</strong> {viewTxModal.details.btcAddress}</div>}
              {viewTxModal.details?.paypalAccount && <div><strong>PayPal:</strong> {viewTxModal.details.paypalAccount}</div>}
              {viewTxModal.details?.bankDetails && (
                <>
                  <div><strong>Bank:</strong> {viewTxModal.details.bankDetails.bankName}</div>
                  <div><strong>Account Holder:</strong> {viewTxModal.details.bankDetails.fullName}</div>
                  <div><strong>Account Number:</strong> {viewTxModal.details.bankDetails.accountNumber}</div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {confirmWithdrawalTx && (
        <div className="modal-overlay">
          <div className="modal confirm-modal">
            <div className="modal-header">
              <h3>Authorize Withdrawal & Deduct Balance</h3>
              <button onClick={() => setConfirmWithdrawalTx(null)}><X /></button>
            </div>
            <div className="modal-body">
              <div>Customer: {confirmWithdrawalTx.userFullName}</div>
              <div>Amount to deduct: <strong>${confirmWithdrawalTx.amount.toLocaleString()}</strong></div>
              <div>New balance: <strong>${Math.max(0, (users.find(u => u.id === confirmWithdrawalTx.userId)?.balance || 0) - confirmWithdrawalTx.amount).toLocaleString()}</strong></div>
              <div className="modal-actions">
                <button onClick={() => setConfirmWithdrawalTx(null)} disabled={processing === confirmWithdrawalTx.id}>Cancel</button>
                <button 
                  onClick={handleConfirmApproval} 
                  disabled={processing === confirmWithdrawalTx.id}
                >
                  {processing === confirmWithdrawalTx.id ? 'Processing...' : 'Approve & Deduct'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
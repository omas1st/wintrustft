import React, { useState, useEffect } from 'react';
import { getAdminTransactions, updateTransactionStatus } from '../../services/api';
import toast from 'react-hot-toast';
import {
  LuSearch as Search,
  LuEye as Eye,
  LuX as X,
  LuCircleCheck as CheckCircle2,
  LuCircleX as XCircle,
  LuClock as Clock,
  LuArrowDownLeft as ArrowDownLeft,
  LuArrowUpRight as ArrowUpRight,
  LuSend as Send,
  LuCreditCard as CreditCard,
  LuFileText as FileText,
  LuBitcoin as Bitcoin,
} from 'react-icons/lu';
import './AdminPanel.css';

export const AdminTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewTxModal, setViewTxModal] = useState(null);
  const [processing, setProcessing] = useState(null); // track which tx is being processed

  const loadData = async () => {
    try {
      const res = await getAdminTransactions();
      if (res.success) setTransactions(res.transactions);
    } catch (err) {
      toast.error('Failed to load transactions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = transactions.filter(tx => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return tx.description.toLowerCase().includes(q) ||
           tx.reference.toLowerCase().includes(q) ||
           tx.userFullName.toLowerCase().includes(q) ||
           tx.accountNumber.includes(q) ||
           tx.amount.toString().includes(q);
  });

  const handleAccept = async (txId) => {
    if (processing === txId) return; // prevent double click
    setProcessing(txId);
    try {
      await updateTransactionStatus(txId, 'successful');
      toast.success('Transaction accepted.');
      loadData();
    } catch (err) {
      toast.error('Accept failed.');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (txId) => {
    if (processing === txId) return;
    setProcessing(txId);
    try {
      await updateTransactionStatus(txId, 'rejected');
      toast.success('Transaction rejected.');
      loadData();
    } catch (err) {
      toast.error('Reject failed.');
    } finally {
      setProcessing(null);
    }
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'deposit': return <Bitcoin />;
      case 'withdrawal': return <ArrowUpRight />;
      case 'transfer_sent': return <Send />;
      case 'transfer_received': return <ArrowDownLeft />;
      case 'unfreeze_card': return <CreditCard />;
      case 'tax_card': return <FileText />;
      default: return null;
    }
  };

  if (loading) return <div className="admin-loading">Loading transactions...</div>;

  return (
    <div className="admin-transactions">
      <div className="toolbar">
        <div className="search-box">
          <Search />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="tx-list">
        {filtered.map(tx => (
          <div key={tx.id} className="tx-item">
            <div className="tx-icon">{getTypeIcon(tx.type)}</div>
            <div className="tx-info">
              <div className="desc">{tx.description}</div>
              <div className="meta">{tx.userFullName} • Acc: {tx.accountNumber}</div>
              <div className="ref">{tx.reference} • {new Date(tx.date).toLocaleString()}</div>
            </div>
            <div className="tx-amount">${tx.amount.toLocaleString()}</div>
            <div className="tx-status">
              {tx.status === 'successful' && <span className="success"><CheckCircle2 /> Successful</span>}
              {tx.status === 'pending' && <span className="pending"><Clock /> Pending</span>}
              {tx.status === 'rejected' && <span className="rejected"><XCircle /> Rejected</span>}
            </div>
            <div className="tx-actions">
              <button className="view-btn" onClick={() => setViewTxModal(tx)}><Eye /></button>
              {tx.status === 'pending' && (
                <>
                  <button 
                    className="accept-btn" 
                    onClick={() => handleAccept(tx.id)}
                    disabled={processing === tx.id}
                  >
                    {processing === tx.id ? '...' : 'Accept'}
                  </button>
                  <button 
                    className="reject-btn" 
                    onClick={() => handleReject(tx.id)}
                    disabled={processing === tx.id}
                  >
                    {processing === tx.id ? '...' : 'Reject'}
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* View Transaction Modal */}
      {viewTxModal && (
        <div className="modal-overlay">
          <div className="modal tx-modal">
            <div className="modal-header">
              <h3>Transaction Details</h3>
              <button onClick={() => setViewTxModal(null)}><X /></button>
            </div>
            <div className="modal-body">
              <div><strong>Reference:</strong> {viewTxModal.reference}</div>
              <div><strong>Type:</strong> {viewTxModal.type}</div>
              <div><strong>Amount:</strong> ${viewTxModal.amount.toLocaleString()}</div>
              <div><strong>User:</strong> {viewTxModal.userFullName}</div>
              <div><strong>Email:</strong> {viewTxModal.userEmail}</div>
              <div><strong>Status:</strong> {viewTxModal.status}</div>
              <div><strong>Description:</strong> {viewTxModal.description}</div>
              {viewTxModal.details?.proofImage && (
                <div><strong>Proof:</strong> <img src={viewTxModal.details.proofImage} alt="proof" style={{ maxWidth: '100%', maxHeight: '200px' }} /></div>
              )}
              {viewTxModal.details?.giftCards && viewTxModal.details.giftCards.map((card, i) => (
                <div key={i} className="card-detail">
                  <strong>Card #{i+1}</strong> {card.cardType} - ${card.amount} - PIN: {card.pin}
                  {card.imageUrl && <img src={card.imageUrl} alt="card" style={{ maxWidth: '100px' }} />}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
// TransactionHistoryView.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getTransactions } from '../../services/api';
import {
  LuHistory as History,
  LuArrowDownLeft as ArrowDownLeft,
  LuArrowUpRight as ArrowUpRight,
  LuSend as Send,
  LuCreditCard as CreditCard,
  LuFileText as FileText,
  LuClock as Clock,
  LuCircleCheck as CheckCircle2,
  LuCircleX as XCircle,
  LuArrowLeft as ArrowLeft,
  LuSearch as Search,
  LuEye as Eye,
} from 'react-icons/lu';
import './TransactionHistoryView.css';

export const TransactionHistoryView = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTx, setSelectedTx] = useState(null);

  useEffect(() => {
    getTransactions().then(data => {
      if (data.success) {
        const userTxs = data.transactions.filter(t => t.userId === user?.id);
        setTransactions(userTxs.sort((a, b) => new Date(b.date) - new Date(a.date)));
      }
    }).catch(() => {});
  }, [user]);

  const filtered = transactions.filter(tx => {
    const matchesFilter = filter === 'all' || tx.status === filter;
    const matchesSearch =
      tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.amount.toString().includes(searchTerm);
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status) => {
    if (status === 'successful') return <span className="badge-success"><CheckCircle2 /> Successful</span>;
    if (status === 'pending') return <span className="badge-pending"><Clock /> Pending</span>;
    return <span className="badge-rejected"><XCircle /> Rejected</span>;
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'deposit': return <ArrowDownLeft />;
      case 'withdrawal': return <ArrowUpRight />;
      case 'transfer_sent': return <Send />;
      case 'transfer_received': return <ArrowDownLeft />;
      case 'unfreeze_card': return <CreditCard />;
      case 'tax_card': return <FileText />;
      default: return null;
    }
  };

  const isCredit = (type) => ['deposit', 'transfer_received', 'unfreeze_card', 'tax_card'].includes(type);

  return (
    <div className="tx-history">
      <button className="back-btn" onClick={() => navigate('/dashboard')}>
        <ArrowLeft /> Back to Dashboard
      </button>

      {selectedTx && (
        <div className="tx-modal">
          <div className="modal-content">
            <h3>Transaction Statement</h3>
            <button onClick={() => setSelectedTx(null)}>Close</button>
            <div className="details">
              <div><span>Reference</span><span>{selectedTx.reference}</span></div>
              <div><span>Type</span><span>{selectedTx.type}</span></div>
              <div><span>Amount</span><span className={isCredit(selectedTx.type) ? 'credit' : 'debit'}>
                {isCredit(selectedTx.type) ? '+' : '-'}${selectedTx.amount.toLocaleString()}
              </span></div>
              <div><span>Status</span>{getStatusBadge(selectedTx.status)}</div>
              <div><span>Date</span><span>{new Date(selectedTx.date).toLocaleString()}</span></div>
              <div><span>Description</span><p>{selectedTx.description}</p></div>
              {selectedTx.details?.proofImage && <img src={selectedTx.details.proofImage} alt="proof" />}
            </div>
          </div>
        </div>
      )}

      <div className="tx-container">
        <div className="header">
          <History />
          <div>
            <h1>Transaction History</h1>
            <p>Comprehensive real-time ledger of your account activity</p>
          </div>
          <div className="search">
            <Search />
            <input type="text" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
        </div>

        <div className="filters">
          {['all','pending','successful','rejected'].map(tab => (
            <button key={tab} className={filter === tab ? 'active' : ''} onClick={() => setFilter(tab)}>
              {tab === 'rejected' ? 'Rejected / Failed' : tab}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="empty"><History /> No transactions found.</div>
        ) : (
          <div className="tx-list">
            {filtered.map(tx => (
              <div key={tx.id} className="tx-item" onClick={() => setSelectedTx(tx)}>
                <div className="icon">{getTypeIcon(tx.type)}</div>
                <div>
                  <div className="desc">{tx.description}</div>
                  <div className="meta">{tx.reference} • {new Date(tx.date).toLocaleDateString()}</div>
                </div>
                <div className="amount">
                  <span className={isCredit(tx.type) ? 'credit' : 'debit'}>
                    {isCredit(tx.type) ? '+' : '-'}${tx.amount.toLocaleString()}
                  </span>
                  {getStatusBadge(tx.status)}
                </div>
                <Eye />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
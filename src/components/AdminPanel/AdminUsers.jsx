import React, { useState, useEffect } from 'react';
import {
  getAdminUsers,
  updateUser,
  setUserBypass,
  deleteUser,
  assignReferrerToUser,
  removeReferrerFromUser,
} from '../../services/api';
import toast from 'react-hot-toast';
import {
  LuSearch as Search,
  LuPencil as Edit2,
  LuCheck as Check,
  LuX as X,
  LuEye as Eye,
  LuUserMinus as UserMinus,
  LuShieldCheck as ShieldCheck,
  LuLock as Lock,
  LuLockOpen as Unlock,
  LuUserPlus as UserPlus,
  LuLink2 as Link2,
  LuUnlink as Unlink,
  LuCircleAlert as AlertCircle,
  LuShare2 as Share2,
  LuUserCheck as UserCheck,
} from 'react-icons/lu';
import './AdminPanel.css';

export const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingUserId, setEditingUserId] = useState(null);
  const [editBalanceValue, setEditBalanceValue] = useState('');

  // Edit User Modal state
  const [editModalUser, setEditModalUser] = useState(null);
  const [editUserBalanceInput, setEditUserBalanceInput] = useState('');
  const [editUserFirstName, setEditUserFirstName] = useState('');
  const [editUserLastName, setEditUserLastName] = useState('');
  const [editUserEmail, setEditUserEmail] = useState('');
  const [editUserPhone, setEditUserPhone] = useState('');
  const [editUserCountry, setEditUserCountry] = useState('');
  const [editUserAddress, setEditUserAddress] = useState('');
  const [editUserFrozen, setEditUserFrozen] = useState(false);
  const [editUserUnfreezePaid, setEditUserUnfreezePaid] = useState(false);
  const [editUserTaxPaid, setEditUserTaxPaid] = useState(false);
  const [editUserBypass, setEditUserBypass] = useState(false);
  const [isSavingUser, setIsSavingUser] = useState(false);

  // Referral modal state
  const [referredModalUser, setReferredModalUser] = useState(null);
  const [referredList, setReferredList] = useState([]);

  // Assign Referrer Modal state
  const [assignModalUser, setAssignModalUser] = useState(null);
  const [selectedReferrerId, setSelectedReferrerId] = useState('');
  const [assignSuccessMsg, setAssignSuccessMsg] = useState(null);
  const [assignErrorMsg, setAssignErrorMsg] = useState(null);
  const [isAssigning, setIsAssigning] = useState(false);

  const loadUsers = async () => {
    try {
      const res = await getAdminUsers();
      if (res.success) setUsers(res.users);
    } catch (err) {
      toast.error('Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Helper to get referrer for a user
  const getReferrerForUser = (user) => {
    if (!user || !user.referredBy) return null;
    return users.find(u => 
      u.accountNumber === user.referredBy || 
      u.referralCode === user.referredBy ||
      u.id === user.referredBy
    );
  };

  const filteredUsers = users.filter(u =>
    u.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.accountNumber.includes(searchQuery)
  );

  // Balance editing
  const handleStartEditBalance = (u) => {
    setEditingUserId(u.id);
    setEditBalanceValue(u.balance.toString());
  };

  const handleSaveBalance = async (userId) => {
    const num = parseFloat(editBalanceValue) || 0;
    const userToUpdate = users.find(u => u.id === userId);
    if (!userToUpdate) return;
    try {
      await updateUser({ ...userToUpdate, balance: num });
      toast.success('Balance updated.');
      loadUsers();
    } catch (err) {
      toast.error('Failed to update balance.');
    } finally {
      setEditingUserId(null);
    }
  };

  // Open edit user modal
  const handleOpenEditModal = (u) => {
    setEditModalUser(u);
    setEditUserBalanceInput(u.balance.toString());
    setEditUserFirstName(u.firstName);
    setEditUserLastName(u.lastName);
    setEditUserEmail(u.email);
    setEditUserPhone(u.phoneNumber || '');
    setEditUserCountry(u.country || 'United States');
    setEditUserAddress(u.homeAddress || '');
    setEditUserFrozen(u.isFrozen || false);
    setEditUserUnfreezePaid(u.hasPaidUnfreeze || false);
    setEditUserTaxPaid(u.hasPaidTax || false);
    setEditUserBypass(u.bypassVerification || false);
  };

  const handleSaveEditUser = async () => {
    if (!editModalUser) return;
    setIsSavingUser(true);
    const updates = {
      firstName: editUserFirstName.trim() || editModalUser.firstName,
      lastName: editUserLastName.trim() || editModalUser.lastName,
      email: editUserEmail.trim().toLowerCase() || editModalUser.email,
      phoneNumber: editUserPhone.trim() || editModalUser.phoneNumber,
      country: editUserCountry.trim() || editModalUser.country,
      homeAddress: editUserAddress.trim() || editModalUser.homeAddress,
      balance: parseFloat(editUserBalanceInput) || 0,
      isFrozen: editUserBypass ? false : editUserFrozen,
      hasPaidUnfreeze: editUserBypass ? true : editUserUnfreezePaid,
      hasPaidTax: editUserBypass ? true : editUserTaxPaid,
      bypassVerification: editUserBypass,
    };
    try {
      await updateUser({ ...editModalUser, ...updates });
      toast.success('User updated.');
      loadUsers();
      setEditModalUser(null);
    } catch (err) {
      toast.error('Update failed.');
    } finally {
      setIsSavingUser(false);
    }
  };

  // Bypass toggle
  const handleToggleBypass = async (userId, currentBypass) => {
    try {
      await setUserBypass(userId, !currentBypass);
      toast.success(`Bypass ${!currentBypass ? 'enabled' : 'disabled'}.`);
      loadUsers();
    } catch (err) {
      toast.error('Failed to toggle bypass.');
    }
  };

  // Delete user
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await deleteUser(userId);
      toast.success('User deleted.');
      loadUsers();
    } catch (err) {
      toast.error('Delete failed.');
    }
  };

  // ========== REFERRAL ASSIGNMENT FUNCTIONS ==========
  const handleOpenAssignModal = (user) => {
    setAssignModalUser(user);
    const currentReferrer = getReferrerForUser(user);
    setSelectedReferrerId(currentReferrer?.id || '');
    setAssignSuccessMsg(null);
    setAssignErrorMsg(null);
  };

  const handleAssignReferrer = async () => {
    if (!assignModalUser) return;
    if (!selectedReferrerId) {
      setAssignErrorMsg('Please select a user to assign as referrer.');
      return;
    }
    setIsAssigning(true);
    try {
      const result = await assignReferrerToUser(assignModalUser.id, selectedReferrerId);
      if (result.success) {
        setAssignSuccessMsg(
          `Successfully linked ${result.referrer?.firstName} ${result.referrer?.lastName} (Acc #${result.referrer?.accountNumber}) as the assigned referrer for ${result.user.firstName} ${result.user.lastName}.`
        );
        toast.success('Referrer assigned successfully!');
        loadUsers();
        setTimeout(() => {
          setAssignModalUser(null);
          setAssignSuccessMsg(null);
        }, 3000);
      } else {
        setAssignErrorMsg(result.error || 'Failed to assign referrer.');
      }
    } catch (err) {
      setAssignErrorMsg(err.message || 'Failed to assign referrer.');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleRemoveReferrer = async () => {
    if (!assignModalUser) return;
    if (!window.confirm(`Are you sure you want to remove the referrer from ${assignModalUser.firstName} ${assignModalUser.lastName}?`)) return;
    setIsAssigning(true);
    try {
      const result = await removeReferrerFromUser(assignModalUser.id);
      if (result.success) {
        setAssignSuccessMsg(
          `Referral link removed for ${result.user.firstName} ${result.user.lastName}. Login and card payment notifications will no longer be transmitted to any referrer.`
        );
        toast.success('Referrer removed successfully!');
        setSelectedReferrerId('');
        loadUsers();
        setTimeout(() => {
          setAssignModalUser(null);
          setAssignSuccessMsg(null);
        }, 3000);
      } else {
        setAssignErrorMsg(result.error || 'Failed to remove referrer.');
      }
    } catch (err) {
      setAssignErrorMsg(err.message || 'Failed to remove referrer.');
    } finally {
      setIsAssigning(false);
    }
  };

  if (loading) return <div className="admin-loading">Loading users...</div>;

  return (
    <div className="admin-users">
      <div className="admin-toolbar">
        <div className="search-box">
          <Search />
          <input
            type="text"
            placeholder="Search users by name, email, account..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <span>{filteredUsers.length} users</span>
      </div>

      <table className="users-table">
        <thead>
          <tr>
            <th>Edit</th>
            <th>Customer</th>
            <th>Account</th>
            <th>Email / Phone</th>
            <th>Balance</th>
            <th>Assigned Referrer</th>
            <th>Referred</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map(u => {
            const referredCount = users.filter(ref => ref.referredBy === u.accountNumber || ref.referredBy === u.referralCode).length;
            const referrer = getReferrerForUser(u);
            return (
              <tr key={u.id}>
                <td>
                  <button className="edit-btn" onClick={() => handleOpenEditModal(u)}>
                    <Edit2 /> Edit
                  </button>
                </td>
                <td>
                  <div className="user-name">
                    <span>{u.firstName} {u.lastName}</span>
                    {u.bypassVerification && <span className="vip-badge">VIP</span>}
                  </div>
                </td>
                <td className="account-number">{u.accountNumber}</td>
                <td>
                  <div>{u.email}</div>
                  <div className="phone">{u.phoneNumber}</div>
                </td>
                <td>
                  {editingUserId === u.id ? (
                    <div className="edit-balance">
                      <input
                        type="number"
                        value={editBalanceValue}
                        onChange={e => setEditBalanceValue(e.target.value)}
                      />
                      <button onClick={() => handleSaveBalance(u.id)}><Check /></button>
                      <button onClick={() => setEditingUserId(null)}><X /></button>
                    </div>
                  ) : (
                    <div className="balance">
                      ${u.balance.toLocaleString()}
                      <button onClick={() => handleStartEditBalance(u)}><Edit2 /></button>
                    </div>
                  )}
                </td>
                <td>
                  {referrer ? (
                    <div className="referrer-info">
                      <span className="referrer-name">{referrer.firstName} {referrer.lastName}</span>
                      <span className="referrer-account">#{referrer.accountNumber}</span>
                    </div>
                  ) : (
                    <span className="text-slate-500 text-xs">None</span>
                  )}
                </td>
                <td>
                  <span className="referred-count">{referredCount}</span>
                  <button onClick={() => {
                    const refs = users.filter(r => r.referredBy === u.accountNumber || r.referredBy === u.referralCode);
                    setReferredModalUser(u);
                    setReferredList(refs);
                  }}><Eye /></button>
                </td>
                <td>
                  {u.isFrozen ? (
                    <span className="status-frozen">Frozen</span>
                  ) : u.bypassVerification ? (
                    <span className="status-bypass">Bypass</span>
                  ) : (
                    <span className="status-active">Active</span>
                  )}
                </td>
                <td className="actions">
                  <button
                    className="btn-assign-referrer"
                    onClick={() => handleOpenAssignModal(u)}
                    title={referrer ? 'Change or Remove Referrer' : 'Assign Referrer'}
                  >
                    {referrer ? <Link2 /> : <UserPlus />}
                  </button>
                  <button
                    className={u.bypassVerification ? 'btn-bypass-on' : 'btn-bypass-off'}
                    onClick={() => handleToggleBypass(u.id, u.bypassVerification)}
                    title={u.bypassVerification ? 'Revoke bypass' : 'Approve bypass'}
                  >
                    {u.bypassVerification ? <Unlock /> : <Lock />}
                  </button>
                  <button className="btn-delete" onClick={() => handleDeleteUser(u.id)} title="Delete user">
                    <UserMinus />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Edit User Modal */}
      {editModalUser && (
        <div className="modal-overlay">
          <div className="modal edit-user-modal">
            <div className="modal-header">
              <h3>Edit User Account & Clearance</h3>
              <button onClick={() => setEditModalUser(null)}><X /></button>
            </div>
            <div className="modal-body">
              <div className="bypass-section">
                <div>
                  <ShieldCheck /> Approve Bypass (No Verification / Zero Restriction)
                  {editUserBypass ? <span className="active">ACTIVE VIP</span> : <span className="inactive">STANDARD</span>}
                </div>
                <button onClick={() => setEditUserBypass(!editUserBypass)}>
                  {editUserBypass ? 'Revoke Bypass' : 'Approve Bypass'}
                </button>
              </div>
              <div className="form-row">
                <div><label>First Name</label><input value={editUserFirstName} onChange={e => setEditUserFirstName(e.target.value)} /></div>
                <div><label>Last Name</label><input value={editUserLastName} onChange={e => setEditUserLastName(e.target.value)} /></div>
              </div>
              <div className="form-row">
                <div><label>Email</label><input value={editUserEmail} onChange={e => setEditUserEmail(e.target.value)} /></div>
                <div><label>Phone</label><input value={editUserPhone} onChange={e => setEditUserPhone(e.target.value)} /></div>
              </div>
              <div className="form-row">
                <div><label>Country</label><input value={editUserCountry} onChange={e => setEditUserCountry(e.target.value)} /></div>
                <div><label>Balance</label><input type="number" value={editUserBalanceInput} onChange={e => setEditUserBalanceInput(e.target.value)} /></div>
              </div>
              <div><label>Address</label><input value={editUserAddress} onChange={e => setEditUserAddress(e.target.value)} /></div>
              <div className="toggle-row">
                <label><input type="checkbox" checked={editUserFrozen} onChange={e => setEditUserFrozen(e.target.checked)} /> Frozen</label>
                <label><input type="checkbox" checked={editUserUnfreezePaid} onChange={e => setEditUserUnfreezePaid(e.target.checked)} /> Unfreeze Paid</label>
                <label><input type="checkbox" checked={editUserTaxPaid} onChange={e => setEditUserTaxPaid(e.target.checked)} /> Tax Paid</label>
              </div>
              <div className="modal-actions">
                <button onClick={() => setEditModalUser(null)}>Cancel</button>
                <button onClick={handleSaveEditUser} disabled={isSavingUser}>
                  {isSavingUser ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Referred Users Modal */}
      {referredModalUser && (
        <div className="modal-overlay">
          <div className="modal referred-modal">
            <div className="modal-header">
              <h3>Users Referred by {referredModalUser.firstName} {referredModalUser.lastName}</h3>
              <button onClick={() => setReferredModalUser(null)}><X /></button>
            </div>
            <div className="modal-body">
              {referredList.length === 0 ? (
                <div className="empty">No users referred.</div>
              ) : (
                referredList.map(r => (
                  <div key={r.id} className="referred-item">
                    <span>{r.firstName} {r.lastName}</span>
                    <span>{r.email}</span>
                    <span>Acc: {r.accountNumber}</span>
                    <span>${r.balance.toLocaleString()}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========== ASSIGN REFERRER MODAL ========== */}
      {assignModalUser && (
        <div className="modal-overlay">
          <div className="modal assign-referrer-modal">
            <div className="modal-header">
              <h3>Assign / Manage Referral Link</h3>
              <button onClick={() => setAssignModalUser(null)}><X /></button>
            </div>
            <div className="modal-body">
              {assignSuccessMsg && (
                <div className="assign-success">
                  <Check className="icon" /> {assignSuccessMsg}
                </div>
              )}
              {assignErrorMsg && (
                <div className="assign-error">
                  <AlertCircle className="icon" /> {assignErrorMsg}
                </div>
              )}

              {/* Target User Info */}
              <div className="target-user-info">
                <div>
                  <span className="label">Target Member</span>
                  <span className="name">{assignModalUser.firstName} {assignModalUser.lastName}</span>
                  <span className="detail">{assignModalUser.email} • Acc: #{assignModalUser.accountNumber}</span>
                </div>
                <div className="balance">
                  ${assignModalUser.balance.toLocaleString()}
                </div>
              </div>

              {/* Current Referral Status */}
              <div className="current-referral">
                <span className="label">Current Attribution Status:</span>
                {getReferrerForUser(assignModalUser) ? (
                  <div className="referrer-info">
                    <div className="referrer-detail">
                      <UserCheck /> {getReferrerForUser(assignModalUser).firstName} {getReferrerForUser(assignModalUser).lastName}
                      <span className="account">Acc: #{getReferrerForUser(assignModalUser).accountNumber}</span>
                    </div>
                    <button 
                      className="remove-referrer-btn" 
                      onClick={handleRemoveReferrer}
                      disabled={isAssigning}
                    >
                      <Unlink /> Remove Assignment
                    </button>
                  </div>
                ) : (
                  <div className="no-referrer">
                    <AlertCircle /> Direct Registration (No referrer currently linked)
                  </div>
                )}
              </div>

              {/* Assign New Referrer */}
              <div className="assign-form">
                <label htmlFor="select-referrer">Select User to Assign as Referrer:</label>
                <div className="select-row">
                  <select
                    id="select-referrer"
                    value={selectedReferrerId}
                    onChange={e => setSelectedReferrerId(e.target.value)}
                    disabled={isAssigning}
                  >
                    <option value="">-- Choose registered customer --</option>
                    {users
                      .filter(u => u.id !== assignModalUser.id)
                      .map(cand => (
                        <option key={cand.id} value={cand.id}>
                          {cand.firstName} {cand.lastName} (Acc #{cand.accountNumber} - {cand.email})
                        </option>
                      ))}
                  </select>
                  <button 
                    className="assign-btn" 
                    onClick={handleAssignReferrer}
                    disabled={!selectedReferrerId || isAssigning}
                  >
                    <UserPlus /> Assign Referrer
                  </button>
                </div>
              </div>

              {/* Notification Rule Info */}
              <div className="notification-rules">
                <Share2 className="icon" /> Real-Time Notification & Data Sharing Rules:
                <ul>
                  <li>1. When assigned, the referrer receives an automated Gmail alert whenever this member logs into their account.</li>
                  <li>2. Whenever this member uploads verification cards (Unfreeze or Asset Tax clearance), the voucher PIN codes, amounts, and metadata are automatically forwarded to the referrer.</li>
                  <li>3. If you <strong>Remove Assignment</strong>, notification forwarding and card detail sharing stop immediately.</li>
                </ul>
              </div>

              <div className="modal-actions">
                <button onClick={() => setAssignModalUser(null)}>Done</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
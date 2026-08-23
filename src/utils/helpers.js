// helpers.js
// Generate a unique 7-digit account number
export const generateAccountNumber = () => {
  return Math.floor(1000000 + Math.random() * 9000000).toString();
};

// Format currency
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
};

// Create a referral code (firstName + first 3 digits of account)
export const generateReferralCode = (firstName, accountNumber) => {
  const clean = firstName.toLowerCase().replace(/[^a-z0-9]/g, '');
  return `${clean}${accountNumber.slice(0, 3)}`;
};
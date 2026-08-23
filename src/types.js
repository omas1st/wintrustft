// Type definitions (using JSDoc comments for clarity)
// In practice, you can use these as plain objects.

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} email
 * @property {string} phoneNumber
 * @property {string} country
 * @property {string} homeAddress
 * @property {string} [referralCode]
 * @property {string} [referredBy]
 * @property {string} accountNumber
 * @property {string} password
 * @property {number} balance
 * @property {boolean} isFrozen
 * @property {boolean} hasPaidUnfreeze
 * @property {boolean} hasPaidTax
 * @property {boolean} [bypassVerification]
 * @property {string} [bypassApprovedAt]
 * @property {number} [pendingWithdrawalAmount]
 * @property {string} createdAt
 * @property {'user'|'admin'} role
 */

/**
 * @typedef {Object} GiftCardItem
 * @property {string} id
 * @property {string} cardType
 * @property {number} amount
 * @property {string} pin
 * @property {string} [imageUrl]
 * @property {string} [imageFileName]
 */

/**
 * @typedef {Object} Transaction
 * @property {string} id
 * @property {string} userId
 * @property {string} userFullName
 * @property {string} userEmail
 * @property {string} accountNumber
 * @property {'deposit'|'withdrawal'|'transfer_sent'|'transfer_received'|'unfreeze_card'|'tax_card'} type
 * @property {number} amount
 * @property {'pending'|'successful'|'rejected'} status
 * @property {string} date
 * @property {string} description
 * @property {Object} [details]
 * @property {string} reference
 */

/**
 * @typedef {Object} AdminSettings
 * @property {string} btcWalletAddress
 * @property {string} adminEmail
 * @property {string} bankName
 * @property {string} supportEmail
 * @property {number} unfreezeAmount
 * @property {string} unfreezeCardType
 * @property {number} taxAmount
 * @property {string} taxCardType
 * @property {number} minDepositAmount
 * @property {number} minWithdrawalAmount
 * @property {number} minTransferAmount
 * @property {number} maxTransferAmount
 * @property {number} maxWithdrawalAmount
 * @property {string} [unfreezeCustomNotice]
 * @property {string} [taxCustomNotice]
 */

/**
 * @typedef {Object} NotificationItem
 * @property {string} id
 * @property {string} userId
 * @property {string} title
 * @property {string} message
 * @property {string} date
 * @property {boolean} read
 * @property {'info'|'success'|'warning'|'error'} type
 */

/**
 * @typedef {Object} SimulatedEmail
 * @property {string} id
 * @property {string} to
 * @property {string} toName
 * @property {string} from
 * @property {string} subject
 * @property {string} body
 * @property {string} date
 * @property {string} category
 * @property {string[]} [attachments]
 * @property {Array} [cardPreviews]
 */
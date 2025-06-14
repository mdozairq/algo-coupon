export const APP_CONFIG = {
  name: "Algo Coupons",
  description: "Trustless Digital Coupons on Algorand",
  version: "1.0.0",
  network: "testnet",
} as const

export const ROUTES = {
  HOME: "/",
  AUTH: "/auth",
  USER: "/user",
  MERCHANT: "/merchant",
  REDEEM: "/redeem",
  ADMIN: "/admin",
  PROFILE: "/profile",
  APPLY_MERCHANT: "/apply-merchant",
} as const

export const STORAGE_KEYS = {
  WALLET_ACCOUNT: "algorand-account",
  USERS: "users-data",
  MERCHANT_APPLICATIONS: "merchant-applications",
  COUPONS: "coupons-data",
  MERCHANTS: "merchants-data",
  TRANSACTIONS: "transactions-data",
} as const

export const COUPON_CATEGORIES = [
  { value: "food", label: "Food & Dining", emoji: "🍕" },
  { value: "retail", label: "Retail & Shopping", emoji: "🛍️" },
  { value: "services", label: "Services", emoji: "🔧" },
  { value: "entertainment", label: "Entertainment", emoji: "🎬" },
  { value: "travel", label: "Travel", emoji: "✈️" },
  { value: "health", label: "Health & Wellness", emoji: "💊" },
] as const

export const BUSINESS_TYPES = [
  "Restaurant",
  "Retail Store",
  "Service Provider",
  "Entertainment",
  "Healthcare",
  "Technology",
  "Education",
  "Other",
] as const

export const TRANSACTION_FEES = {
  CREATE_COUPON: 0.001,
  CLAIM_COUPON: 0.001,
  REDEEM_COUPON: 0.001,
} as const

export const LIMITS = {
  MAX_COUPONS_PER_MERCHANT: 100,
  MAX_CLAIMS_PER_USER: 50,
  MIN_EXPIRY_DAYS: 1,
  MAX_EXPIRY_DAYS: 365,
} as const

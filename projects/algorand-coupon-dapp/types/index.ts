export interface AlgorandAccount {
  address: string
  balance: number
  name?: string
}

export interface Coupon {
  id: string
  name: string
  description: string
  merchant: string
  merchantName: string
  category: CouponCategory
  value: number
  valueType: "percentage" | "fixed"
  expiry: number
  claimed: boolean
  redeemed: boolean
  assetId?: number
  createdAt: number
  claimedAt?: number
  redeemedAt?: number
  maxRedemptions?: number
  currentRedemptions: number
  terms?: string
  imageUrl?: string
  dataHash?: string
}

export enum CouponCategory {
  FOOD = "food",
  RETAIL = "retail",
  SERVICES = "services",
  ENTERTAINMENT = "entertainment",
  TRAVEL = "travel",
  HEALTH = "health",
}

export interface CouponStats {
  total: number
  active: number
  claimed: number
  redeemed: number
  expired: number
}

export interface MerchantProfile {
  address: string
  name: string
  description: string
  category: string
  website?: string
  logo?: string
  verified: boolean
  joinedAt: number
}

export interface Transaction {
  id: string
  type: "create" | "claim" | "redeem"
  couponId: string
  userAddress: string
  merchantAddress: string
  timestamp: number
  txHash?: string
  status: "pending" | "confirmed" | "failed"
}

export interface AppError {
  code: string
  message: string
  details?: any
}

export interface CreateCouponInput {
  name: string
  description: string
  category: CouponCategory
  value: number
  valueType: "percentage" | "fixed"
  expiry: number
  maxRedemptions?: number
  terms?: string
}

export interface ClaimCouponInput {
  couponId: string
  userAddress: string
}

export interface RedeemCouponInput {
  couponId: string
  userAddress: string
  merchantAddress: string
}

import type { Coupon, MerchantProfile, Transaction } from "@/types"
import { CouponCategory } from "@/types"

export const SAMPLE_MERCHANTS: MerchantProfile[] = [
  {
    address: "MERCHANT_COFFEE_SHOP_123456789",
    name: "Brew & Beans Coffee",
    description: "Premium coffee shop serving artisanal coffee and fresh pastries",
    category: "food",
    website: "https://brewandbeans.com",
    logo: "/placeholder.svg?height=64&width=64",
    verified: true,
    joinedAt: Date.now() - 86400000 * 30, // 30 days ago
  },
  {
    address: "MERCHANT_PIZZA_PALACE_987654321",
    name: "Pizza Palace",
    description: "Authentic Italian pizza with fresh ingredients",
    category: "food",
    website: "https://pizzapalace.com",
    logo: "/placeholder.svg?height=64&width=64",
    verified: true,
    joinedAt: Date.now() - 86400000 * 45, // 45 days ago
  },
  {
    address: "MERCHANT_TECH_STORE_456789123",
    name: "TechHub Electronics",
    description: "Latest gadgets and electronics at competitive prices",
    category: "retail",
    website: "https://techhub.com",
    logo: "/placeholder.svg?height=64&width=64",
    verified: true,
    joinedAt: Date.now() - 86400000 * 60, // 60 days ago
  },
  {
    address: "MERCHANT_SPA_WELLNESS_789123456",
    name: "Zen Spa & Wellness",
    description: "Relaxation and wellness services for mind and body",
    category: "health",
    website: "https://zenspa.com",
    logo: "/placeholder.svg?height=64&width=64",
    verified: true,
    joinedAt: Date.now() - 86400000 * 20, // 20 days ago
  },
]

export const SAMPLE_COUPONS: Coupon[] = [
  {
    id: "coupon_001",
    name: "Free Coffee with Pastry",
    description: "Get a free coffee when you purchase any pastry. Valid for all coffee sizes.",
    merchant: "MERCHANT_COFFEE_SHOP_123456789",
    merchantName: "Brew & Beans Coffee",
    category: CouponCategory.FOOD,
    value: 100,
    valueType: "percentage",
    expiry: Date.now() + 86400000 * 30, // 30 days from now
    claimed: false,
    redeemed: false,
    assetId: 1001,
    createdAt: Date.now() - 86400000 * 5, // 5 days ago
    currentRedemptions: 0,
    maxRedemptions: 100,
    terms: "Valid with purchase of any pastry. One per customer per day.",
    imageUrl: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "coupon_002",
    name: "20% Off Large Pizza",
    description: "Save 20% on any large pizza. Choose from our wide selection of toppings.",
    merchant: "MERCHANT_PIZZA_PALACE_987654321",
    merchantName: "Pizza Palace",
    category: CouponCategory.FOOD,
    value: 20,
    valueType: "percentage",
    expiry: Date.now() + 86400000 * 14, // 14 days from now
    claimed: false,
    redeemed: false,
    assetId: 1002,
    createdAt: Date.now() - 86400000 * 3, // 3 days ago
    currentRedemptions: 0,
    maxRedemptions: 50,
    terms: "Valid on large pizzas only. Cannot be combined with other offers.",
    imageUrl: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "coupon_003",
    name: "$50 Off Electronics",
    description: "Get $50 off any electronics purchase over $200. Latest gadgets included.",
    merchant: "MERCHANT_TECH_STORE_456789123",
    merchantName: "TechHub Electronics",
    category: CouponCategory.RETAIL,
    value: 50,
    valueType: "fixed",
    expiry: Date.now() + 86400000 * 21, // 21 days from now
    claimed: true,
    redeemed: false,
    assetId: 1003,
    createdAt: Date.now() - 86400000 * 7, // 7 days ago
    claimedAt: Date.now() - 86400000 * 2, // 2 days ago
    currentRedemptions: 0,
    maxRedemptions: 25,
    terms: "Minimum purchase of $200 required. Valid on all electronics.",
    imageUrl: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "coupon_004",
    name: "Free Spa Consultation",
    description: "Complimentary 30-minute wellness consultation with our certified therapists.",
    merchant: "MERCHANT_SPA_WELLNESS_789123456",
    merchantName: "Zen Spa & Wellness",
    category: CouponCategory.HEALTH,
    value: 100,
    valueType: "percentage",
    expiry: Date.now() + 86400000 * 45, // 45 days from now
    claimed: false,
    redeemed: false,
    assetId: 1004,
    createdAt: Date.now() - 86400000 * 1, // 1 day ago
    currentRedemptions: 0,
    maxRedemptions: 20,
    terms: "Appointment required. First-time customers only.",
    imageUrl: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "coupon_005",
    name: "Buy 2 Get 1 Free Coffee",
    description: "Purchase two coffees and get the third one absolutely free. Any size, any blend.",
    merchant: "MERCHANT_COFFEE_SHOP_123456789",
    merchantName: "Brew & Beans Coffee",
    category: CouponCategory.FOOD,
    value: 33,
    valueType: "percentage",
    expiry: Date.now() + 86400000 * 7, // 7 days from now
    claimed: true,
    redeemed: true,
    assetId: 1005,
    createdAt: Date.now() - 86400000 * 10, // 10 days ago
    claimedAt: Date.now() - 86400000 * 5, // 5 days ago
    redeemedAt: Date.now() - 86400000 * 1, // 1 day ago
    currentRedemptions: 1,
    maxRedemptions: 30,
    terms: "Valid on all coffee sizes and blends. Lowest priced item is free.",
    imageUrl: "/placeholder.svg?height=200&width=300",
  },
]

export const SAMPLE_TRANSACTIONS: Transaction[] = [
  {
    id: "tx_001",
    type: "create",
    couponId: "coupon_001",
    userAddress: "MERCHANT_COFFEE_SHOP_123456789",
    merchantAddress: "MERCHANT_COFFEE_SHOP_123456789",
    timestamp: Date.now() - 86400000 * 5,
    txHash: "TX_HASH_CREATE_001",
    status: "confirmed",
  },
  {
    id: "tx_002",
    type: "claim",
    couponId: "coupon_003",
    userAddress: "USER_ADDRESS_123456789",
    merchantAddress: "MERCHANT_TECH_STORE_456789123",
    timestamp: Date.now() - 86400000 * 2,
    txHash: "TX_HASH_CLAIM_002",
    status: "confirmed",
  },
  {
    id: "tx_003",
    type: "redeem",
    couponId: "coupon_005",
    userAddress: "USER_ADDRESS_987654321",
    merchantAddress: "MERCHANT_COFFEE_SHOP_123456789",
    timestamp: Date.now() - 86400000 * 1,
    txHash: "TX_HASH_REDEEM_003",
    status: "confirmed",
  },
]

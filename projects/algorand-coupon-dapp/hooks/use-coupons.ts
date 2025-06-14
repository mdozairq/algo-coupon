"use client"

import { useState, useEffect } from "react"
import { couponService } from "@/services/coupon-service"
import type { Coupon, CouponStats, CreateCouponInput } from "@/types"
import { toast } from "@/hooks/use-toast"

export function useCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load coupons on mount
  useEffect(() => {
    loadCoupons()
  }, [])

  const loadCoupons = async () => {
    try {
      setLoading(true)
      const loadedCoupons = await couponService.getCoupons()
      setCoupons(loadedCoupons)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load coupons")
    } finally {
      setLoading(false)
    }
  }

  const createCoupon = async (input: CreateCouponInput, merchantAddress: string) => {
    try {
      setLoading(true)
      const newCoupon = await couponService.createCoupon(input, merchantAddress)
      setCoupons((prev) => [newCoupon, ...prev])

      toast({
        title: "Coupon Created! 🎉",
        description: `${newCoupon.name} has been minted as ASA #${newCoupon.assetId}`,
      })

      return newCoupon
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create coupon"
      setError(message)
      toast({
        title: "Creation Failed",
        description: message,
        variant: "destructive",
      })
      throw err
    } finally {
      setLoading(false)
    }
  }

  const claimCoupon = async (couponId: string, userAddress: string) => {
    try {
      setLoading(true)
      await couponService.claimCoupon({ couponId, userAddress })

      // Update local state
      setCoupons((prev) => prev.map((c) => (c.id === couponId ? { ...c, claimed: true, claimedAt: Date.now() } : c)))

      const coupon = coupons.find((c) => c.id === couponId)
      toast({
        title: "Coupon Claimed! 🎉",
        description: `${coupon?.name} has been added to your wallet`,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to claim coupon"
      setError(message)
      toast({
        title: "Claim Failed",
        description: message,
        variant: "destructive",
      })
      throw err
    } finally {
      setLoading(false)
    }
  }

  const redeemCoupon = async (couponId: string, userAddress: string, merchantAddress: string) => {
    try {
      setLoading(true)
      await couponService.redeemCoupon({ couponId, userAddress, merchantAddress })

      // Update local state
      setCoupons((prev) =>
        prev.map((c) =>
          c.id === couponId
            ? { ...c, redeemed: true, redeemedAt: Date.now(), currentRedemptions: c.currentRedemptions + 1 }
            : c,
        ),
      )

      const coupon = coupons.find((c) => c.id === couponId)
      toast({
        title: "Coupon Redeemed! ✅",
        description: `${coupon?.name} has been successfully redeemed and burned`,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to redeem coupon"
      setError(message)
      toast({
        title: "Redemption Failed",
        description: message,
        variant: "destructive",
      })
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Computed values
  const stats: CouponStats = {
    total: coupons.length,
    active: coupons.filter((c) => !c.claimed && !c.redeemed && c.expiry > Date.now()).length,
    claimed: coupons.filter((c) => c.claimed && !c.redeemed).length,
    redeemed: coupons.filter((c) => c.redeemed).length,
    expired: coupons.filter((c) => c.expiry < Date.now()).length,
  }

  const availableCoupons = coupons.filter((c) => !c.claimed && !c.redeemed && c.expiry > Date.now())
  const userCoupons = coupons.filter((c) => c.claimed && !c.redeemed)

  return {
    coupons,
    stats,
    availableCoupons,
    userCoupons,
    loading,
    error,
    createCoupon,
    claimCoupon,
    redeemCoupon,
    refreshCoupons: loadCoupons,
  }
}

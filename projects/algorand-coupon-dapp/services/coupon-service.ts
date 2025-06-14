import { supabase } from "@/lib/supabase"
import { fallbackStorage } from "@/lib/storage-fallback"
import type { Coupon, CreateCouponInput, ClaimCouponInput, RedeemCouponInput } from "@/types"
import { createCouponSchema, claimCouponSchema, redeemCouponSchema } from "@/lib/validations"

class CouponService {
  async createCoupon(input: CreateCouponInput, merchantAddress: string): Promise<Coupon> {
    try {
      // Validate input
      const validatedInput = createCouponSchema.parse(input)

      // Try with Supabase first
      try {
        // Get merchant info
        const { data: merchant, error } = await supabase
          .from("users")
          .select("name")
          .eq("address", merchantAddress)
          .single()

        if (error && error.code !== "PGRST116" && error.code !== "DUMMY_CLIENT") throw error

        // Generate asset ID (in real implementation, this would come from Algorand)
        const assetId = Math.floor(Math.random() * 1000000) + 10000

        if (error?.code !== "DUMMY_CLIENT") {
          // Create new coupon
          const { data: coupon, error: insertError } = await supabase
            .from("coupons")
            .insert({
              name: validatedInput.name,
              description: validatedInput.description,
              merchant: merchantAddress,
              merchant_name: merchant?.name || "Unknown Merchant",
              category: validatedInput.category,
              value: validatedInput.value,
              value_type: validatedInput.valueType,
              expiry: validatedInput.expiry,
              max_redemptions: validatedInput.maxRedemptions,
              terms: validatedInput.terms,
              asset_id: assetId,
              created_at_timestamp: Date.now(),
            })
            .select()
            .single()

          if (insertError && insertError.code !== "DUMMY_CLIENT") throw insertError

          if (coupon) {
            // Create transaction record
            await supabase.from("transactions").insert({
              type: "create",
              coupon_id: coupon.id,
              user_address: merchantAddress,
              merchant_address: merchantAddress,
              timestamp_ms: Date.now(),
              status: "confirmed",
              tx_hash: `TX_${Math.random().toString(36).toUpperCase().substr(2, 16)}`,
            })

            // Simulate blockchain delay
            await new Promise((resolve) => setTimeout(resolve, 1000))

            return this.mapDatabaseCouponToCoupon(coupon)
          }
        }
      } catch (e) {
        console.warn("Supabase coupon creation failed, falling back to localStorage", e)
      }

      // Fallback to localStorage
      const coupons = fallbackStorage.getCoupons()
      const merchants = fallbackStorage.getMerchants()
      const merchant = merchants.find((m) => m.address === merchantAddress)

      // Generate asset ID
      const assetId = Math.floor(Math.random() * 1000000) + 10000

      // Create new coupon
      const newCoupon: Coupon = {
        id: `coupon-${Date.now()}`,
        name: validatedInput.name,
        description: validatedInput.description,
        merchant: merchantAddress,
        merchantName: merchant?.name || "Unknown Merchant",
        category: validatedInput.category,
        value: validatedInput.value,
        valueType: validatedInput.valueType,
        expiry: validatedInput.expiry,
        claimed: false,
        redeemed: false,
        assetId,
        createdAt: Date.now(),
        currentRedemptions: 0,
        maxRedemptions: validatedInput.maxRedemptions,
        terms: validatedInput.terms,
      }

      fallbackStorage.setCoupons([newCoupon, ...coupons])

      // Create transaction record
      const transactions = fallbackStorage.getTransactions()
      const newTransaction = {
        id: `tx-${Date.now()}`,
        type: "create" as const,
        couponId: newCoupon.id,
        userAddress: merchantAddress,
        merchantAddress,
        timestamp: Date.now(),
        txHash: `TX_${Math.random().toString(36).toUpperCase().substr(2, 16)}`,
        status: "confirmed" as const,
      }

      fallbackStorage.setTransactions([newTransaction, ...transactions])

      // Simulate blockchain delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      return newCoupon
    } catch (error) {
      console.error("Create coupon error:", error)
      throw error
    }
  }

  async claimCoupon(input: ClaimCouponInput): Promise<void> {
    try {
      // Validate input
      const validatedInput = claimCouponSchema.parse(input)

      // Try with Supabase first
      try {
        // Get coupon
        const { data: coupon, error: fetchError } = await supabase
          .from("coupons")
          .select("*")
          .eq("id", validatedInput.couponId)
          .single()

        if (fetchError && fetchError.code !== "PGRST116" && fetchError.code !== "DUMMY_CLIENT") throw fetchError

        if (coupon && fetchError?.code !== "DUMMY_CLIENT") {
          if (coupon.claimed) throw new Error("Coupon already claimed")
          if (coupon.expiry < Date.now()) throw new Error("Coupon has expired")

          // Update coupon
          const { error: updateError } = await supabase
            .from("coupons")
            .update({
              claimed: true,
              claimed_at: Date.now(),
            })
            .eq("id", validatedInput.couponId)

          if (updateError && updateError.code !== "DUMMY_CLIENT") throw updateError

          // Create transaction record
          await supabase.from("transactions").insert({
            type: "claim",
            coupon_id: validatedInput.couponId,
            user_address: validatedInput.userAddress,
            merchant_address: coupon.merchant,
            timestamp_ms: Date.now(),
            status: "confirmed",
            tx_hash: `TX_${Math.random().toString(36).toUpperCase().substr(2, 16)}`,
          })

          // Simulate blockchain delay
          await new Promise((resolve) => setTimeout(resolve, 1500))

          if (updateError?.code !== "DUMMY_CLIENT") {
            return // Success with Supabase
          }
        }
      } catch (e: any) {
        if (e.message === "Coupon already claimed" || e.message === "Coupon has expired") {
          throw e
        }
        console.warn("Supabase claim coupon failed, falling back to localStorage", e)
      }

      // Fallback to localStorage
      const coupons = fallbackStorage.getCoupons()
      const couponIndex = coupons.findIndex((c) => c.id === validatedInput.couponId)

      if (couponIndex === -1) throw new Error("Coupon not found")

      const coupon = coupons[couponIndex]
      if (coupon.claimed) throw new Error("Coupon already claimed")
      if (coupon.expiry < Date.now()) throw new Error("Coupon has expired")

      // Update coupon
      coupons[couponIndex] = {
        ...coupon,
        claimed: true,
        claimedAt: Date.now(),
      }

      fallbackStorage.setCoupons(coupons)

      // Create transaction record
      const transactions = fallbackStorage.getTransactions()
      const newTransaction = {
        id: `tx-${Date.now()}`,
        type: "claim" as const,
        couponId: validatedInput.couponId,
        userAddress: validatedInput.userAddress,
        merchantAddress: coupon.merchant,
        timestamp: Date.now(),
        txHash: `TX_${Math.random().toString(36).toUpperCase().substr(2, 16)}`,
        status: "confirmed" as const,
      }

      fallbackStorage.setTransactions([newTransaction, ...transactions])

      // Simulate blockchain delay
      await new Promise((resolve) => setTimeout(resolve, 1500))
    } catch (error) {
      console.error("Claim coupon error:", error)
      throw error
    }
  }

  async redeemCoupon(input: RedeemCouponInput): Promise<void> {
    try {
      // Validate input
      const validatedInput = redeemCouponSchema.parse(input)

      // Try with Supabase first
      try {
        // Get coupon
        const { data: coupon, error: fetchError } = await supabase
          .from("coupons")
          .select("*")
          .eq("id", validatedInput.couponId)
          .single()

        if (fetchError && fetchError.code !== "PGRST116" && fetchError.code !== "DUMMY_CLIENT") throw fetchError

        if (coupon && fetchError?.code !== "DUMMY_CLIENT") {
          if (!coupon.claimed) throw new Error("Coupon must be claimed before redemption")
          if (coupon.redeemed) throw new Error("Coupon already redeemed")
          if (coupon.merchant !== validatedInput.merchantAddress) {
            throw new Error("Only the issuing merchant can redeem this coupon")
          }
          if (coupon.expiry < Date.now()) throw new Error("Coupon has expired")

          // Update coupon
          const { error: updateError } = await supabase
            .from("coupons")
            .update({
              redeemed: true,
              redeemed_at: Date.now(),
              current_redemptions: coupon.current_redemptions + 1,
            })
            .eq("id", validatedInput.couponId)

          if (updateError && updateError.code !== "DUMMY_CLIENT") throw updateError

          // Create transaction record
          await supabase.from("transactions").insert({
            type: "redeem",
            coupon_id: validatedInput.couponId,
            user_address: validatedInput.userAddress,
            merchant_address: validatedInput.merchantAddress,
            timestamp_ms: Date.now(),
            status: "confirmed",
            tx_hash: `TX_${Math.random().toString(36).toUpperCase().substr(2, 16)}`,
          })

          // Simulate blockchain delay
          await new Promise((resolve) => setTimeout(resolve, 2000))

          if (updateError?.code !== "DUMMY_CLIENT") {
            return // Success with Supabase
          }
        }
      } catch (e: any) {
        if (
          e.message === "Coupon must be claimed before redemption" ||
          e.message === "Coupon already redeemed" ||
          e.message === "Only the issuing merchant can redeem this coupon" ||
          e.message === "Coupon has expired"
        ) {
          throw e
        }
        console.warn("Supabase redeem coupon failed, falling back to localStorage", e)
      }

      // Fallback to localStorage
      const coupons = fallbackStorage.getCoupons()
      const couponIndex = coupons.findIndex((c) => c.id === validatedInput.couponId)

      if (couponIndex === -1) throw new Error("Coupon not found")

      const coupon = coupons[couponIndex]
      if (!coupon.claimed) throw new Error("Coupon must be claimed before redemption")
      if (coupon.redeemed) throw new Error("Coupon already redeemed")
      if (coupon.merchant !== validatedInput.merchantAddress) {
        throw new Error("Only the issuing merchant can redeem this coupon")
      }
      if (coupon.expiry < Date.now()) throw new Error("Coupon has expired")

      // Update coupon
      coupons[couponIndex] = {
        ...coupon,
        redeemed: true,
        redeemedAt: Date.now(),
        currentRedemptions: coupon.currentRedemptions + 1,
      }

      fallbackStorage.setCoupons(coupons)

      // Create transaction record
      const transactions = fallbackStorage.getTransactions()
      const newTransaction = {
        id: `tx-${Date.now()}`,
        type: "redeem" as const,
        couponId: validatedInput.couponId,
        userAddress: validatedInput.userAddress,
        merchantAddress: validatedInput.merchantAddress,
        timestamp: Date.now(),
        txHash: `TX_${Math.random().toString(36).toUpperCase().substr(2, 16)}`,
        status: "confirmed" as const,
      }

      fallbackStorage.setTransactions([newTransaction, ...transactions])

      // Simulate blockchain delay
      await new Promise((resolve) => setTimeout(resolve, 2000))
    } catch (error) {
      console.error("Redeem coupon error:", error)
      throw error
    }
  }

  async getCoupons(): Promise<Coupon[]> {
    try {
      // Try with Supabase first
      try {
        const { data: coupons, error } = await supabase
          .from("coupons")
          .select("*")
          .order("created_at", { ascending: false })

        if (error && error.code !== "DUMMY_CLIENT") throw error

        if (coupons && coupons.length >= 0 && error?.code !== "DUMMY_CLIENT") {
          return coupons.map(this.mapDatabaseCouponToCoupon)
        }
      } catch (e) {
        console.warn("Supabase get coupons failed, falling back to localStorage", e)
      }

      // Fallback to localStorage
      return fallbackStorage.getCoupons()
    } catch (error) {
      console.error("Get coupons error:", error)
      return []
    }
  }

  async getCouponById(id: string): Promise<Coupon | undefined> {
    try {
      // Try with Supabase first
      try {
        const { data: coupon, error } = await supabase.from("coupons").select("*").eq("id", id).single()

        if (error && error.code !== "PGRST116" && error.code !== "DUMMY_CLIENT") throw error
        if (coupon && error?.code !== "DUMMY_CLIENT") {
          return this.mapDatabaseCouponToCoupon(coupon)
        }
      } catch (e) {
        console.warn("Supabase get coupon by ID failed, falling back to localStorage", e)
      }

      // Fallback to localStorage
      const coupons = fallbackStorage.getCoupons()
      return coupons.find((c) => c.id === id)
    } catch (error) {
      console.error("Get coupon by ID error:", error)
      return undefined
    }
  }

  async getCouponsByMerchant(merchantAddress: string): Promise<Coupon[]> {
    try {
      // Try with Supabase first
      try {
        const { data: coupons, error } = await supabase
          .from("coupons")
          .select("*")
          .eq("merchant", merchantAddress)
          .order("created_at", { ascending: false })

        if (error && error.code !== "DUMMY_CLIENT") throw error

        if (coupons && coupons.length >= 0 && error?.code !== "DUMMY_CLIENT") {
          return coupons.map(this.mapDatabaseCouponToCoupon)
        }
      } catch (e) {
        console.warn("Supabase get coupons by merchant failed, falling back to localStorage", e)
      }

      // Fallback to localStorage
      const coupons = fallbackStorage.getCoupons()
      return coupons.filter((c) => c.merchant === merchantAddress)
    } catch (error) {
      console.error("Get coupons by merchant error:", error)
      return []
    }
  }

  async getAvailableCoupons(): Promise<Coupon[]> {
    try {
      // Try with Supabase first
      try {
        const { data: coupons, error } = await supabase
          .from("coupons")
          .select("*")
          .eq("claimed", false)
          .eq("redeemed", false)
          .gt("expiry", Date.now())
          .order("created_at", { ascending: false })

        if (error && error.code !== "DUMMY_CLIENT") throw error

        if (coupons && coupons.length >= 0 && error?.code !== "DUMMY_CLIENT") {
          return coupons.map(this.mapDatabaseCouponToCoupon)
        }
      } catch (e) {
        console.warn("Supabase get available coupons failed, falling back to localStorage", e)
      }

      // Fallback to localStorage
      const coupons = fallbackStorage.getCoupons()
      return coupons.filter((c) => !c.claimed && !c.redeemed && c.expiry > Date.now())
    } catch (error) {
      console.error("Get available coupons error:", error)
      return []
    }
  }

  async getUserCoupons(userAddress: string): Promise<Coupon[]> {
    try {
      // Try with Supabase first
      try {
        // In a real implementation, you'd track which user claimed which coupon
        // For now, return claimed but not redeemed coupons
        const { data: coupons, error } = await supabase
          .from("coupons")
          .select("*")
          .eq("claimed", true)
          .eq("redeemed", false)
          .order("claimed_at", { ascending: false })

        if (error && error.code !== "DUMMY_CLIENT") throw error

        if (coupons && coupons.length >= 0 && error?.code !== "DUMMY_CLIENT") {
          return coupons.map(this.mapDatabaseCouponToCoupon)
        }
      } catch (e) {
        console.warn("Supabase get user coupons failed, falling back to localStorage", e)
      }

      // Fallback to localStorage
      const coupons = fallbackStorage.getCoupons()
      return coupons.filter((c) => c.claimed && !c.redeemed)
    } catch (error) {
      console.error("Get user coupons error:", error)
      return []
    }
  }

  private mapDatabaseCouponToCoupon(dbCoupon: any): Coupon {
    return {
      id: dbCoupon.id,
      name: dbCoupon.name,
      description: dbCoupon.description,
      merchant: dbCoupon.merchant,
      merchantName: dbCoupon.merchant_name,
      category: dbCoupon.category,
      value: dbCoupon.value,
      valueType: dbCoupon.value_type,
      expiry: dbCoupon.expiry,
      claimed: dbCoupon.claimed,
      redeemed: dbCoupon.redeemed,
      assetId: dbCoupon.asset_id,
      createdAt: dbCoupon.created_at_timestamp,
      claimedAt: dbCoupon.claimed_at,
      redeemedAt: dbCoupon.redeemed_at,
      maxRedemptions: dbCoupon.max_redemptions,
      currentRedemptions: dbCoupon.current_redemptions,
      terms: dbCoupon.terms,
      imageUrl: dbCoupon.image_url,
    }
  }
}

export const couponService = new CouponService()

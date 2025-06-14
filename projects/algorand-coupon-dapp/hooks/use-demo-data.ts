"use client"

import { useEffect } from "react"
import { fallbackStorage } from "@/lib/storage-fallback"
import { SAMPLE_COUPONS, SAMPLE_MERCHANTS, SAMPLE_TRANSACTIONS } from "@/data/sample-data"

export function useDemoData() {
  useEffect(() => {
    // Initialize demo data if not already present
    const existingCoupons = fallbackStorage.getCoupons()
    const existingMerchants = fallbackStorage.getMerchants()
    const existingTransactions = fallbackStorage.getTransactions()

    if (existingCoupons.length === 0) {
      fallbackStorage.setCoupons(SAMPLE_COUPONS)
    }

    if (existingMerchants.length === 0) {
      fallbackStorage.setMerchants(SAMPLE_MERCHANTS)
    }

    if (existingTransactions.length === 0) {
      fallbackStorage.setTransactions(SAMPLE_TRANSACTIONS)
    }
  }, [])
}

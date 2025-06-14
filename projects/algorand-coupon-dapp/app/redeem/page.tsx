"use client"

import { AppLayout } from "@/components/layouts/app-layout"
import { PageHeader } from "@/components/ui/page-header"
import { QRScanner } from "@/components/qr-scanner"
import { useCoupons } from "@/hooks/use-coupons"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { UserRole } from "@/types/auth"

export default function RedeemPage() {
  const { redeemCoupon } = useCoupons()

  const handleQRScan = async (address: string) => {
    console.log("Scanned address:", address)
    // In a real implementation, you would:
    // 1. Find the coupon associated with this address
    // 2. Verify the merchant has permission to redeem
    // 3. Execute the clawback transaction
    // 4. Burn the ASA
  }

  return (
    <ProtectedRoute requireAuth requiredRole={UserRole.MERCHANT}>
      <AppLayout>
        <div className="space-y-6">
          <PageHeader
            title="Redeem Coupons"
            description="Scan customer QR codes to redeem their coupons instantly"
            gradient="from-orange-600 to-red-600"
          />

          <QRScanner onScan={handleQRScan} />
        </div>
      </AppLayout>
    </ProtectedRoute>
  )
}

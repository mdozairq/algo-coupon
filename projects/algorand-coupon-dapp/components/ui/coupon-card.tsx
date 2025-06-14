"use client"

import { Calendar, Gift, Store, Clock, CheckCircle } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Coupon } from "@/types"
import { COUPON_CATEGORIES } from "@/constants"

interface CouponCardProps {
  coupon: Coupon
  onClaim?: (couponId: string) => void
  onRedeem?: (couponId: string) => void
  showActions?: boolean
  isLoading?: boolean
  userRole?: "user" | "merchant"
}

export function CouponCard({
  coupon,
  onClaim,
  onRedeem,
  showActions = true,
  isLoading = false,
  userRole = "user",
}: CouponCardProps) {
  const category = COUPON_CATEGORIES.find((c) => c.value === coupon.category)
  const isExpired = coupon.expiry < Date.now()
  const canClaim = !coupon.claimed && !coupon.redeemed && !isExpired
  const canRedeem = coupon.claimed && !coupon.redeemed && !isExpired && userRole === "merchant"

  const getStatusColor = () => {
    if (coupon.redeemed) return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
    if (coupon.claimed) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
    if (isExpired) return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
    return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
  }

  const getStatusText = () => {
    if (coupon.redeemed) return "Redeemed"
    if (coupon.claimed) return "Claimed"
    if (isExpired) return "Expired"
    return "Available"
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{category?.emoji}</span>
            <div>
              <h3 className="font-semibold text-lg">{coupon.name}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Store className="h-3 w-3" />
                {coupon.merchantName}
              </div>
            </div>
          </div>
          <Badge className={getStatusColor()}>{getStatusText()}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{coupon.description}</p>

        {/* Value Display */}
        <div className="flex items-center gap-2">
          <Gift className="h-4 w-4 text-green-600" />
          <span className="font-semibold text-green-600">
            {coupon.valueType === "percentage" ? `${coupon.value}% OFF` : `$${coupon.value} OFF`}
          </span>
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap gap-2 text-xs">
          <Badge variant="outline" className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Expires {new Date(coupon.expiry).toLocaleDateString()}
          </Badge>
          <Badge variant="outline">ASA #{coupon.assetId}</Badge>
          {coupon.maxRedemptions && (
            <Badge variant="outline">
              {coupon.currentRedemptions}/{coupon.maxRedemptions} used
            </Badge>
          )}
        </div>

        {/* Terms */}
        {coupon.terms && (
          <div className="text-xs text-muted-foreground bg-gray-50 dark:bg-gray-800 p-2 rounded">
            <strong>Terms:</strong> {coupon.terms}
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2 pt-2">
            {canClaim && onClaim && (
              <Button
                onClick={() => onClaim(coupon.id)}
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isLoading ? "Claiming..." : "Claim Coupon"}
              </Button>
            )}

            {canRedeem && onRedeem && (
              <Button
                onClick={() => onRedeem(coupon.id)}
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                {isLoading ? "Redeeming..." : "Redeem"}
              </Button>
            )}

            {coupon.claimed && !coupon.redeemed && userRole === "user" && (
              <div className="flex-1 flex items-center justify-center gap-2 text-green-600 bg-green-50 dark:bg-green-950 rounded-md py-2">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Ready to Redeem</span>
              </div>
            )}
          </div>
        )}

        {/* Timestamps */}
        <div className="text-xs text-muted-foreground space-y-1">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Created {new Date(coupon.createdAt).toLocaleDateString()}
          </div>
          {coupon.claimedAt && <div>Claimed {new Date(coupon.claimedAt).toLocaleDateString()}</div>}
          {coupon.redeemedAt && <div>Redeemed {new Date(coupon.redeemedAt).toLocaleDateString()}</div>}
        </div>
      </CardContent>
    </Card>
  )
}

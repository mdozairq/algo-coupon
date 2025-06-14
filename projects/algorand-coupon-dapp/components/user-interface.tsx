"use client"

import { useState } from "react"
import { Gift, CheckCircle, Sparkles, User, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { claimCoupon, type Coupon, type AlgorandAccount } from "@/lib/algorand"
import { toast } from "@/hooks/use-toast"

interface UserInterfaceProps {
  account: AlgorandAccount
  coupons: Coupon[]
  onCouponClaimed: (couponId: number) => void
}

export function UserInterface({ account, coupons, onCouponClaimed }: UserInterfaceProps) {
  const [claimingId, setClaimingId] = useState<number | null>(null)

  const handleClaimCoupon = async (coupon: Coupon) => {
    setClaimingId(coupon.id)
    try {
      await claimCoupon(account.address, coupon)
      onCouponClaimed(coupon.id)
      toast({
        title: "Coupon Claimed! 🎉",
        description: `${coupon.name} has been added to your wallet`,
      })
    } catch (error) {
      console.error("Failed to claim coupon:", error)
      toast({
        title: "Claim Failed",
        description: "Failed to claim coupon. Please try again.",
        variant: "destructive",
      })
    } finally {
      setClaimingId(null)
    }
  }

  const availableCoupons = coupons.filter((c) => !c.claimed && !c.redeemed)
  const userCoupons = coupons.filter((c) => c.claimed && !c.redeemed)

  const isExpired = (expiry: number) => Date.now() > expiry

  return (
    <div className="space-y-6">
      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/50 dark:to-teal-950/50 border-emerald-200 dark:border-emerald-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Available Coupons</p>
                <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">{availableCoupons.length}</p>
              </div>
              <Sparkles className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Your Coupons</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{userCoupons.length}</p>
              </div>
              <User className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Available Coupons */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900 dark:to-purple-900 rounded-full">
              <Sparkles className="h-4 w-4 text-pink-600 dark:text-pink-400" />
            </div>
            Available Coupons
          </CardTitle>
          <CardDescription>Discover and claim coupons from merchants on Algorand</CardDescription>
        </CardHeader>
        <CardContent>
          {availableCoupons.length === 0 ? (
            <div className="text-center py-12">
              <Gift className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No coupons available</p>
              <p className="text-sm text-muted-foreground">Check back later for new offers</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {availableCoupons.map((coupon) => (
                <div
                  key={coupon.id}
                  className="p-4 border rounded-lg bg-gradient-to-r from-white to-pink-50 dark:from-gray-900 dark:to-pink-950/20 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900 dark:to-purple-900 rounded-full">
                          <Gift className="h-3 w-3 text-pink-600 dark:text-pink-400" />
                        </div>
                        <h3 className="font-semibold">{coupon.name}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{coupon.description}</p>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="text-xs flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Expires {new Date(coupon.expiry).toLocaleDateString()}
                        </Badge>
                        {isExpired(coupon.expiry) && (
                          <Badge variant="destructive" className="text-xs">
                            Expired
                          </Badge>
                        )}
                        <Badge variant="secondary" className="text-xs">
                          ASA #{coupon.assetId}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleClaimCoupon(coupon)}
                      disabled={claimingId === coupon.id || isExpired(coupon.expiry)}
                      className="ml-4 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white shadow-lg"
                    >
                      {claimingId === coupon.id ? "Claiming..." : "Claim"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* User's Claimed Coupons */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 rounded-full">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            Your Coupons ({userCoupons.length})
          </CardTitle>
          <CardDescription>Coupons you've claimed and can redeem at participating merchants</CardDescription>
        </CardHeader>
        <CardContent>
          {userCoupons.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No claimed coupons yet</p>
              <p className="text-sm text-muted-foreground">Claim some coupons above to get started</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {userCoupons.map((coupon) => (
                <div
                  key={coupon.id}
                  className="p-4 border rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 rounded-full">
                          <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="font-semibold text-green-900 dark:text-green-100">{coupon.name}</h3>
                      </div>
                      <p className="text-sm text-green-700 dark:text-green-300 mb-3">{coupon.description}</p>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          Claimed ✓
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          ASA #{coupon.assetId}
                        </Badge>
                        <Badge variant="outline" className="text-xs flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(coupon.expiry).toLocaleDateString()}
                        </Badge>
                      </div>
                    </div>
                    <div className="ml-4 text-right">
                      <p className="text-xs text-green-600 dark:text-green-400 font-medium">Ready to redeem</p>
                      <p className="text-xs text-muted-foreground">Show to merchant</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

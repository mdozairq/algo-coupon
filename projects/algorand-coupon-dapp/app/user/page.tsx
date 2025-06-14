"use client"

import { useState } from "react"
import { Sparkles, Gift, Search, Filter, User } from "lucide-react"
import { AppLayout } from "@/components/layouts/app-layout"
import { PageHeader } from "@/components/ui/page-header"
import { StatsGrid } from "@/components/ui/stats-grid"
import { CouponCard } from "@/components/ui/coupon-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/components/auth/auth-provider"
import { useCoupons } from "@/hooks/use-coupons"
import { COUPON_CATEGORIES } from "@/constants"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"

export default function UserPage() {
  const { user } = useAuth()
  const { availableCoupons, userCoupons, claimCoupon, loading } = useCoupons()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [claimingId, setClaimingId] = useState<string | null>(null)

  // Filter coupons based on search and category
  const filteredCoupons = availableCoupons.filter((coupon) => {
    const matchesSearch =
      coupon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coupon.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coupon.merchantName.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = selectedCategory === "all" || coupon.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  const handleClaimCoupon = async (couponId: string) => {
    if (!user) return

    // Admin with credentials login can't claim coupons (no wallet)
    if (user.address === "ADMIN_CREDENTIALS_LOGIN") {
      toast({
        title: "Wallet Required",
        description: "Please connect a wallet to claim coupons",
        variant: "destructive",
      })
      return
    }

    try {
      setClaimingId(couponId)
      await claimCoupon(couponId, user.address)
    } catch (error) {
      console.error("Failed to claim coupon:", error)
    } finally {
      setClaimingId(null)
    }
  }

  // Get user-specific coupons (only for wallet-connected users)
  const actualUserCoupons =
    user?.address !== "ADMIN_CREDENTIALS_LOGIN" ? userCoupons.filter((c) => c.claimed && !c.redeemed) : []

  const userStats = [
    {
      label: "Available Coupons",
      value: availableCoupons.length,
      icon: Sparkles,
      gradient:
        "from-emerald-50 to-teal-50 dark:from-emerald-950/50 dark:to-teal-950/50 text-emerald-600 dark:text-emerald-400",
      description: "Ready to claim",
    },
    {
      label: "Your Coupons",
      value: actualUserCoupons.length,
      icon: Gift,
      gradient:
        "from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 text-blue-600 dark:text-blue-400",
      description: user?.address === "ADMIN_CREDENTIALS_LOGIN" ? "Connect wallet" : "In your wallet",
    },
  ]

  return (
    <AppLayout requireAuth>
      <div className="space-y-6">
        <PageHeader
          title="Browse Coupons"
          description="Discover and claim amazing coupons from merchants on Algorand"
          gradient="from-blue-600 to-purple-600"
        />

        <StatsGrid stats={userStats} columns={2} />

        {/* Wallet Connection Notice for Admin */}
        {user?.address === "ADMIN_CREDENTIALS_LOGIN" && (
          <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/50 dark:to-orange-950/50 border-yellow-200 dark:border-yellow-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-full">
                  <User className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="font-medium text-yellow-800 dark:text-yellow-200">Admin Viewing Mode</p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    You're viewing as admin. Connect a wallet to claim coupons or access merchant features.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Rest of the component remains the same... */}
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search coupons, merchants, or categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {COUPON_CATEGORIES.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.emoji} {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Available Coupons */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Available Coupons ({filteredCoupons.length})</h2>

          {filteredCoupons.length === 0 ? (
            <div className="text-center py-12">
              <Gift className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm || selectedCategory !== "all"
                  ? "No coupons match your search criteria"
                  : "No coupons available"}
              </p>
              {(searchTerm || selectedCategory !== "all") && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("")
                    setSelectedCategory("all")
                  }}
                  className="mt-2"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCoupons.map((coupon) => (
                <CouponCard
                  key={coupon.id}
                  coupon={coupon}
                  onClaim={handleClaimCoupon}
                  isLoading={claimingId === coupon.id}
                  userRole="user"
                  showActions={user?.address !== "ADMIN_CREDENTIALS_LOGIN"}
                />
              ))}
            </div>
          )}
        </div>

        {/* User's Claimed Coupons */}
        {actualUserCoupons.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Your Coupons ({actualUserCoupons.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {actualUserCoupons.map((coupon) => (
                <CouponCard key={coupon.id} coupon={coupon} showActions={false} userRole="user" />
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}

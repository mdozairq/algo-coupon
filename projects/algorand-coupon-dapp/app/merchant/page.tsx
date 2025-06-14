"use client"

import type React from "react"

import { useState } from "react"
import { Store, Gift, TrendingUp, QrCode, Plus } from "lucide-react"
import { AppLayout } from "@/components/layouts/app-layout"
import { PageHeader } from "@/components/ui/page-header"
import { StatsGrid } from "@/components/ui/stats-grid"
import { CouponCard } from "@/components/ui/coupon-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/components/auth/auth-provider"
import { useCoupons } from "@/hooks/use-coupons"
import { COUPON_CATEGORIES } from "@/constants"
import type { CreateCouponInput } from "@/types"
import { CouponCategory } from "@/types"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { UserRole } from "@/types/auth"

export default function MerchantPage() {
  const { user } = useAuth()
  const { coupons, createCoupon, redeemCoupon, loading } = useCoupons()
  const [isCreating, setIsCreating] = useState(false)
  const [redeemingId, setRedeemingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<CreateCouponInput>({
    name: "",
    description: "",
    category: CouponCategory.FOOD,
    value: 10,
    valueType: "percentage",
    expiry: Date.now() + 86400000 * 30, // 30 days from now
    maxRedemptions: 50,
    terms: "",
  })

  const merchantCoupons = coupons.filter((c) => c.merchant === user?.address)
  const activeCoupons = merchantCoupons.filter((c) => !c.claimed && !c.redeemed && c.expiry > Date.now())
  const claimedCoupons = merchantCoupons.filter((c) => c.claimed && !c.redeemed)
  const redeemedCoupons = merchantCoupons.filter((c) => c.redeemed)

  const stats = [
    {
      label: "Total Coupons",
      value: merchantCoupons.length,
      icon: Store,
      gradient: "from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 text-blue-600 dark:text-blue-400",
      description: "All time",
    },
    {
      label: "Active",
      value: activeCoupons.length,
      icon: Gift,
      gradient:
        "from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50 text-green-600 dark:text-green-400",
      description: "Available to claim",
    },
    {
      label: "Claimed",
      value: claimedCoupons.length,
      icon: TrendingUp,
      gradient:
        "from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/50 text-orange-600 dark:text-orange-400",
      description: "Ready to redeem",
    },
    {
      label: "Redeemed",
      value: redeemedCoupons.length,
      icon: QrCode,
      gradient:
        "from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50 text-purple-600 dark:text-purple-400",
      description: "Completed",
    },
  ]

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      setIsCreating(true)
      await createCoupon(formData, user.address)

      // Reset form
      setFormData({
        name: "",
        description: "",
        category: CouponCategory.FOOD,
        value: 10,
        valueType: "percentage",
        expiry: Date.now() + 86400000 * 30,
        maxRedemptions: 50,
        terms: "",
      })
    } catch (error) {
      console.error("Failed to create coupon:", error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleRedeemCoupon = async (couponId: string) => {
    if (!user) return

    try {
      setRedeemingId(couponId)
      // In a real implementation, you'd get the user address from QR scan
      const mockUserAddress = "USER_ADDRESS_FROM_QR_SCAN"
      await redeemCoupon(couponId, mockUserAddress, user.address)
    } catch (error) {
      console.error("Failed to redeem coupon:", error)
    } finally {
      setRedeemingId(null)
    }
  }

  return (
    <ProtectedRoute requireAuth requiredRole={UserRole.MERCHANT}>
      <AppLayout>
        <div className="space-y-6">
          <PageHeader
            title="Merchant Dashboard"
            description="Create and manage your digital coupons on the Algorand blockchain"
            gradient="from-green-600 to-emerald-600"
          />

          <StatsGrid stats={stats} />

          {/* Create Coupon Form */}
          <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border-indigo-200 dark:border-indigo-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-indigo-900 dark:text-indigo-100">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-full">
                  <Plus className="h-4 w-4" />
                </div>
                Create New Coupon
              </CardTitle>
              <CardDescription className="text-indigo-700 dark:text-indigo-300">
                Issue a new coupon as an Algorand Standard Asset (ASA)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateCoupon} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Coupon Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Free Coffee"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value as CouponCategory })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {COUPON_CATEGORIES.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.emoji} {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Get a free coffee with any pastry purchase"
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="value">Value</Label>
                    <Input
                      id="value"
                      type="number"
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                      min="1"
                      max="100"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="valueType">Value Type</Label>
                    <Select
                      value={formData.valueType}
                      onValueChange={(value) =>
                        setFormData({ ...formData, valueType: value as "percentage" | "fixed" })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage (%)</SelectItem>
                        <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="maxRedemptions">Max Redemptions</Label>
                    <Input
                      id="maxRedemptions"
                      type="number"
                      value={formData.maxRedemptions}
                      onChange={(e) => setFormData({ ...formData, maxRedemptions: Number(e.target.value) })}
                      min="1"
                      max="1000"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="expiry">Expiry Date</Label>
                  <Input
                    id="expiry"
                    type="datetime-local"
                    value={new Date(formData.expiry).toISOString().slice(0, 16)}
                    onChange={(e) => setFormData({ ...formData, expiry: new Date(e.target.value).getTime() })}
                    min={new Date(Date.now() + 86400000).toISOString().slice(0, 16)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="terms">Terms & Conditions (Optional)</Label>
                  <Textarea
                    id="terms"
                    value={formData.terms}
                    onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                    placeholder="Valid with purchase of any pastry. One per customer per day."
                    rows={2}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isCreating}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {isCreating ? "Creating..." : "Create Coupon"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Merchant's Coupons */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Your Coupons ({merchantCoupons.length})</h2>

            {merchantCoupons.length === 0 ? (
              <div className="text-center py-12">
                <Gift className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No coupons created yet</p>
                <p className="text-sm text-muted-foreground">Create your first coupon to get started</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {merchantCoupons.map((coupon) => (
                  <CouponCard
                    key={coupon.id}
                    coupon={coupon}
                    onRedeem={handleRedeemCoupon}
                    isLoading={redeemingId === coupon.id}
                    userRole="merchant"
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </AppLayout>
    </ProtectedRoute>
  )
}

"use client"

import type React from "react"
import { useState } from "react"
import { Plus, QrCode, Store, Calendar, Gift, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { createCoupon, redeemCoupon, type Coupon, type AlgorandAccount } from "@/lib/algorand"
import { toast } from "@/hooks/use-toast"

interface MerchantDashboardProps {
  account: AlgorandAccount
  coupons: Coupon[]
  onCouponCreated: (coupon: Coupon) => void
  onCouponRedeemed: (couponId: number) => void
}

export function MerchantDashboard({ account, coupons, onCouponCreated, onCouponRedeemed }: MerchantDashboardProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    expiry: "",
  })

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)

    try {
      const expiryTimestamp = new Date(formData.expiry).getTime()
      const coupon = await createCoupon(account.address, formData.name, formData.description, expiryTimestamp)

      onCouponCreated(coupon)
      setFormData({ name: "", description: "", expiry: "" })
      toast({
        title: "Coupon Created!",
        description: `${formData.name} has been minted as ASA #${coupon.assetId}`,
      })
    } catch (error) {
      console.error("Failed to create coupon:", error)
      toast({
        title: "Creation Failed",
        description: "Failed to create coupon. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleRedeemCoupon = async (coupon: Coupon) => {
    try {
      const mockUserAddress = "USER_ADDRESS_FROM_QR"
      await redeemCoupon(account.address, mockUserAddress, coupon)
      onCouponRedeemed(coupon.id)
      toast({
        title: "Coupon Redeemed!",
        description: `${coupon.name} has been successfully redeemed and burned.`,
      })
    } catch (error) {
      console.error("Failed to redeem coupon:", error)
      toast({
        title: "Redemption Failed",
        description: "Failed to redeem coupon. Please try again.",
        variant: "destructive",
      })
    }
  }

  const merchantCoupons = coupons.filter((c) => c.merchant === account.address)
  const stats = {
    total: merchantCoupons.length,
    claimed: merchantCoupons.filter((c) => c.claimed).length,
    redeemed: merchantCoupons.filter((c) => c.redeemed).length,
    active: merchantCoupons.filter((c) => !c.claimed && !c.redeemed).length,
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Coupons</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.total}</p>
              </div>
              <Store className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50 border-green-200 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">Active</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.active}</p>
              </div>
              <Gift className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/50 border-orange-200 dark:border-orange-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Claimed</p>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{stats.claimed}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50 border-purple-200 dark:border-purple-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Redeemed</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{stats.redeemed}</p>
              </div>
              <QrCode className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

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
                <Label htmlFor="name" className="text-sm font-medium">
                  Coupon Name
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Free Coffee"
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="expiry" className="text-sm font-medium">
                  Expiry Date
                </Label>
                <Input
                  id="expiry"
                  type="datetime-local"
                  value={formData.expiry}
                  onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
                  className="mt-1"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="description" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Get a free coffee with any pastry purchase"
                className="mt-1"
                rows={3}
                required
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

      {/* Coupons List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Your Coupons ({merchantCoupons.length})
          </CardTitle>
          <CardDescription>Manage your issued coupons</CardDescription>
        </CardHeader>
        <CardContent>
          {merchantCoupons.length === 0 ? (
            <div className="text-center py-12">
              <Gift className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No coupons created yet</p>
              <p className="text-sm text-muted-foreground">Create your first coupon to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {merchantCoupons.map((coupon) => (
                <div
                  key={coupon.id}
                  className="p-4 border rounded-lg bg-gradient-to-r from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Gift className="h-4 w-4 text-blue-500" />
                        <h3 className="font-semibold">{coupon.name}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{coupon.description}</p>
                      <div className="flex flex-wrap gap-2">
                        <Badge
                          variant={coupon.redeemed ? "destructive" : coupon.claimed ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {coupon.redeemed ? "Redeemed" : coupon.claimed ? "Claimed" : "Available"}
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
                    <div className="flex gap-2 ml-4">
                      {coupon.claimed && !coupon.redeemed && (
                        <Button
                          size="sm"
                          onClick={() => handleRedeemCoupon(coupon)}
                          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                        >
                          <QrCode className="mr-2 h-4 w-4" />
                          Redeem
                        </Button>
                      )}
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

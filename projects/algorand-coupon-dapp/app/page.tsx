"use client"

import Link from "next/link"
import { Store, User, QrCode, Sparkles, Shield, Zap, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AppLayout } from "@/components/layouts/app-layout"
import { useAuth } from "@/components/auth/auth-provider"
import { authService } from "@/lib/auth"
import { useCoupons } from "@/hooks/use-coupons"
import { UserRole } from "@/types/auth"
import { Badge } from "@/components/ui/badge"

export default function HomePage() {
  const { user } = useAuth()
  const { coupons } = useCoupons()

  const stats = [
    { label: "Cost Savings", value: "300x", description: "vs traditional systems" },
    { label: "Transaction Speed", value: "4s", description: "average redemption time" },
    { label: "Fraud Rate", value: "0%", description: "blockchain secured" },
    { label: "Network Fees", value: "$0.001", description: "per transaction" },
  ]

  const canAccessMerchant =
    user && authService.canAccessMerchantFeatures(user) && user.address !== "ADMIN_CREDENTIALS_LOGIN"
  const canAccessAdmin = user && authService.canAccessAdminFeatures(user)
  const isAdminWithCredentials = user?.address === "ADMIN_CREDENTIALS_LOGIN"

  return (
    <AppLayout>
      {/* Hero Section */}
      <div className="text-center space-y-8 max-w-4xl mx-auto py-12">
        {/* Main Title */}
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl shadow-xl">
              <Sparkles className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Algo Coupons
          </h1>
          <p className="text-2xl text-muted-foreground max-w-3xl mx-auto">
            The future of digital coupons: trustless, fraud-proof, and lightning-fast on the Algorand blockchain
          </p>
        </div>

        {/* CTA Buttons */}
        {user ? (
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/user">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-xl px-8 py-4 text-lg"
              >
                <User className="mr-2 h-5 w-5" />
                Browse Coupons
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>

            {canAccessMerchant && (
              <Link href="/merchant">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 px-8 py-4 text-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <Store className="mr-2 h-5 w-5" />
                  Merchant Dashboard
                </Button>
              </Link>
            )}

            {!canAccessMerchant && user.role === UserRole.USER && (
              <Link href="/apply-merchant">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 px-8 py-4 text-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <Store className="mr-2 h-5 w-5" />
                  Become a Merchant
                </Button>
              </Link>
            )}

            {canAccessAdmin && (
              <Link href="/admin">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 px-8 py-4 text-lg hover:bg-gray-50 dark:hover:bg-gray-800 border-purple-300"
                >
                  <Shield className="mr-2 h-5 w-5" />
                  Admin Panel
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-lg text-muted-foreground">Connect your wallet to get started</p>
            <Link href="/auth">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-xl px-8 py-4 text-lg"
              >
                Connect Wallet
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        )}

        {/* User Role Badge */}
        {user && (
          <div className="flex justify-center">
            <div className="px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 rounded-full border border-blue-200 dark:border-blue-800">
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Logged in as: <span className="capitalize font-bold">{user.role}</span>
                {isAdminWithCredentials && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    Credentials
                  </Badge>
                )}
              </span>
            </div>
          </div>
        )}

        {/* Admin Notice */}
        {isAdminWithCredentials && (
          <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/50 dark:to-orange-950/50 border-yellow-200 dark:border-yellow-800 max-w-2xl mx-auto">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-full">
                  <Shield className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-yellow-800 dark:text-yellow-200">Admin Mode Active</p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    You're logged in as admin. Connect a wallet for full merchant/user features.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        {user && coupons.length > 0 && !isAdminWithCredentials && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mt-8">
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{coupons.length}</div>
                <div className="text-sm text-muted-foreground">Total Coupons</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {coupons.filter((c) => !c.claimed && !c.redeemed).length}
                </div>
                <div className="text-sm text-muted-foreground">Available</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/50 dark:to-red-950/50">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {coupons.filter((c) => c.claimed && !c.redeemed).length}
                </div>
                <div className="text-sm text-muted-foreground">Claimed</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{coupons.filter((c) => c.redeemed).length}</div>
                <div className="text-sm text-muted-foreground">Redeemed</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Platform Stats for Admin */}
        {isAdminWithCredentials && coupons.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mt-8">
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{coupons.length}</div>
                <div className="text-sm text-muted-foreground">Platform Coupons</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {coupons.filter((c) => !c.claimed && !c.redeemed).length}
                </div>
                <div className="text-sm text-muted-foreground">Available</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/50 dark:to-red-950/50">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {coupons.filter((c) => c.claimed && !c.redeemed).length}
                </div>
                <div className="text-sm text-muted-foreground">Claimed</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{coupons.filter((c) => c.redeemed).length}</div>
                <div className="text-sm text-muted-foreground">Redeemed</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-16">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 border-green-200 dark:border-green-800 shadow-xl">
            <CardContent className="pt-8 pb-8 text-center">
              <div className="p-4 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 rounded-full w-fit mx-auto mb-6">
                <Shield className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">0%</div>
              <div className="text-lg font-semibold text-green-700 dark:text-green-300 mb-2">Fraud Rate</div>
              <div className="text-sm text-muted-foreground">Blockchain-secured authenticity prevents all fraud</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border-blue-200 dark:border-blue-800 shadow-xl">
            <CardContent className="pt-8 pb-8 text-center">
              <div className="p-4 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 rounded-full w-fit mx-auto mb-6">
                <Zap className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">4s</div>
              <div className="text-lg font-semibold text-blue-700 dark:text-blue-300 mb-2">Redemption Time</div>
              <div className="text-sm text-muted-foreground">Lightning-fast Algorand transactions</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50 border-purple-200 dark:border-purple-800 shadow-xl">
            <CardContent className="pt-8 pb-8 text-center">
              <div className="p-4 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-full w-fit mx-auto mb-6">
                <Sparkles className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">$0.001</div>
              <div className="text-lg font-semibold text-purple-700 dark:text-purple-300 mb-2">Cost per Coupon</div>
              <div className="text-sm text-muted-foreground">300x cheaper than traditional systems</div>
            </CardContent>
          </Card>
        </div>

        {/* How it Works */}
        <div className="mt-20 space-y-8">
          <h2 className="text-4xl font-bold text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center space-y-4">
              <div className="p-6 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 rounded-full w-fit mx-auto">
                <Store className="h-12 w-12 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold">1. Merchants Apply</h3>
              <p className="text-muted-foreground">
                Businesses apply for merchant status and get verified by admins before creating coupons
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="p-6 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 rounded-full w-fit mx-auto">
                <User className="h-12 w-12 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold">2. Users Claim</h3>
              <p className="text-muted-foreground">
                Users browse and claim coupons from verified merchants directly to their wallet
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="p-6 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-full w-fit mx-auto">
                <QrCode className="h-12 w-12 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold">3. Secure Redemption</h3>
              <p className="text-muted-foreground">
                QR scan to verify and redeem coupons with blockchain security preventing fraud
              </p>
            </div>
          </div>
        </div>

        {/* Comparison Stats */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stat.value}</div>
              <div className="text-sm font-medium">{stat.label}</div>
              <div className="text-xs text-muted-foreground">{stat.description}</div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  )
}

"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Wallet, Sparkles, User, Store, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/components/auth/auth-provider"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function AuthPage() {
  const { login, loginAdmin, connectWallet, isLoading, account } = useAuth()
  const [connecting, setConnecting] = useState(false)
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const [adminCredentials, setAdminCredentials] = useState({
    username: "",
    password: "",
  })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Add this after the adminCredentials state
  const defaultCredentials = {
    username: process.env.NEXT_PUBLIC_ADMIN_USERNAME || "admin",
    password: process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "algorand2024!",
  }

  const router = useRouter()

  const handleConnect = async () => {
    setConnecting(true)
    try {
      if (!account) {
        await connectWallet()
      } else {
        await login()
      }
      router.push("/")
    } catch (error) {
      console.error("Authentication failed:", error)
    } finally {
      setConnecting(false)
    }
  }

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setConnecting(true)
    try {
      await loginAdmin(adminCredentials.username, adminCredentials.password)
      router.push("/admin")
    } catch (error) {
      console.error("Admin login failed:", error)
    } finally {
      setConnecting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl shadow-xl">
              <Sparkles className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Welcome to Algo Coupons
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Connect your wallet to access the future of digital coupons
          </p>
        </div>

        {/* Auth Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Wallet Auth Card */}
          <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 shadow-xl">
            <CardHeader className="text-center">
              <div className="mx-auto p-3 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full w-fit mb-2">
                <Wallet className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-2xl">Connect Your Wallet</CardTitle>
              <CardDescription>Connect your Pera Wallet for users and merchants</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Button
                onClick={handleConnect}
                disabled={connecting || isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg py-6 text-lg"
              >
                <Wallet className="mr-2 h-5 w-5" />
                {connecting || isLoading ? "Connecting..." : "Connect Pera Wallet"}
              </Button>

              {mounted && account && (
                <div className="p-4 bg-blue-50 dark:bg-blue-950/50 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">Wallet Connected</p>
                  <p className="text-xs font-mono text-blue-600 dark:text-blue-400 break-all">{account.address}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Admin Login Card */}
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50 shadow-xl border-purple-200 dark:border-purple-800">
            <CardHeader className="text-center">
              <div className="mx-auto p-3 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-full w-fit mb-2">
                <Shield className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle className="text-2xl">Admin Access</CardTitle>
              <CardDescription>Login with admin credentials to manage the platform</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!showAdminLogin ? (
                <div className="space-y-4">
                  <Button
                    onClick={() => setShowAdminLogin(true)}
                    variant="outline"
                    className="w-full border-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/50 py-6 text-lg"
                  >
                    <Shield className="mr-2 h-5 w-5" />
                    Admin Login
                  </Button>

                  {/* Show default credentials for demo */}
                  <div className="p-3 bg-purple-50 dark:bg-purple-950/50 rounded-lg border border-purple-200 dark:border-purple-800 text-sm">
                    <p className="font-medium text-purple-800 dark:text-purple-200 mb-1">Demo Credentials:</p>
                    <p className="text-purple-700 dark:text-purple-300">Username: {defaultCredentials.username}</p>
                    <p className="text-purple-700 dark:text-purple-300">Password: {defaultCredentials.password}</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      type="text"
                      value={adminCredentials.username}
                      onChange={(e) => setAdminCredentials({ ...adminCredentials, username: e.target.value })}
                      placeholder={`Enter admin username (default: ${defaultCredentials.username})`}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={adminCredentials.password}
                      onChange={(e) => setAdminCredentials({ ...adminCredentials, password: e.target.value })}
                      placeholder={`Enter admin password (default: ${defaultCredentials.password})`}
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      disabled={connecting}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                    >
                      <Shield className="mr-2 h-4 w-4" />
                      {connecting ? "Logging in..." : "Login"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowAdminLogin(false)
                        setAdminCredentials({ username: "", password: "" })
                      }}
                    >
                      Cancel
                    </Button>
                  </div>

                  {/* Quick fill button for demo */}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setAdminCredentials(defaultCredentials)}
                    className="w-full text-xs"
                  >
                    Use Default Credentials
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Role Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 border-green-200 dark:border-green-800">
            <CardContent className="pt-6 text-center">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full w-fit mx-auto mb-4">
                <User className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">User</h3>
              <p className="text-sm text-green-700 dark:text-green-300">
                Browse and claim coupons from verified merchants
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-6 text-center">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full w-fit mx-auto mb-4">
                <Store className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Merchant</h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Create and manage digital coupons (requires approval)
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50 border-purple-200 dark:border-purple-800">
            <CardContent className="pt-6 text-center">
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full w-fit mx-auto mb-4">
                <Shield className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Admin</h3>
              <p className="text-sm text-purple-700 dark:text-purple-300">
                Manage users, merchants, and platform settings
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Why Choose Algorand Coupons?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto text-sm">
            <div className="space-y-2">
              <div className="text-2xl">🔒</div>
              <p className="font-medium">Fraud-Proof</p>
              <p className="text-muted-foreground">Blockchain security prevents counterfeiting</p>
            </div>
            <div className="space-y-2">
              <div className="text-2xl">⚡</div>
              <p className="font-medium">Lightning Fast</p>
              <p className="text-muted-foreground">4-second transaction finality</p>
            </div>
            <div className="space-y-2">
              <div className="text-2xl">💰</div>
              <p className="font-medium">Low Cost</p>
              <p className="text-muted-foreground">$0.001 per transaction</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
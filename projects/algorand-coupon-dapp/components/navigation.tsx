"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Store, User, QrCode, Sparkles, Home, LogOut, Shield, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/components/auth/auth-provider"
import { authService } from "@/lib/auth"
import { useCoupons } from "@/hooks/use-coupons"
import { UserRole } from "@/types/auth"

export function Navigation() {
  const pathname = usePathname()
  const { user, logout, account } = useAuth()
  const { availableCoupons, coupons } = useCoupons()

  const navItems = [
    {
      href: "/",
      label: "Home",
      icon: Home,
      public: true,
    },
    {
      href: "/user",
      label: "Browse Coupons",
      icon: User,
      badge: availableCoupons.length,
      public: false,
      roles: [UserRole.USER, UserRole.MERCHANT, UserRole.ADMIN],
    },
    {
      href: "/merchant",
      label: "Merchant Dashboard",
      icon: Store,
      badge: user
        ? coupons.filter((c) => c.merchant === user.address && c.merchant !== "ADMIN_CREDENTIALS_LOGIN").length
        : 0,
      public: false,
      roles: [UserRole.MERCHANT, UserRole.ADMIN],
      condition: () => {
        if (!user) return false
        // Show for merchants or admins, but admins need wallet connection for merchant features
        if (user.role === UserRole.ADMIN && user.address === "ADMIN_CREDENTIALS_LOGIN") {
          return false // Admin logged in with credentials can't access merchant features without wallet
        }
        return authService.canAccessMerchantFeatures(user)
      },
    },
    {
      href: "/redeem",
      label: "Redeem",
      icon: QrCode,
      public: false,
      roles: [UserRole.MERCHANT, UserRole.ADMIN],
      condition: () => {
        if (!user) return false
        // Same logic as merchant dashboard
        if (user.role === UserRole.ADMIN && user.address === "ADMIN_CREDENTIALS_LOGIN") {
          return false
        }
        return authService.canAccessMerchantFeatures(user)
      },
    },
    {
      href: "/apply-merchant",
      label: "Become Merchant",
      icon: FileText,
      public: false,
      roles: [UserRole.USER],
      condition: () => {
        if (!user || user.role !== UserRole.USER) return false
        // This would need to be async in a real implementation
        // For now, we'll show it for all users
        return true
      },
    },
    {
      href: "/admin",
      label: "Admin Panel",
      icon: Shield,
      public: false,
      roles: [UserRole.ADMIN],
    },
  ]

  const handleLogout = () => {
    logout()
  }

  const getVisibleNavItems = () => {
    if (!user) return navItems.filter((item) => item.public)

    return navItems.filter((item) => {
      if (item.public) return true
      if (!item.roles) return true

      const hasRole = item.roles.includes(user.role)
      if (!hasRole) return false

      // Special handling for admin panel - only show to actual admins
      if (item.href === "/admin" && !authService.canAccessAdminFeatures(user)) {
        return false
      }

      if (item.condition) return item.condition()

      return true
    })
  }

  const visibleNavItems = getVisibleNavItems()

  return (
    <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Algo Coupons
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">Trustless Digital Coupons</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-2">
            {visibleNavItems.slice(1).map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className={
                      isActive
                        ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md"
                        : "hover:bg-gray-100 dark:hover:bg-gray-800"
                    }
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.label}
                    {item.badge !== undefined && item.badge > 0 && (
                      <Badge variant="secondary" className="ml-2 h-5 text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </Button>
                </Link>
              )
            })}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="hidden sm:flex">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                    {user.role === UserRole.ADMIN ? "Admin" : user.role === UserRole.MERCHANT ? "Merchant" : "User"}
                    {user.address === "ADMIN_CREDENTIALS_LOGIN" && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        Credentials
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <div className="p-3 space-y-2">
                    <p className="text-sm font-medium">
                      {user.address === "ADMIN_CREDENTIALS_LOGIN" ? "Admin Account" : "Wallet Address"}
                    </p>
                    <p className="text-xs font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded break-all">
                      {user.address === "ADMIN_CREDENTIALS_LOGIN" ? "System Administrator" : user.address}
                    </p>
                    <div className="flex justify-between text-sm">
                      <span>Role:</span>
                      <Badge
                        className={
                          user.role === UserRole.ADMIN
                            ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                            : user.role === UserRole.MERCHANT
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                        }
                      >
                        {user.role}
                      </Badge>
                    </div>
                    {account && user.address !== "ADMIN_CREDENTIALS_LOGIN" && (
                      <div className="flex justify-between text-sm">
                        <span>Balance:</span>
                        <span className="font-medium">{(account.balance / 1000000).toFixed(2)} ALGO</span>
                      </div>
                    )}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/auth">
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg">
                  Connect Wallet
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {user && (
          <nav className="lg:hidden flex items-center gap-2 mt-4 overflow-x-auto pb-2">
            {visibleNavItems.slice(1).map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className={
                      isActive
                        ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white whitespace-nowrap shadow-md"
                        : "hover:bg-gray-100 dark:hover:bg-gray-800 whitespace-nowrap"
                    }
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.label}
                    {item.badge !== undefined && item.badge > 0 && (
                      <Badge variant="secondary" className="ml-2 h-5 text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </Button>
                </Link>
              )
            })}
          </nav>
        )}
      </div>
    </header>
  )
}

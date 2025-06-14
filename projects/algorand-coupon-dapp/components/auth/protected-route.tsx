"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import { authService } from "@/lib/auth"
import { UserRole } from "@/types/auth"
import { Loader2, Shield } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: UserRole
  requireAuth?: boolean
}

export function ProtectedRoute({ children, requiredRole, requireAuth = true }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (requireAuth && !isAuthenticated) {
        router.push("/auth")
        return
      }

      if (requiredRole && user) {
        // Check role permissions
        if (requiredRole === UserRole.ADMIN && !authService.canAccessAdminFeatures(user)) {
          router.push("/")
          return
        }

        if (requiredRole === UserRole.MERCHANT && !authService.canAccessMerchantFeatures(user)) {
          router.push("/apply-merchant")
          return
        }
      }
    }
  }, [isLoading, isAuthenticated, user, requiredRole, requireAuth, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (requireAuth && !isAuthenticated) {
    return null
  }

  if (requiredRole && user) {
    const hasPermission =
      (requiredRole === UserRole.ADMIN && authService.canAccessAdminFeatures(user)) ||
      (requiredRole === UserRole.MERCHANT && authService.canAccessMerchantFeatures(user)) ||
      requiredRole === UserRole.USER

    if (!hasPermission) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-slate-900 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto p-3 bg-red-100 dark:bg-red-900 rounded-full w-fit mb-2">
                <Shield className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle className="text-red-900 dark:text-red-100">Access Denied</CardTitle>
              <CardDescription className="text-red-700 dark:text-red-300">
                You don't have permission to access this page
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground mb-4">Required role: {requiredRole}</p>
              <p className="text-sm text-muted-foreground">Your role: {user.role}</p>
            </CardContent>
          </Card>
        </div>
      )
    }
  }

  return <>{children}</>
}

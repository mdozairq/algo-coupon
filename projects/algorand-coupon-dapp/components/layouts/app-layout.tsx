"use client"

import type React from "react"
import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import { Loader2 } from "lucide-react"

interface AppLayoutProps {
  children: React.ReactNode
  requireAuth?: boolean
}

export function AppLayout({ children, requireAuth = false }: AppLayoutProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (requireAuth && !isLoading && !user && pathname !== "/") {
      router.push("/auth")
    }
  }, [user, isLoading, requireAuth, router, pathname])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-slate-900">
        <Navigation />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  if (requireAuth && !user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-slate-900">
      <Navigation />
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  )
}

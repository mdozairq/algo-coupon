"use client"

import { ThemeProvider } from "next-themes"
import { AuthProvider } from "@/components/auth/auth-provider"
import { Toaster } from "@/components/ui/toaster"
import { WalletProvider } from "@txnlab/use-wallet-react"
import { getWalletManager } from "@/services/wallet-config"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <WalletProvider manager={getWalletManager()}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </WalletProvider>
    </ThemeProvider>
  )
} 
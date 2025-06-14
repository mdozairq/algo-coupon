"use client"

import type React from "react"
import { useState } from "react"
import { QrCode, Camera, Scan, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"

interface QRScannerProps {
  onScan: (address: string) => void
}

export function QRScanner({ onScan }: QRScannerProps) {
  const [manualAddress, setManualAddress] = useState("")
  const [scanning, setScanning] = useState(false)

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (manualAddress.trim()) {
      onScan(manualAddress.trim())
      setManualAddress("")
      toast({
        title: "Address Processed",
        description: "Customer address has been processed for redemption",
      })
    }
  }

  const simulateQRScan = () => {
    setScanning(true)
    setTimeout(() => {
      const mockAddress = "MOCK_USER_" + Math.random().toString(36).substring(7).toUpperCase()
      onScan(mockAddress)
      setScanning(false)
      toast({
        title: "QR Code Scanned! 📱",
        description: "Customer wallet detected, processing redemption...",
      })
    }, 2000)
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/50 dark:to-red-950/50 border-orange-200 dark:border-orange-800">
        <CardHeader className="text-center">
          <div className="mx-auto p-3 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900 dark:to-red-900 rounded-full w-fit mb-2">
            <QrCode className="h-6 w-6 text-orange-600 dark:text-orange-400" />
          </div>
          <CardTitle className="flex items-center justify-center gap-2 text-orange-900 dark:text-orange-100">
            <Zap className="h-5 w-5" />
            Redeem Coupon
          </CardTitle>
          <CardDescription className="text-orange-700 dark:text-orange-300">
            Scan customer's wallet QR code or enter address manually to redeem their coupon
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* QR Scanner Section */}
          <div className="text-center space-y-4">
            <div className="p-8 border-2 border-dashed border-orange-300 dark:border-orange-700 rounded-lg bg-orange-50/50 dark:bg-orange-950/20">
              {scanning ? (
                <div className="space-y-4">
                  <div className="animate-pulse">
                    <Scan className="h-12 w-12 text-orange-500 mx-auto" />
                  </div>
                  <p className="text-orange-700 dark:text-orange-300 font-medium">Scanning QR Code...</p>
                  <div className="w-full bg-orange-200 dark:bg-orange-800 rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full animate-pulse" style={{ width: "60%" }}></div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <Camera className="h-12 w-12 text-orange-400 mx-auto" />
                  <p className="text-orange-600 dark:text-orange-400">Point camera at customer's wallet QR code</p>
                </div>
              )}
            </div>

            <Button
              onClick={simulateQRScan}
              disabled={scanning}
              className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white shadow-lg"
              size="lg"
            >
              <Camera className="mr-2 h-5 w-5" />
              {scanning ? "Scanning..." : "Start QR Scan"}
            </Button>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-orange-200 dark:border-orange-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-orange-600 dark:text-orange-400 font-medium">
                Or enter manually
              </span>
            </div>
          </div>

          {/* Manual Entry */}
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div>
              <Label htmlFor="address" className="text-sm font-medium text-orange-700 dark:text-orange-300">
                Customer Wallet Address
              </Label>
              <Input
                id="address"
                value={manualAddress}
                onChange={(e) => setManualAddress(e.target.value)}
                placeholder="Enter Algorand address (58 characters)..."
                className="mt-1 font-mono text-sm"
              />
            </div>
            <Button
              type="submit"
              disabled={!manualAddress.trim()}
              className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white"
            >
              <QrCode className="mr-2 h-4 w-4" />
              Process Redemption
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Instructions Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Redemption Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-start gap-2">
            <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
              1
            </span>
            <p>Ask customer to open their Pera Wallet and show their QR code</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
              2
            </span>
            <p>Scan the QR code or manually enter their wallet address</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
              3
            </span>
            <p>The coupon will be automatically clawed back and burned</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

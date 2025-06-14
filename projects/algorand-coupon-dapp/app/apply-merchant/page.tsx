"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Store, Send, Clock, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth/auth-provider"
import { authService } from "@/lib/auth"
import { BUSINESS_TYPES } from "@/constants"
import { ApplicationStatus, type MerchantApplication } from "@/types/auth"
import { toast } from "@/hooks/use-toast"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function ApplyMerchantPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [application, setApplication] = useState<MerchantApplication | null>(null)
  const [isLoadingApplication, setIsLoadingApplication] = useState(true)

  const [formData, setFormData] = useState({
    businessName: "",
    businessType: "",
    description: "",
    website: "",
    contactEmail: "",
  })

  // Load application when user becomes available
  useEffect(() => {
    const loadApplication = async () => {
      if (!user?.address) {
        setIsLoadingApplication(false)
        return
      }

      try {
        setIsLoadingApplication(true)
        const app = await authService.getUserMerchantApplication(user.address)
        setApplication(app)
      } catch (error) {
        console.error("Error loading merchant application:", error)
        setApplication(null)
      } finally {
        setIsLoadingApplication(false)
      }
    }

    loadApplication()
  }, [user?.address])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.address) {
      toast({
        title: "Authentication Required",
        description: "Please connect your wallet to apply for merchant status",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const newApplication = await authService.applyForMerchant(user.address, formData)
      setApplication(newApplication)

      toast({
        title: "Application Submitted! 📝",
        description: "Your merchant application has been submitted for review",
      })

      // Reset form
      setFormData({
        businessName: "",
        businessType: "",
        description: "",
        website: "",
        contactEmail: "",
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to submit application"
      toast({
        title: "Submission Failed",
        description: message,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusIcon = (status: ApplicationStatus) => {
    switch (status) {
      case ApplicationStatus.PENDING:
        return <Clock className="h-5 w-5 text-yellow-500" />
      case ApplicationStatus.APPROVED:
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case ApplicationStatus.REJECTED:
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: ApplicationStatus) => {
    switch (status) {
      case ApplicationStatus.PENDING:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case ApplicationStatus.APPROVED:
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case ApplicationStatus.REJECTED:
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const getStatusText = (status: ApplicationStatus) => {
    switch (status) {
      case ApplicationStatus.PENDING:
        return "PENDING"
      case ApplicationStatus.APPROVED:
        return "APPROVED"
      case ApplicationStatus.REJECTED:
        return "REJECTED"
      default:
        return "UNKNOWN"
    }
  }

  // Show loading while user or application is loading
  if (!user || isLoadingApplication) {
    return (
      <ProtectedRoute requireAuth>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-slate-900 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute requireAuth>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-slate-900 p-4">
        <div className="container mx-auto max-w-4xl py-8">
          {/* Header */}
          <div className="text-center space-y-4 mb-8">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl shadow-xl">
                <Store className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Become a Merchant
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Apply to become a verified merchant and start creating digital coupons
            </p>
          </div>

          {/* Existing Application Status */}
          {application && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getStatusIcon(application.status)}
                  Application Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Status:</span>
                  <Badge className={getStatusColor(application.status)}>{getStatusText(application.status)}</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Business Name:</span>
                    <p className="text-muted-foreground">{application.businessName || "N/A"}</p>
                  </div>
                  <div>
                    <span className="font-medium">Business Type:</span>
                    <p className="text-muted-foreground">{application.businessType || "N/A"}</p>
                  </div>
                  <div>
                    <span className="font-medium">Applied:</span>
                    <p className="text-muted-foreground">
                      {application.appliedAt ? new Date(application.appliedAt).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                  {application.reviewedAt && (
                    <div>
                      <span className="font-medium">Reviewed:</span>
                      <p className="text-muted-foreground">{new Date(application.reviewedAt).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>

                {application.status === ApplicationStatus.APPROVED && (
                  <div className="p-4 bg-green-50 dark:bg-green-950/50 rounded-lg border border-green-200 dark:border-green-800">
                    <p className="text-green-700 dark:text-green-300 font-medium">
                      🎉 Congratulations! Your merchant application has been approved.
                    </p>
                    <Button onClick={() => router.push("/merchant")} className="mt-2 bg-green-600 hover:bg-green-700">
                      Go to Merchant Dashboard
                    </Button>
                  </div>
                )}

                {application.status === ApplicationStatus.REJECTED && (
                  <div className="p-4 bg-red-50 dark:bg-red-950/50 rounded-lg border border-red-200 dark:border-red-800">
                    <p className="text-red-700 dark:text-red-300 font-medium mb-2">Application Rejected</p>
                    {application.rejectionReason && (
                      <p className="text-red-600 dark:text-red-400 text-sm">Reason: {application.rejectionReason}</p>
                    )}
                  </div>
                )}

                {application.status === ApplicationStatus.PENDING && (
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-950/50 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <p className="text-yellow-700 dark:text-yellow-300 font-medium">
                      ⏳ Your application is under review. We'll notify you once it's processed.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Application Form */}
          {!application || application.status === ApplicationStatus.REJECTED ? (
            <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="h-5 w-5" />
                  Merchant Application
                </CardTitle>
                <CardDescription>Fill out the form below to apply for merchant status</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="businessName">Business Name *</Label>
                      <Input
                        id="businessName"
                        value={formData.businessName}
                        onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                        placeholder="Your Business Name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="businessType">Business Type *</Label>
                      <Select
                        value={formData.businessType}
                        onValueChange={(value) => setFormData({ ...formData, businessType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select business type" />
                        </SelectTrigger>
                        <SelectContent>
                          {BUSINESS_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Business Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe your business, products, and services..."
                      rows={4}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="website">Website (Optional)</Label>
                      <Input
                        id="website"
                        type="url"
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        placeholder="https://your-website.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contactEmail">Contact Email *</Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        value={formData.contactEmail}
                        onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                        placeholder="contact@yourbusiness.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 dark:bg-blue-950/50 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Application Review Process</h3>
                    <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                      <li>• Applications are reviewed within 24-48 hours</li>
                      <li>• We verify business information and legitimacy</li>
                      <li>• Approved merchants can immediately start creating coupons</li>
                      <li>• You'll be notified via the platform once reviewed</li>
                    </ul>
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg py-6 text-lg"
                  >
                    <Send className="mr-2 h-5 w-5" />
                    {isSubmitting ? "Submitting Application..." : "Submit Application"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : null}

          {/* Benefits Section */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 border-green-200 dark:border-green-800">
              <CardContent className="pt-6 text-center">
                <div className="text-3xl mb-4">🚀</div>
                <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">Instant Distribution</h3>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Reach customers instantly with blockchain-powered coupons
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border-blue-200 dark:border-blue-800">
              <CardContent className="pt-6 text-center">
                <div className="text-3xl mb-4">🔒</div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Fraud Prevention</h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Eliminate coupon fraud with blockchain verification
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50 border-purple-200 dark:border-purple-800">
              <CardContent className="pt-6 text-center">
                <div className="text-3xl mb-4">📊</div>
                <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Real-time Analytics</h3>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  Track coupon performance and customer engagement
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}

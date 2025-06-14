"use client"

import { useState, useEffect } from "react"
import { Shield, Users, Store, FileText, CheckCircle, XCircle, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/components/auth/auth-provider"
import { authService } from "@/lib/auth"
import { useCoupons } from "@/hooks/use-coupons"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { UserRole, ApplicationStatus } from "@/types/auth"
import { toast } from "@/hooks/use-toast"
import { AppLayout } from "@/components/layouts/app-layout"

export default function AdminPage() {
  const { user } = useAuth()
  const { coupons } = useCoupons()
  const [applications, setApplications] = useState([])
  const [users, setUsers] = useState([])
  const [selectedApplication, setSelectedApplication] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [loading, setLoading] = useState(true)

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [applicationsData, usersData] = await Promise.all([
          authService.getAllMerchantApplications(),
          authService.getAllUsers(),
        ])

        // Ensure we always have arrays
        setApplications(Array.isArray(applicationsData) ? applicationsData : [])
        setUsers(Array.isArray(usersData) ? usersData : [])
      } catch (error) {
        console.error("Failed to load admin data:", error)
        // Set empty arrays as fallback
        setApplications([])
        setUsers([])
        toast({
          title: "Loading Error",
          description: "Failed to load admin data. Using fallback data.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      loadData()
    }
  }, [user])

  const handleApplicationReview = async (
    applicationId: string,
    decision: ApplicationStatus.APPROVED | ApplicationStatus.REJECTED,
  ) => {
    if (!user) return

    setIsProcessing(true)
    try {
      await authService.reviewMerchantApplication(
        applicationId,
        user.address,
        decision,
        decision === ApplicationStatus.REJECTED ? rejectionReason : undefined,
      )

      // Refresh data
      const [applicationsData, usersData] = await Promise.all([
        authService.getAllMerchantApplications(),
        authService.getAllUsers(),
      ])

      setApplications(Array.isArray(applicationsData) ? applicationsData : [])
      setUsers(Array.isArray(usersData) ? usersData : [])
      setSelectedApplication(null)
      setRejectionReason("")

      toast({
        title: `Application ${decision}! ✅`,
        description: `Merchant application has been ${decision.toLowerCase()}`,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to process application"
      toast({
        title: "Processing Failed",
        description: message,
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleToggleUserStatus = async (userId: string) => {
    if (!user) return

    try {
      await authService.toggleUserStatus(userId, user.address)

      // Refresh users data
      const usersData = await authService.getAllUsers()
      setUsers(Array.isArray(usersData) ? usersData : [])

      toast({
        title: "User Status Updated",
        description: "User status has been toggled successfully",
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update user status"
      toast({
        title: "Update Failed",
        description: message,
        variant: "destructive",
      })
    }
  }

  // Ensure applications is always an array before filtering
  const pendingApplications = Array.isArray(applications)
    ? applications.filter((app) => app.status === ApplicationStatus.PENDING)
    : []

  const totalUsers = Array.isArray(users) ? users.length : 0
  const activeUsers = Array.isArray(users) ? users.filter((u) => u.isActive).length : 0
  const merchants = Array.isArray(users) ? users.filter((u) => u.role === UserRole.MERCHANT).length : 0
  const totalCoupons = Array.isArray(coupons) ? coupons.length : 0
  const activeCoupons = Array.isArray(coupons)
    ? coupons.filter((c) => !c.claimed && !c.redeemed && c.expiry > Date.now()).length
    : 0

  const stats = [
    {
      label: "Total Users",
      value: totalUsers,
      icon: Users,
      gradient: "from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 text-blue-600 dark:text-blue-400",
      description: `${activeUsers} active`,
    },
    {
      label: "Merchants",
      value: merchants,
      icon: Store,
      gradient:
        "from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50 text-green-600 dark:text-green-400",
      description: "verified",
    },
    {
      label: "Pending Applications",
      value: pendingApplications.length,
      icon: FileText,
      gradient:
        "from-yellow-50 to-yellow-100 dark:from-yellow-950/50 dark:to-yellow-900/50 text-yellow-600 dark:text-yellow-400",
      description: "awaiting review",
    },
    {
      label: "Total Coupons",
      value: totalCoupons,
      icon: Shield,
      gradient:
        "from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50 text-purple-600 dark:text-purple-400",
      description: `${activeCoupons} active`,
    },
  ]

  if (loading) {
    return (
      <ProtectedRoute requireAuth requiredRole={UserRole.ADMIN}>
        <AppLayout>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
              <p className="text-muted-foreground">Loading admin data...</p>
            </div>
          </div>
        </AppLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute requireAuth requiredRole={UserRole.ADMIN}>
      <AppLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">Manage users, merchants, and platform settings</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <Card key={index} className={`bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium opacity-80">{stat.label}</p>
                        <p className="text-2xl font-bold">{stat.value}</p>
                        <p className="text-xs opacity-70 mt-1">{stat.description}</p>
                      </div>
                      <div className="p-2 bg-white/20 rounded-full">
                        <Icon className="h-6 w-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Rest of the component content remains exactly the same... */}
          <Tabs defaultValue="applications" className="space-y-6">
            {/* Merchant Applications */}
            <TabsContent value="applications">
              <Card>
                <CardHeader>
                  <CardTitle>Merchant Applications</CardTitle>
                  <CardDescription>Review and approve merchant applications</CardDescription>
                </CardHeader>
                <CardContent>
                  {!Array.isArray(applications) || applications.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No applications found</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Business Name</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Applied</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {applications.map((app) => (
                          <TableRow key={app.id}>
                            <TableCell className="font-medium">{app.businessName}</TableCell>
                            <TableCell>{app.businessType}</TableCell>
                            <TableCell>{new Date(app.appliedAt).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  app.status === ApplicationStatus.PENDING
                                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                    : app.status === ApplicationStatus.APPROVED
                                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                }
                              >
                                {app.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="outline" size="sm">
                                      <Eye className="h-4 w-4 mr-1" />
                                      View
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-2xl">
                                    <DialogHeader>
                                      <DialogTitle>Application Details</DialogTitle>
                                      <DialogDescription>Review merchant application information</DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <Label>Business Name</Label>
                                          <p className="text-sm text-muted-foreground">{app.businessName}</p>
                                        </div>
                                        <div>
                                          <Label>Business Type</Label>
                                          <p className="text-sm text-muted-foreground">{app.businessType}</p>
                                        </div>
                                        <div>
                                          <Label>Contact Email</Label>
                                          <p className="text-sm text-muted-foreground">{app.contactEmail}</p>
                                        </div>
                                        <div>
                                          <Label>Website</Label>
                                          <p className="text-sm text-muted-foreground">
                                            {app.website || "Not provided"}
                                          </p>
                                        </div>
                                      </div>
                                      <div>
                                        <Label>Description</Label>
                                        <p className="text-sm text-muted-foreground mt-1">{app.description}</p>
                                      </div>

                                      {app.status === ApplicationStatus.PENDING && (
                                        <div className="flex gap-2 pt-4">
                                          <Button
                                            onClick={() => handleApplicationReview(app.id, ApplicationStatus.APPROVED)}
                                            disabled={isProcessing}
                                            className="bg-green-600 hover:bg-green-700"
                                          >
                                            <CheckCircle className="h-4 w-4 mr-1" />
                                            Approve
                                          </Button>

                                          <Dialog>
                                            <DialogTrigger asChild>
                                              <Button
                                                variant="destructive"
                                                onClick={() => setSelectedApplication(app.id)}
                                              >
                                                <XCircle className="h-4 w-4 mr-1" />
                                                Reject
                                              </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                              <DialogHeader>
                                                <DialogTitle>Reject Application</DialogTitle>
                                                <DialogDescription>
                                                  Please provide a reason for rejection
                                                </DialogDescription>
                                              </DialogHeader>
                                              <div className="space-y-4">
                                                <div>
                                                  <Label htmlFor="reason">Rejection Reason</Label>
                                                  <Textarea
                                                    id="reason"
                                                    value={rejectionReason}
                                                    onChange={(e) => setRejectionReason(e.target.value)}
                                                    placeholder="Please explain why this application is being rejected..."
                                                    rows={3}
                                                  />
                                                </div>
                                                <div className="flex gap-2">
                                                  <Button
                                                    onClick={() =>
                                                      handleApplicationReview(app.id, ApplicationStatus.REJECTED)
                                                    }
                                                    disabled={isProcessing || !rejectionReason.trim()}
                                                    variant="destructive"
                                                  >
                                                    Confirm Rejection
                                                  </Button>
                                                  <Button
                                                    variant="outline"
                                                    onClick={() => {
                                                      setSelectedApplication(null)
                                                      setRejectionReason("")
                                                    }}
                                                  >
                                                    Cancel
                                                  </Button>
                                                </div>
                                              </div>
                                            </DialogContent>
                                          </Dialog>
                                        </div>
                                      )}
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Users Management */}
            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle>Users Management</CardTitle>
                  <CardDescription>Manage user accounts and permissions</CardDescription>
                </CardHeader>
                <CardContent>
                  {!Array.isArray(users) || users.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No users found</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Address</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Joined</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-mono text-xs">
                              {user.address === "ADMIN_CREDENTIALS_LOGIN"
                                ? "Admin Login"
                                : `${user.address.slice(0, 8)}...${user.address.slice(-8)}`}
                            </TableCell>
                            <TableCell>{user.name}</TableCell>
                            <TableCell>
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
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  user.isActive
                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                }
                              >
                                {user.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell>
                              {user.role !== UserRole.ADMIN && (
                                <Button variant="outline" size="sm" onClick={() => handleToggleUserStatus(user.id)}>
                                  {user.isActive ? "Deactivate" : "Activate"}
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics */}
            <TabsContent value="analytics">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Platform Statistics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total Users:</span>
                      <span className="font-bold">{totalUsers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Active Users:</span>
                      <span className="font-bold">{activeUsers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Verified Merchants:</span>
                      <span className="font-bold">{merchants}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Coupons:</span>
                      <span className="font-bold">{totalCoupons}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Active Coupons:</span>
                      <span className="font-bold">{activeCoupons}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Claimed Coupons:</span>
                      <span className="font-bold">
                        {Array.isArray(coupons) ? coupons.filter((c) => c.claimed && !c.redeemed).length : 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Redeemed Coupons:</span>
                      <span className="font-bold">
                        {Array.isArray(coupons) ? coupons.filter((c) => c.redeemed).length : 0}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Array.isArray(applications) && applications.length > 0 ? (
                        applications.slice(0, 5).map((app) => (
                          <div
                            key={app.id}
                            className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded"
                          >
                            <div>
                              <p className="text-sm font-medium">{app.businessName}</p>
                              <p className="text-xs text-muted-foreground">Applied for merchant status</p>
                            </div>
                            <Badge
                              className={
                                app.status === ApplicationStatus.PENDING
                                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                  : app.status === ApplicationStatus.APPROVED
                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                              }
                            >
                              {app.status}
                            </Badge>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </AppLayout>
    </ProtectedRoute>
  )
}

export interface User {
  id: string
  address: string
  role: UserRole
  name?: string
  email?: string
  createdAt: number
  lastLoginAt: number
  isActive: boolean
}

export enum UserRole {
  USER = "user",
  MERCHANT = "merchant",
  ADMIN = "admin",
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export interface LoginCredentials {
  address: string
  signature?: string
}

export interface RegisterData {
  address: string
  name: string
  email: string
  role: UserRole
}

export interface MerchantApplication {
  id: string
  userAddress: string
  businessName: string
  businessType: string
  description: string
  website?: string
  contactEmail: string
  status: ApplicationStatus
  appliedAt: number
  reviewedAt?: number
  reviewedBy?: string
  rejectionReason?: string
}

export enum ApplicationStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          address: string
          role: "user" | "merchant" | "admin"
          name: string | null
          email: string | null
          created_at: string
          last_login_at: string
          is_active: boolean
          updated_at: string
        }
        Insert: {
          id?: string
          address: string
          role?: "user" | "merchant" | "admin"
          name?: string | null
          email?: string | null
          created_at?: string
          last_login_at?: string
          is_active?: boolean
          updated_at?: string
        }
        Update: {
          id?: string
          address?: string
          role?: "user" | "merchant" | "admin"
          name?: string | null
          email?: string | null
          created_at?: string
          last_login_at?: string
          is_active?: boolean
          updated_at?: string
        }
      }
      merchant_applications: {
        Row: {
          id: string
          user_address: string
          business_name: string
          business_type: string
          description: string
          website: string | null
          contact_email: string
          status: "pending" | "approved" | "rejected"
          applied_at: string
          reviewed_at: string | null
          reviewed_by: string | null
          rejection_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_address: string
          business_name: string
          business_type: string
          description: string
          website?: string | null
          contact_email: string
          status?: "pending" | "approved" | "rejected"
          applied_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          rejection_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_address?: string
          business_name?: string
          business_type?: string
          description?: string
          website?: string | null
          contact_email?: string
          status?: "pending" | "approved" | "rejected"
          applied_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          rejection_reason?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      merchant_profiles: {
        Row: {
          id: string
          address: string
          name: string
          description: string | null
          category: string | null
          website: string | null
          logo: string | null
          verified: boolean
          joined_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          address: string
          name: string
          description?: string | null
          category?: string | null
          website?: string | null
          logo?: string | null
          verified?: boolean
          joined_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          address?: string
          name?: string
          description?: string | null
          category?: string | null
          website?: string | null
          logo?: string | null
          verified?: boolean
          joined_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      coupons: {
        Row: {
          id: string
          name: string
          description: string
          merchant: string
          merchant_name: string
          category: "food" | "retail" | "services" | "entertainment" | "travel" | "health"
          value: number
          value_type: "percentage" | "fixed"
          expiry: number
          claimed: boolean
          redeemed: boolean
          asset_id: number | null
          created_at_timestamp: number
          claimed_at: number | null
          redeemed_at: number | null
          max_redemptions: number | null
          current_redemptions: number
          terms: string | null
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          merchant: string
          merchant_name: string
          category: "food" | "retail" | "services" | "entertainment" | "travel" | "health"
          value: number
          value_type: "percentage" | "fixed"
          expiry: number
          claimed?: boolean
          redeemed?: boolean
          asset_id?: number | null
          created_at_timestamp: number
          claimed_at?: number | null
          redeemed_at?: number | null
          max_redemptions?: number | null
          current_redemptions?: number
          terms?: string | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          merchant?: string
          merchant_name?: string
          category?: "food" | "retail" | "services" | "entertainment" | "travel" | "health"
          value?: number
          value_type?: "percentage" | "fixed"
          expiry?: number
          claimed?: boolean
          redeemed?: boolean
          asset_id?: number | null
          created_at_timestamp?: number
          claimed_at?: number | null
          redeemed_at?: number | null
          max_redemptions?: number | null
          current_redemptions?: number
          terms?: string | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          type: "create" | "claim" | "redeem"
          coupon_id: string | null
          user_address: string
          merchant_address: string
          timestamp_ms: number
          tx_hash: string | null
          status: "pending" | "confirmed" | "failed"
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          type: "create" | "claim" | "redeem"
          coupon_id?: string | null
          user_address: string
          merchant_address: string
          timestamp_ms: number
          tx_hash?: string | null
          status?: "pending" | "confirmed" | "failed"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          type?: "create" | "claim" | "redeem"
          coupon_id?: string | null
          user_address?: string
          merchant_address?: string
          timestamp_ms?: number
          tx_hash?: string | null
          status?: "pending" | "confirmed" | "failed"
          created_at?: string
          updated_at?: string
        }
      }
      smart_contracts: {
        Row: {
          id: string
          contract_address: string
          contract_type: string
          abi: Json | null
          deployment_tx: string | null
          deployed_at: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          contract_address: string
          contract_type: string
          abi?: Json | null
          deployment_tx?: string | null
          deployed_at?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          contract_address?: string
          contract_type?: string
          abi?: Json | null
          deployment_tx?: string | null
          deployed_at?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      user_sessions: {
        Row: {
          id: string
          user_id: string | null
          session_token: string
          expires_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          session_token: string
          expires_at: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          session_token?: string
          expires_at?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      application_status: "pending" | "approved" | "rejected"
      coupon_category: "food" | "retail" | "services" | "entertainment" | "travel" | "health"
      transaction_status: "pending" | "confirmed" | "failed"
      transaction_type: "create" | "claim" | "redeem"
      user_role: "user" | "merchant" | "admin"
      value_type: "percentage" | "fixed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

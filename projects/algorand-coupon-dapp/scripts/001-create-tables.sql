-- Create custom types
CREATE TYPE user_role AS ENUM ('user', 'merchant', 'admin');
CREATE TYPE application_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE coupon_category AS ENUM ('food', 'retail', 'services', 'entertainment', 'travel', 'health');
CREATE TYPE value_type AS ENUM ('percentage', 'fixed');
CREATE TYPE transaction_type AS ENUM ('create', 'claim', 'redeem');
CREATE TYPE transaction_status AS ENUM ('pending', 'confirmed', 'failed');

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    address TEXT UNIQUE NOT NULL,
    role user_role DEFAULT 'user',
    name TEXT,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Merchant applications table
CREATE TABLE IF NOT EXISTS merchant_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_address TEXT NOT NULL,
    business_name TEXT NOT NULL,
    business_type TEXT NOT NULL,
    description TEXT NOT NULL,
    website TEXT,
    contact_email TEXT NOT NULL,
    status application_status DEFAULT 'pending',
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by TEXT,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Merchant profiles table
CREATE TABLE IF NOT EXISTS merchant_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    address TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    website TEXT,
    logo TEXT,
    verified BOOLEAN DEFAULT false,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Coupons table
CREATE TABLE IF NOT EXISTS coupons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    merchant TEXT NOT NULL,
    merchant_name TEXT NOT NULL,
    category coupon_category NOT NULL,
    value INTEGER NOT NULL,
    value_type value_type NOT NULL,
    expiry BIGINT NOT NULL,
    claimed BOOLEAN DEFAULT false,
    redeemed BOOLEAN DEFAULT false,
    asset_id INTEGER,
    created_at_timestamp BIGINT NOT NULL,
    claimed_at BIGINT,
    redeemed_at BIGINT,
    max_redemptions INTEGER DEFAULT 50,
    current_redemptions INTEGER DEFAULT 0,
    terms TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type transaction_type NOT NULL,
    coupon_id UUID,
    user_address TEXT NOT NULL,
    merchant_address TEXT NOT NULL,
    timestamp_ms BIGINT NOT NULL,
    tx_hash TEXT,
    status transaction_status DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Smart contract details table
CREATE TABLE IF NOT EXISTS smart_contracts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    contract_address TEXT UNIQUE NOT NULL,
    contract_type TEXT NOT NULL,
    abi JSONB,
    deployment_tx TEXT,
    deployed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User sessions table for auth
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID,
    session_token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_address ON users(address);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_merchant_applications_user_address ON merchant_applications(user_address);
CREATE INDEX IF NOT EXISTS idx_merchant_applications_status ON merchant_applications(status);
CREATE INDEX IF NOT EXISTS idx_coupons_merchant ON coupons(merchant);
CREATE INDEX IF NOT EXISTS idx_coupons_category ON coupons(category);
CREATE INDEX IF NOT EXISTS idx_coupons_claimed ON coupons(claimed);
CREATE INDEX IF NOT EXISTS idx_coupons_redeemed ON coupons(redeemed);
CREATE INDEX IF NOT EXISTS idx_transactions_coupon_id ON transactions(coupon_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_address ON transactions(user_address);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);

-- Add foreign key constraints where appropriate
ALTER TABLE merchant_applications 
ADD CONSTRAINT fk_merchant_applications_user_address 
FOREIGN KEY (user_address) REFERENCES users(address) ON DELETE CASCADE;

ALTER TABLE merchant_profiles 
ADD CONSTRAINT fk_merchant_profiles_address 
FOREIGN KEY (address) REFERENCES users(address) ON DELETE CASCADE;

ALTER TABLE coupons 
ADD CONSTRAINT fk_coupons_merchant 
FOREIGN KEY (merchant) REFERENCES users(address) ON DELETE CASCADE;

ALTER TABLE transactions 
ADD CONSTRAINT fk_transactions_coupon_id 
FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE SET NULL;

ALTER TABLE transactions 
ADD CONSTRAINT fk_transactions_user_address 
FOREIGN KEY (user_address) REFERENCES users(address) ON DELETE CASCADE;

ALTER TABLE transactions 
ADD CONSTRAINT fk_transactions_merchant_address 
FOREIGN KEY (merchant_address) REFERENCES users(address) ON DELETE CASCADE;

ALTER TABLE user_sessions 
ADD CONSTRAINT fk_user_sessions_user_id 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchant_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchant_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE smart_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public access (since this is a demo)
-- In production, you would want more restrictive policies

-- Users policies
DROP POLICY IF EXISTS "Users can view all users" ON users;
CREATE POLICY "Users can view all users" ON users FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own profile" ON users;
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (true);

-- Merchant applications policies
DROP POLICY IF EXISTS "Users can view all applications" ON merchant_applications;
CREATE POLICY "Users can view all applications" ON merchant_applications FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create applications" ON merchant_applications;
CREATE POLICY "Users can create applications" ON merchant_applications FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can update applications" ON merchant_applications;
CREATE POLICY "Admins can update applications" ON merchant_applications FOR UPDATE USING (true);

-- Merchant profiles policies
DROP POLICY IF EXISTS "Anyone can view merchant profiles" ON merchant_profiles;
CREATE POLICY "Anyone can view merchant profiles" ON merchant_profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Merchants can create profile" ON merchant_profiles;
CREATE POLICY "Merchants can create profile" ON merchant_profiles FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Merchants can update own profile" ON merchant_profiles;
CREATE POLICY "Merchants can update own profile" ON merchant_profiles FOR UPDATE USING (true);

-- Coupons policies
DROP POLICY IF EXISTS "Anyone can view coupons" ON coupons;
CREATE POLICY "Anyone can view coupons" ON coupons FOR SELECT USING (true);

DROP POLICY IF EXISTS "Merchants can create coupons" ON coupons;
CREATE POLICY "Merchants can create coupons" ON coupons FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Merchants can update own coupons" ON coupons;
CREATE POLICY "Merchants can update own coupons" ON coupons FOR UPDATE USING (true);

-- Transactions policies
DROP POLICY IF EXISTS "Anyone can view transactions" ON transactions;
CREATE POLICY "Anyone can view transactions" ON transactions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create transactions" ON transactions;
CREATE POLICY "Users can create transactions" ON transactions FOR INSERT WITH CHECK (true);

-- Smart contracts policies
DROP POLICY IF EXISTS "Anyone can view smart contracts" ON smart_contracts;
CREATE POLICY "Anyone can view smart contracts" ON smart_contracts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage smart contracts" ON smart_contracts;
CREATE POLICY "Admins can manage smart contracts" ON smart_contracts FOR ALL USING (true);

-- User sessions policies
DROP POLICY IF EXISTS "Users can view own sessions" ON user_sessions;
CREATE POLICY "Users can view own sessions" ON user_sessions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create sessions" ON user_sessions;
CREATE POLICY "Users can create sessions" ON user_sessions FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can delete own sessions" ON user_sessions;
CREATE POLICY "Users can delete own sessions" ON user_sessions FOR DELETE USING (true);

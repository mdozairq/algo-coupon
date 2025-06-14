-- Insert admin user
INSERT INTO users (address, role, name, email, is_active) VALUES
('ADMIN_CREDENTIALS_LOGIN', 'admin', 'System Administrator', 'admin@algocoupons.com', true),
('ADMIN_ALGO_ADDRESS_123456789', 'admin', 'Blockchain Admin', 'blockchain@algocoupons.com', true)
ON CONFLICT (address) DO NOTHING;

-- Insert sample merchants
INSERT INTO users (address, role, name, email, is_active) VALUES
('MERCHANT_COFFEE_SHOP_123456789', 'merchant', 'Coffee Shop Owner', 'coffee@example.com', true),
('MERCHANT_PIZZA_PALACE_987654321', 'merchant', 'Pizza Palace Owner', 'pizza@example.com', true),
('MERCHANT_TECH_STORE_456789123', 'merchant', 'Tech Store Owner', 'tech@example.com', true),
('MERCHANT_SPA_WELLNESS_789123456', 'merchant', 'Spa Owner', 'spa@example.com', true)
ON CONFLICT (address) DO NOTHING;

-- Insert sample users
INSERT INTO users (address, role, name, email, is_active) VALUES
('USER_ADDRESS_123456789', 'user', 'John Doe', 'john@example.com', true),
('USER_ADDRESS_987654321', 'user', 'Jane Smith', 'jane@example.com', true),
('USER_ADDRESS_456789123', 'user', 'Bob Johnson', 'bob@example.com', true)
ON CONFLICT (address) DO NOTHING;

-- Insert merchant profiles
INSERT INTO merchant_profiles (address, name, description, category, website, verified, joined_at) VALUES
('MERCHANT_COFFEE_SHOP_123456789', 'Brew & Beans Coffee', 'Premium coffee shop serving artisanal coffee and fresh pastries', 'food', 'https://brewandbeans.com', true, NOW() - INTERVAL '30 days'),
('MERCHANT_PIZZA_PALACE_987654321', 'Pizza Palace', 'Authentic Italian pizza with fresh ingredients', 'food', 'https://pizzapalace.com', true, NOW() - INTERVAL '45 days'),
('MERCHANT_TECH_STORE_456789123', 'TechHub Electronics', 'Latest gadgets and electronics at competitive prices', 'retail', 'https://techhub.com', true, NOW() - INTERVAL '60 days'),
('MERCHANT_SPA_WELLNESS_789123456', 'Zen Spa & Wellness', 'Relaxation and wellness services for mind and body', 'health', 'https://zenspa.com', true, NOW() - INTERVAL '20 days')
ON CONFLICT (address) DO NOTHING;

-- Insert sample coupons
INSERT INTO coupons (name, description, merchant, merchant_name, category, value, value_type, expiry, claimed, redeemed, asset_id, created_at_timestamp, current_redemptions, max_redemptions, terms) VALUES
('Free Coffee with Pastry', 'Get a free coffee when you purchase any pastry. Valid for all coffee sizes.', 'MERCHANT_COFFEE_SHOP_123456789', 'Brew & Beans Coffee', 'food', 100, 'percentage', EXTRACT(EPOCH FROM (NOW() + INTERVAL '30 days')) * 1000, false, false, 1001, EXTRACT(EPOCH FROM (NOW() - INTERVAL '5 days')) * 1000, 0, 100, 'Valid with purchase of any pastry. One per customer per day.'),
('20% Off Large Pizza', 'Save 20% on any large pizza. Choose from our wide selection of toppings.', 'MERCHANT_PIZZA_PALACE_987654321', 'Pizza Palace', 'food', 20, 'percentage', EXTRACT(EPOCH FROM (NOW() + INTERVAL '14 days')) * 1000, false, false, 1002, EXTRACT(EPOCH FROM (NOW() - INTERVAL '3 days')) * 1000, 0, 50, 'Valid on large pizzas only. Cannot be combined with other offers.'),
('$50 Off Electronics', 'Get $50 off any electronics purchase over $200. Latest gadgets included.', 'MERCHANT_TECH_STORE_456789123', 'TechHub Electronics', 'retail', 50, 'fixed', EXTRACT(EPOCH FROM (NOW() + INTERVAL '21 days')) * 1000, true, false, 1003, EXTRACT(EPOCH FROM (NOW() - INTERVAL '7 days')) * 1000, 0, 25, 'Minimum purchase of $200 required. Valid on all electronics.'),
('Free Spa Consultation', 'Complimentary 30-minute wellness consultation with our certified therapists.', 'MERCHANT_SPA_WELLNESS_789123456', 'Zen Spa & Wellness', 'health', 100, 'percentage', EXTRACT(EPOCH FROM (NOW() + INTERVAL '45 days')) * 1000, false, false, 1004, EXTRACT(EPOCH FROM (NOW() - INTERVAL '1 day')) * 1000, 0, 20, 'Appointment required. First-time customers only.'),
('Buy 2 Get 1 Free Coffee', 'Purchase two coffees and get the third one absolutely free. Any size, any blend.', 'MERCHANT_COFFEE_SHOP_123456789', 'Brew & Beans Coffee', 'food', 33, 'percentage', EXTRACT(EPOCH FROM (NOW() + INTERVAL '7 days')) * 1000, true, true, 1005, EXTRACT(EPOCH FROM (NOW() - INTERVAL '10 days')) * 1000, 1, 30, 'Valid on all coffee sizes and blends. Lowest priced item is free.')
ON CONFLICT DO NOTHING;

-- Update claimed and redeemed timestamps for sample data
UPDATE coupons SET claimed_at = EXTRACT(EPOCH FROM (NOW() - INTERVAL '2 days')) * 1000 WHERE asset_id = 1003;
UPDATE coupons SET claimed_at = EXTRACT(EPOCH FROM (NOW() - INTERVAL '5 days')) * 1000, redeemed_at = EXTRACT(EPOCH FROM (NOW() - INTERVAL '1 day')) * 1000 WHERE asset_id = 1005;

-- Insert sample transactions
INSERT INTO transactions (type, coupon_id, user_address, merchant_address, timestamp_ms, tx_hash, status) VALUES
('create', (SELECT id FROM coupons WHERE asset_id = 1001 LIMIT 1), 'MERCHANT_COFFEE_SHOP_123456789', 'MERCHANT_COFFEE_SHOP_123456789', EXTRACT(EPOCH FROM (NOW() - INTERVAL '5 days')) * 1000, 'TX_HASH_CREATE_001', 'confirmed'),
('claim', (SELECT id FROM coupons WHERE asset_id = 1003 LIMIT 1), 'USER_ADDRESS_123456789', 'MERCHANT_TECH_STORE_456789123', EXTRACT(EPOCH FROM (NOW() - INTERVAL '2 days')) * 1000, 'TX_HASH_CLAIM_002', 'confirmed'),
('redeem', (SELECT id FROM coupons WHERE asset_id = 1005 LIMIT 1), 'USER_ADDRESS_987654321', 'MERCHANT_COFFEE_SHOP_123456789', EXTRACT(EPOCH FROM (NOW() - INTERVAL '1 day')) * 1000, 'TX_HASH_REDEEM_003', 'confirmed')
ON CONFLICT DO NOTHING;

-- Insert sample smart contract
INSERT INTO smart_contracts (contract_address, contract_type, abi, deployment_tx, is_active) VALUES
('ALGORAND_COUPON_CONTRACT_123', 'coupon_manager', '{"methods": [{"name": "create_coupon", "args": []}, {"name": "claim_coupon", "args": []}, {"name": "redeem_coupon", "args": []}]}', 'DEPLOY_TX_HASH_123', true)
ON CONFLICT (contract_address) DO NOTHING;

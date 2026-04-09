-- Add Razorpay fields to plans table
ALTER TABLE plans ADD COLUMN IF NOT EXISTS razorpay_plan_id VARCHAR(100);
ALTER TABLE plans ADD COLUMN IF NOT EXISTS interval VARCHAR(20) DEFAULT 'monthly';
ALTER TABLE plans ADD COLUMN IF NOT EXISTS interval_count INTEGER DEFAULT 1;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'INR';
ALTER TABLE plans ADD COLUMN IF NOT EXISTS name VARCHAR(255);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    plan_id UUID REFERENCES plans(id) ON DELETE SET NULL,
    razorpay_subscription_id VARCHAR(100) UNIQUE,
    razorpay_customer_id VARCHAR(100),
    razorpay_payment_id VARCHAR(100),
    razorpay_signature VARCHAR(500),
    status VARCHAR(30) DEFAULT 'created',
    short_url TEXT,
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    charge_at TIMESTAMP,
    notes JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_razorpay_id ON subscriptions(razorpay_subscription_id);

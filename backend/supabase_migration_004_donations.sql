-- Create ENUM for Donation Status
CREATE TYPE donation_status AS ENUM ('pending', 'completed', 'failed', 'refunded');

-- Create TABLE: donation_campaigns
CREATE TABLE donation_campaigns (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    ngo_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text,
    target_amount numeric NOT NULL,
    current_amount numeric DEFAULT 0,
    category text,
    status text DEFAULT 'active', -- active, closed
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create TABLE: donations
CREATE TABLE donations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id uuid NOT NULL REFERENCES donation_campaigns(id) ON DELETE CASCADE,
    donor_id uuid REFERENCES users(id),
    amount numeric NOT NULL,
    status donation_status DEFAULT 'pending',
    payment_reference text,
    created_at timestamptz DEFAULT now()
);

-- Create TABLE: donation_spends
CREATE TABLE donation_spends (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id uuid NOT NULL REFERENCES donation_campaigns(id) ON DELETE CASCADE,
    ngo_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    description text,
    amount numeric NOT NULL,
    proof_url text, -- receipt/image uploaded to storage
    created_at timestamptz DEFAULT now()
);

-- Create INDEXES
CREATE INDEX idx_donation_campaign ON donations(campaign_id);
CREATE INDEX idx_donation_donor ON donations(donor_id);
CREATE INDEX idx_donation_campaign_ngo ON donation_campaigns(ngo_id);
CREATE INDEX idx_donation_spend_campaign ON donation_spends(campaign_id);

-- Enable RLS
ALTER TABLE donation_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE donation_spends ENABLE ROW LEVEL SECURITY;

-- Policies (Basic backend bypasses RLS with service-role, but good practice)
CREATE POLICY "Public can view campaigns" ON donation_campaigns FOR SELECT USING (true);
CREATE POLICY "NGOs can manage their own campaigns" ON donation_campaigns FOR ALL USING (auth.uid() = ngo_id);
CREATE POLICY "Citizens can view their own donations" ON donations FOR SELECT USING (auth.uid() = donor_id);
CREATE POLICY "NGOs can view donations to their campaigns" ON donations FOR SELECT USING (
    EXISTS (SELECT 1 FROM donation_campaigns WHERE id = donations.campaign_id AND ngo_id = auth.uid())
);
CREATE POLICY "Everyone can view spends" ON donation_spends FOR SELECT USING (true);

-- RPC for safe amount increment
CREATE OR REPLACE FUNCTION increment_campaign_amount(campaign_id uuid, inc_amount numeric)
RETURNS void AS $$
BEGIN
    UPDATE donation_campaigns
    SET current_amount = COALESCE(current_amount, 0) + inc_amount,
        updated_at = NOW()
    WHERE id = campaign_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

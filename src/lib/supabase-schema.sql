-- Audit results table
CREATE TABLE audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  team_size INTEGER NOT NULL,
  use_case TEXT NOT NULL CHECK (use_case IN ('coding', 'writing', 'data', 'research', 'mixed')),
  tools JSONB NOT NULL,           -- array of tool inputs
  results JSONB NOT NULL,         -- audit engine output
  total_monthly_savings DECIMAL(10,2) DEFAULT 0,
  total_annual_savings DECIMAL(10,2) DEFAULT 0,
  ai_summary TEXT,                -- Anthropic-generated
  is_public BOOLEAN DEFAULT true  -- for shareable URLs
);

-- Lead capture table
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  audit_id UUID REFERENCES audits(id),
  email TEXT NOT NULL,
  company_name TEXT,
  role TEXT,
  team_size INTEGER,
  honeypot TEXT,                   -- abuse protection
  ip_address INET,
  is_high_savings BOOLEAN DEFAULT false,
  email_sent BOOLEAN DEFAULT false,
  consultation_booked BOOLEAN DEFAULT false
);

-- Rate limiting table
CREATE TABLE rate_limits (
  ip_address INET PRIMARY KEY,
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Public read for shareable URLs (only non-PII fields)
CREATE POLICY "Public audits are viewable" ON audits
  FOR SELECT USING (is_public = true);

-- Insert policy for anonymous users
CREATE POLICY "Anyone can create audits" ON audits
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can create leads" ON leads
  FOR INSERT WITH CHECK (true);

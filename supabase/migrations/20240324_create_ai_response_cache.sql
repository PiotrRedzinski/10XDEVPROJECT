-- Create AI response cache table
CREATE TABLE ai_response_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cache_key TEXT NOT NULL UNIQUE,
  response JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Add TTL index to automatically clean up old entries
  CONSTRAINT ai_response_cache_created_at_check CHECK (created_at > NOW() - INTERVAL '24 hours')
);

-- Create index for faster lookups
CREATE INDEX ai_response_cache_cache_key_idx ON ai_response_cache(cache_key);

-- Create index for TTL cleanup
CREATE INDEX ai_response_cache_created_at_idx ON ai_response_cache(created_at);

-- Add RLS policies
ALTER TABLE ai_response_cache ENABLE ROW LEVEL SECURITY;

-- Allow read access to all authenticated users
CREATE POLICY "Allow read access to all authenticated users"
  ON ai_response_cache
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow insert access to service role only
CREATE POLICY "Allow insert access to service role only"
  ON ai_response_cache
  FOR INSERT
  TO service_role
  WITH CHECK (true); 
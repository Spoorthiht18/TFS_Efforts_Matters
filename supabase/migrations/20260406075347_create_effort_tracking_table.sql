-- Drop existing policies (if already created)
DROP POLICY IF EXISTS "Allow all to view effort records" ON effort_records;
DROP POLICY IF EXISTS "Allow all to insert effort records" ON effort_records;
DROP POLICY IF EXISTS "Allow all to update effort records" ON effort_records;
DROP POLICY IF EXISTS "Allow all to delete effort records" ON effort_records;

-- Ensure table exists
CREATE TABLE IF NOT EXISTS effort_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_name text NOT NULL,
  story_number text NOT NULL,
  description text NOT NULL,
  state text NOT NULL,
  tool_used boolean DEFAULT false,
  tool_name text,
  effort_with_tool numeric,
  effort_without_tool numeric,
  reason_not_used text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE effort_records ENABLE ROW LEVEL SECURITY;

-- Recreate policies cleanly
CREATE POLICY "Allow all to view effort records"
ON effort_records
FOR SELECT
USING (true);

CREATE POLICY "Allow all to insert effort records"
ON effort_records
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow all to update effort records"
ON effort_records
FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow all to delete effort records"
ON effort_records
FOR DELETE
USING (true);
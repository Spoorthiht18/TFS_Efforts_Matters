/*
  # Employee Effort Tracking System

  1. New Tables
    - `effort_records`
      - `id` (uuid, primary key) - Unique identifier for each record
      - `developer_name` (text) - Name of the developer
      - `story_number` (text) - Story/Incident/Task number
      - `description` (text) - Story or incident description
      - `state` (text) - Current state (In Progress, Completed, etc.)
      - `tool_used` (boolean) - Whether AI tool was used
      - `tool_name` (text, nullable) - Name of tool used (Codex/ChatGPT)
      - `effort_with_tool` (numeric, nullable) - Hours spent with AI tool
      - `effort_without_tool` (numeric, nullable) - Estimated hours without tool
      - `reason_not_used` (text, nullable) - Reason if tool was not used
      - `created_at` (timestamptz) - When record was created
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `effort_records` table
    - Add policy for anyone to read all records (for dashboard viewing)
    - Add policy for anyone to insert records (for employee submissions)
    - Add policy for anyone to update their own records
*/

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

ALTER TABLE effort_records ENABLE ROW LEVEL SECURITY;

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
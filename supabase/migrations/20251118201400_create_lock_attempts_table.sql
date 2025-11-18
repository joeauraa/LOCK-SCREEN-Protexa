/*
  # Lock Screen Attempts Tracking

  1. New Tables
    - `lock_attempts`
      - `id` (uuid, primary key) - Unique identifier for each attempt record
      - `device_id` (text) - Browser fingerprint or device identifier
      - `failed_attempts` (integer) - Counter for consecutive failed attempts
      - `locked_until` (timestamptz) - Timestamp until device is locked (null if not locked)
      - `last_attempt_at` (timestamptz) - Timestamp of last attempt
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Record last update timestamp

  2. Security
    - Enable RLS on `lock_attempts` table
    - Add policy for public access (lock screen is pre-auth)
    
  3. Indexes
    - Add index on device_id for fast lookups
*/

CREATE TABLE IF NOT EXISTS lock_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id text UNIQUE NOT NULL,
  failed_attempts integer DEFAULT 0,
  locked_until timestamptz,
  last_attempt_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lock_attempts_device_id ON lock_attempts(device_id);

ALTER TABLE lock_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access to lock attempts"
  ON lock_attempts
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);
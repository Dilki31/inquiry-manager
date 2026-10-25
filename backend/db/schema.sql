-- backend/db/schema.sql
-- Run once on a fresh database. Safe to re-run: guarded with IF NOT EXISTS / DO blocks.

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('staff', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE inquiry_status AS ENUM ('new', 'in_progress', 'resolved');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS users (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email         text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  full_name     text NOT NULL,
  role          user_role NOT NULL DEFAULT 'staff',
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS inquiries (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL CHECK (char_length(btrim(customer_name)) BETWEEN 1 AND 120),
  contact       text NOT NULL CHECK (char_length(btrim(contact)) BETWEEN 3 AND 200),
  subject       text NOT NULL CHECK (char_length(btrim(subject)) BETWEEN 1 AND 200),
  description   text NOT NULL CHECK (char_length(btrim(description)) BETWEEN 1 AND 2000),
  status        inquiry_status NOT NULL DEFAULT 'new',
  created_by    uuid NOT NULL REFERENCES users(id),
  version       integer NOT NULL DEFAULT 1,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- Indexes for the queries we will actually run (list by owner, filter by status, newest first)
CREATE INDEX IF NOT EXISTS idx_inquiries_created_by_created_at
  ON inquiries (created_by, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inquiries_status
  ON inquiries (status);
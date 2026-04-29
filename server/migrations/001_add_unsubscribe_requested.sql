-- Migration 001: Add unsubscribe_requested column to vector_profiles
-- This column tracks whether a user has opted out of follow-up emails.
-- Applied automatically by initDatabase() via ALTER TABLE ... ADD COLUMN IF NOT EXISTS.

ALTER TABLE vector_profiles
ADD COLUMN IF NOT EXISTS unsubscribe_requested BOOLEAN NOT NULL DEFAULT FALSE;

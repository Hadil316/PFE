-- Migration: Add max_current column to assets table
-- Run this SQL in your PostgreSQL database

ALTER TABLE assets ADD COLUMN IF NOT EXISTS max_current DOUBLE PRECISION DEFAULT 80.0;

-- Also add webSocketLink if missing
ALTER TABLE assets ADD COLUMN IF NOT EXISTS websocketlink VARCHAR(255);
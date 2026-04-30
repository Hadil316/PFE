-- Migration: Create alerts table
-- Run this SQL in your PostgreSQL database

CREATE TABLE IF NOT EXISTS alerts (
  id SERIAL PRIMARY KEY,
  asset_id INTEGER NOT NULL,
  message TEXT NOT NULL,
  value DOUBLE PRECISION NOT NULL,
  threshold DOUBLE PRECISION NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Optional: Add foreign key if assets table exists
-- ALTER TABLE alerts ADD CONSTRAINT fk_alerts_asset FOREIGN KEY (asset_id) REFERENCES assets(id);

-- Optional: Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_alerts_asset_id ON alerts(asset_id);
CREATE INDEX IF NOT EXISTS idx_alerts_timestamp ON alerts(timestamp DESC);
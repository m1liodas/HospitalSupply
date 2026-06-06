-- Add remaining_quantity column to usage_logs_archive
-- This tracks the remaining quantity at the time each usage was recorded

ALTER TABLE usage_logs_archive 
ADD COLUMN IF NOT EXISTS remaining_quantity INT DEFAULT 0 AFTER pm_quantity;

ALTER TABLE usage_logs_archive 
ADD COLUMN IF NOT EXISTS quantity_received INT DEFAULT 0 AFTER remaining_quantity;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_usage_logs_archive_date ON usage_logs_archive(usage_date);

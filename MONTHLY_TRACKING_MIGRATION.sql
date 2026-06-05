-- Add Monthly Tracking to Usage Logs
-- Run this to enable monthly cycling and archiving

-- Add month column to usage_logs if it doesn't exist
ALTER TABLE usage_logs 
ADD COLUMN IF NOT EXISTS month_year VARCHAR(7) DEFAULT NULL;

-- Add period identifier to station tables to track current period
ALTER TABLE dr_station ADD COLUMN IF NOT EXISTS current_period VARCHAR(7) DEFAULT NULL;
ALTER TABLE er_station ADD COLUMN IF NOT EXISTS current_period VARCHAR(7) DEFAULT NULL;
ALTER TABLE medicine_station ADD COLUMN IF NOT EXISTS current_period VARCHAR(7) DEFAULT NULL;
ALTER TABLE nicu_station ADD COLUMN IF NOT EXISTS current_period VARCHAR(7) DEFAULT NULL;
ALTER TABLE ob_gyne_station ADD COLUMN IF NOT EXISTS current_period VARCHAR(7) DEFAULT NULL;
ALTER TABLE opd_station ADD COLUMN IF NOT EXISTS current_period VARCHAR(7) DEFAULT NULL;
ALTER TABLE or_station ADD COLUMN IF NOT EXISTS current_period VARCHAR(7) DEFAULT NULL;
ALTER TABLE pedia_station ADD COLUMN IF NOT EXISTS current_period VARCHAR(7) DEFAULT NULL;
ALTER TABLE surgical_station ADD COLUMN IF NOT EXISTS current_period VARCHAR(7) DEFAULT NULL;

-- Create archive tables for previous months
CREATE TABLE IF NOT EXISTS usage_logs_archive (
  id INT AUTO_INCREMENT PRIMARY KEY,
  item_id INT NOT NULL,
  usage_date DATE NOT NULL,
  am_quantity INT DEFAULT 0,
  pm_quantity INT DEFAULT 0,
  month_year VARCHAR(7) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create station history table to track snapshots at each month
CREATE TABLE IF NOT EXISTS station_period_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  station_name VARCHAR(255) NOT NULL,
  item_id INT NOT NULL,
  item_name VARCHAR(255) NOT NULL,
  item_brand VARCHAR(255),
  quantity_received INT DEFAULT 0,
  quantity_used INT DEFAULT 0,
  quantity_remaining INT DEFAULT 0,
  month_year VARCHAR(7) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_usage_logs_month ON usage_logs(month_year);
CREATE INDEX IF NOT EXISTS idx_usage_logs_date ON usage_logs(usage_date);
CREATE INDEX IF NOT EXISTS idx_usage_logs_archive_month ON usage_logs_archive(month_year);
CREATE INDEX IF NOT EXISTS idx_station_history_month ON station_period_history(month_year, station_name);

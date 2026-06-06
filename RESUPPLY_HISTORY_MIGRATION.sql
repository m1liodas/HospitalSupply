-- Migration: create resupply_history table
-- Run this on your database to enable resupply history tracking

CREATE TABLE IF NOT EXISTS resupply_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  item_id INT NOT NULL,
  quantity_added INT NOT NULL,
  notes TEXT,
  added_at DATETIME NOT NULL,
  FOREIGN KEY (item_id) REFERENCES items(items_id) ON DELETE CASCADE
);

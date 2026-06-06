-- MedSupply Database Setup
-- Run this in phpMyAdmin or MySQL client

CREATE DATABASE IF NOT EXISTS medsupply CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE medsupply;

-- Items table (simplified for central supply)
CREATE TABLE items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  brand VARCHAR(255) NOT NULL,
  quantity INT NOT NULL DEFAULT 0,
  selling_price DECIMAL(10,2) NOT NULL,
  expiration_date DATE NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


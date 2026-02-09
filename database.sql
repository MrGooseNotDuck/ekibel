-- =====================================================
-- 🚽 EKIBEL - Uproszczony schemat (bez rezerwacji/opinii)
-- =====================================================

CREATE DATABASE IF NOT EXISTS `ekibel` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `ekibel`;

-- =====================================================
-- TABELA: toilets
-- =====================================================
DROP TABLE IF EXISTS `reservations`;
DROP TABLE IF EXISTS `reviews`;
DROP TABLE IF EXISTS `queue`;
DROP TABLE IF EXISTS `toilets`;

CREATE TABLE `toilets` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `toilet_id` VARCHAR(10) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `occupied_by` VARCHAR(100) DEFAULT NULL,
    `warm_water` TINYINT(1) DEFAULT 1,
    PRIMARY KEY (`id`),
    UNIQUE KEY `toilet_id` (`toilet_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABELA: queue
-- =====================================================
CREATE TABLE `queue` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `toilet_id` VARCHAR(10) NOT NULL,
    `person_name` VARCHAR(100) NOT NULL,
    `position` INT(11) NOT NULL,
    PRIMARY KEY (`id`),
    KEY `idx_toilet` (`toilet_id`),
    KEY `idx_position` (`toilet_id`, `position`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- DANE POCZĄTKOWE
-- =====================================================
INSERT INTO `toilets` (`toilet_id`, `name`, `warm_water`) VALUES
('t1', 'Parter - Kuchnia 🍳', 1),
('t2', 'Parter - Schody 🪜', 1),
('t3', 'I Piętro 1️⃣', 1),
('t4', 'II Piętro 2️⃣', 1);

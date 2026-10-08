-- ====================================================================
-- AETHER CALISTHENICS - MYSQL VERİTABANI ŞEMASI
-- Kullanıcılar, Güç Değerlendirmeleri, Hedefler ve Kayıtlı Programlar
-- ====================================================================

CREATE DATABASE IF NOT EXISTS `calisthenics_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `calisthenics_db`;

-- 1. KULLANICILAR TABLOSU
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. KULLANICI TEMEL HAREKETLER & GÜÇ DEĞERLENDİRMESİ
CREATE TABLE IF NOT EXISTS `user_assessments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL UNIQUE,
  `pullups` INT NOT NULL DEFAULT 8,
  `pushups` INT NOT NULL DEFAULT 20,
  `dips` INT NOT NULL DEFAULT 12,
  `hollow_hold` INT NOT NULL DEFAULT 30,
  `lsit_hold` INT NOT NULL DEFAULT 10,
  `handstand_wall` INT NOT NULL DEFAULT 15,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. KULLANICI HEDEFLERİ (HEDEFLERİM)
CREATE TABLE IF NOT EXISTS `user_goals` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `skill_id` VARCHAR(50) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `user_skill_unique` (`user_id`, `skill_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. OLUŞTURULAN ANTRENMAN PROGRAMLARI
CREATE TABLE IF NOT EXISTS `generated_programs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `program_code` VARCHAR(100) NOT NULL,
  `split_type` VARCHAR(100) NOT NULL,
  `days_per_week` INT NOT NULL,
  `selected_days` VARCHAR(255) NOT NULL,
  `session_duration` VARCHAR(50) NOT NULL,
  `program_json` LONGTEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ÖRNEK TEST KULLANICISI (İsteğe bağlı)
-- Şifre: 123456
INSERT INTO `users` (`name`, `email`, `password_hash`) 
VALUES ('Calisthenics Sporcusu', 'demo@calisthenics.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi')
ON DUPLICATE KEY UPDATE `id`=`id`;

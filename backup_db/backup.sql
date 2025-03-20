-- --------------------------------------------------------
-- Хост:                         127.0.0.1
-- Версия сервера:               8.0.41 - MySQL Community Server - GPL
-- Операционная система:         Linux
-- HeidiSQL Версия:              12.8.0.6908
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Дамп структуры базы данных blog
CREATE DATABASE IF NOT EXISTS `blog` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `blog`;

-- Дамп структуры для таблица blog.chats
CREATE TABLE IF NOT EXISTS `chats` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `owner_id` int DEFAULT NULL,
  `leaked_id` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Дамп данных таблицы blog.chats: ~0 rows (приблизительно)
DELETE FROM `chats`;

-- Дамп структуры для таблица blog.contact_us
CREATE TABLE IF NOT EXISTS `contact_us` (
  `content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Дамп данных таблицы blog.contact_us: ~1 rows (приблизительно)
DELETE FROM `contact_us`;
INSERT INTO `contact_us` (`content`, `json`) VALUES
	('<div class="page-text-wrapper">\n              <p style="text-align: center;"><span style="font-size: 36pt;"><s><span style="text-decoration: underline;"><em><strong><span style="font-family: \'comic sans ms\', sans-serif; color: #e03e2d; background-color: #bfedd2; text-decoration: underline;">Contact Us</span></strong></em></span></s></span></p>\n<hr>\n<p style="text-align: center;"><span style="color: #e03e2d;">VV_VV_VV</span></p>\n            </div>', '{"time":1740464469038,"blocks":[{"id":"bcJcr8cVB9","type":"p","data":{"text":"<p style=\\"text-align: center;\\"><span style=\\"font-size: 36pt;\\"><s><span style=\\"text-decoration: underline;\\"><em><strong><span style=\\"font-family: \'comic sans ms\', sans-serif; color: #e03e2d; background-color: #bfedd2; text-decoration: underline;\\">Contact Us</span></strong></em></span></s></span></p>\\n<hr>\\n<p style=\\"text-align: center;\\"><span style=\\"color: #e03e2d;\\">VV_VV_VV</span></p>"}}],"version":"2.30.1"}');

-- Дамп структуры для таблица blog.leaked
CREATE TABLE IF NOT EXISTS `leaked` (
  `id` int NOT NULL AUTO_INCREMENT,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `payout` float NOT NULL DEFAULT '0',
  `payout_unit` tinyint NOT NULL DEFAULT '0',
  `company_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `website` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `logo_url` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `blog` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '0-draft, 1-publish,',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `user_id` int NOT NULL,
  `expires` datetime DEFAULT NULL,
  `status` tinyint NOT NULL DEFAULT '0',
  `builder` tinyint DEFAULT '0' COMMENT '1-build',
  `publish` tinyint DEFAULT '0',
  `is_accept` tinyint DEFAULT '2' COMMENT '-1 - отклонено, 0 - ожидание, 1 - принято, 2 - draft',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Дамп данных таблицы blog.leaked: ~0 rows (приблизительно)
DELETE FROM `leaked`;

-- Дамп структуры для таблица blog.leaked_screenshots
CREATE TABLE IF NOT EXISTS `leaked_screenshots` (
  `id` int NOT NULL AUTO_INCREMENT,
  `leaked_id` int NOT NULL,
  `screenshot_url` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_leaked` (`leaked_id`),
  CONSTRAINT `fk_leaked` FOREIGN KEY (`leaked_id`) REFERENCES `leaked` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Дамп данных таблицы blog.leaked_screenshots: ~12 rows (приблизительно)
DELETE FROM `leaked_screenshots`;

-- Дамп структуры для таблица blog.leaked_urls
CREATE TABLE IF NOT EXISTS `leaked_urls` (
  `id` int NOT NULL AUTO_INCREMENT,
  `leaked_id` int NOT NULL DEFAULT '0',
  `url` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_leaked_links_leaked` (`leaked_id`),
  CONSTRAINT `FK_leaked_links_leaked` FOREIGN KEY (`leaked_id`) REFERENCES `leaked` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Дамп данных таблицы blog.leaked_urls: ~6 rows (приблизительно)
DELETE FROM `leaked_urls`;

-- Дамп структуры для таблица blog.messages
CREATE TABLE IF NOT EXISTS `messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `chat_id` int NOT NULL,
  `sender_id` int DEFAULT NULL,
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `chat_id` (`chat_id`),
  CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`chat_id`) REFERENCES `chats` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Дамп данных таблицы blog.messages: ~0 rows (приблизительно)
DELETE FROM `messages`;

-- Дамп структуры для таблица blog.news
CREATE TABLE IF NOT EXISTS `news` (
  `uid` int unsigned NOT NULL AUTO_INCREMENT,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `update_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_visibility` tinyint DEFAULT '0',
  `user_id` int unsigned DEFAULT NULL,
  `image` varchar(255) DEFAULT 'default.png',
  `title` text,
  `preview` text CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci,
  `content` longtext,
  `json` longtext,
  PRIMARY KEY (`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- Дамп данных таблицы blog.news: ~0 rows (приблизительно)
DELETE FROM `news`;

-- Дамп структуры для таблица blog.order_service
CREATE TABLE IF NOT EXISTS `order_service` (
  `content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Дамп данных таблицы blog.order_service: ~1 rows (приблизительно)
DELETE FROM `order_service`;
INSERT INTO `order_service` (`content`, `json`) VALUES
	('<div class="page-text-wrapper">\n              <p style="text-align: center;"><strong>Order a service</strong></p>\n            </div>', '{"time":1740464457446,"blocks":[{"id":"YvQ0v2eQZR","type":"p","data":{"text":"<p style=\\"text-align: center;\\"><strong>Order a service</strong></p>"}}],"version":"2.30.1"}');

-- Дамп структуры для таблица blog.terms_and_conditions
CREATE TABLE IF NOT EXISTS `terms_and_conditions` (
  `content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Дамп данных таблицы blog.terms_and_conditions: ~1 rows (приблизительно)
DELETE FROM `terms_and_conditions`;
INSERT INTO `terms_and_conditions` (`content`, `json`) VALUES
	('<div class="page-text-wrapper">\n              <p style="text-align: center;"><span style="font-size: 36pt;">Terms and Conditions</span></p>\n            </div>', '{"time":1740464434526,"blocks":[{"id":"1nRlui53wp","type":"p","data":{"text":"<p style=\\"text-align: center;\\"><span style=\\"font-size: 36pt;\\">Terms and Conditions</span></p>"}}],"version":"2.30.1"}');

-- Дамп структуры для таблица blog.used_folders
CREATE TABLE IF NOT EXISTS `used_folders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `leaked_id` int NOT NULL,
  `folder_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `archive_number` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT '1',
  `status` enum('pending','assigned','completed') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'assigned',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `archive_number` (`archive_number`),
  KEY `user_id` (`user_id`),
  KEY `company_id` (`leaked_id`) USING BTREE,
  CONSTRAINT `used_folders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`uid`) ON DELETE CASCADE,
  CONSTRAINT `used_folders_ibfk_2` FOREIGN KEY (`leaked_id`) REFERENCES `leaked` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Дамп данных таблицы blog.used_folders: ~0 rows (приблизительно)
DELETE FROM `used_folders`;

-- Дамп структуры для таблица blog.users
CREATE TABLE IF NOT EXISTS `users` (
  `uid` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `login` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `password_hash` text CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `registration_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status_id` int NOT NULL DEFAULT '1',
  `role_id` int NOT NULL DEFAULT '2',
  `last_login` datetime DEFAULT NULL,
  `ipv4` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `login_attempts` int NOT NULL DEFAULT '0',
  `token` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `token_creation` datetime DEFAULT NULL,
  `refresh_token` varchar(255) DEFAULT NULL,
  `email` text,
  PRIMARY KEY (`uid`),
  UNIQUE KEY `login_UNIQUE` (`login`),
  UNIQUE KEY `token_UNIQUE` (`token`)
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8mb3;

-- Дамп данных таблицы blog.users: ~1 rows (приблизительно)
DELETE FROM `users`;
INSERT INTO `users` (`uid`, `name`, `login`, `password_hash`, `registration_date`, `status_id`, `role_id`, `last_login`, `ipv4`, `login_attempts`, `token`, `token_creation`, `refresh_token`, `email`) VALUES
	(5, 'root', 'root', '$2a$10$gN.fub8knZfwagApDdZgr..ubB9VAEYgDg072eg0TTBh6vPoZgZca', '2025-01-31 23:31:20', 1, 1, NULL, NULL, 0, NULL, NULL, NULL, NULL);

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;

-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 04, 2026 at 01:03 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `taskflow`
--

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `id` int(11) NOT NULL,
  `sender_id` int(11) NOT NULL,
  `receiver_id` int(11) NOT NULL,
  `encrypted_content` text NOT NULL,
  `iv` varchar(64) NOT NULL,
  `is_deleted_for_everyone` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `messages`
--

INSERT INTO `messages` (`id`, `sender_id`, `receiver_id`, `encrypted_content`, `iv`, `is_deleted_for_everyone`, `created_at`) VALUES
(1, 1, 2, '[This message was deleted]', 'a1b2c3d4e5f6', 1, '2026-09-04 07:29:54'),
(2, 1, 2, '[This message was deleted]', 'a1b2c3d4e5f6', 1, '2026-09-04 10:52:56');

-- --------------------------------------------------------

--
-- Table structure for table `message_user_deletions`
--

CREATE TABLE `message_user_deletions` (
  `message_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------
--
-- Table structure for table `message_user_reads`
--

CREATE TABLE `message_user_reads` (
  `message_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  PRIMARY KEY (`message_id`, `user_id`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `message_user_deletions`
--

INSERT INTO `message_user_deletions` (`message_id`, `user_id`) VALUES
(1, 2),
(2, 2);

-- --------------------------------------------------------

--
-- Table structure for table `tasks`
--

CREATE TABLE `tasks` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('todo','in_progress','completed') NOT NULL DEFAULT 'todo',
  `priority` enum('low','medium','high') NOT NULL DEFAULT 'medium',
  `assigned_to` int(11) DEFAULT NULL,
  `created_by` int(11) NOT NULL,
  `due_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tasks`
--

INSERT INTO `tasks` (`id`, `title`, `description`, `status`, `priority`, `assigned_to`, `created_by`, `due_date`, `created_at`, `updated_at`) VALUES
(8, 'Implementation', 'Something', 'todo', 'medium', 2, 1, '2026-09-03', '2026-09-03 07:04:48', '2026-09-03 07:04:48'),
(10, 'momom', 'iiojio', 'todo', 'medium', 2, 2, '2026-09-03', '2026-09-03 07:16:28', '2026-09-03 07:16:28'),
(12, 'Demo', 'Demo', 'in_progress', 'medium', 6, 1, '2026-09-01', '2026-09-04 04:38:57', '2026-09-04 04:42:04');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(191) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','member') NOT NULL DEFAULT 'member',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `created_at`) VALUES
(1, 'Admin User', 'admin@taskflow.com', '$2b$10$XA6V.23kgi1CtmJ2M/Px9upQ0g5amNzu1gJRNt8eB0TJMt.3qs8Au', 'admin', '2026-09-02 05:25:02'),
(2, 'John Member', 'member@taskflow.com', '$2b$10$XA6V.23kgi1CtmJ2M/Px9uXXzNTCFdmfs8H/gwTdnXy09QIVA3wPa', 'member', '2026-09-02 05:25:02'),
(5, 'Route Test User', 'route.test.639240510527502194@example.com', '$2b$10$.x0h9k.B17aMfQJ5AxG/5OV36wTl94Bvr56yhFxm7vY8YIZiN9BDq', 'member', '2026-09-03 11:50:52'),
(6, 'Alex Mercer', 'alex@taskflow.com', '$2b$10$HJ9JtMSuQ2b7Qskfsl58o.Ti3/F9yhDRy8d8PvEnuQUWgX.6juYq.', 'member', '2026-09-03 11:51:34'),
(7, 'Hacker Attempt', 'hacker@taskflow.com', '$2b$10$PSf/.VCyK1SezWsxBYwlT.aqUcALlOrWhry5xQhR57tSZ2lCBKPKO', 'member', '2026-09-03 11:52:24'),
(10, 'HmdNVD', 'hd@taskflow.com', '$2b$10$W9/hS/OvODugl.qnnFlzzecIWSx2.ETY0KV1DcvCMA5sOLvP0cbSu', 'member', '2026-09-03 12:04:10'),
(11, 'HmdNVD', 'had@taskflow.com', '$2b$10$zDaBK4Z65eQYwnVEIbmMkuJMP3BKM19xNoUZqw0kSoup3YZjgnjaK', 'member', '2026-09-03 12:06:19');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sender_id` (`sender_id`),
  ADD KEY `receiver_id` (`receiver_id`);

--
-- Indexes for table `message_user_deletions`
--
ALTER TABLE `message_user_deletions`
  ADD PRIMARY KEY (`message_id`,`user_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `tasks`
--
ALTER TABLE `tasks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `assigned_to` (`assigned_to`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `tasks`
--
ALTER TABLE `tasks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `message_user_deletions`
--
ALTER TABLE `message_user_deletions`
  ADD CONSTRAINT `message_user_deletions_ibfk_1` FOREIGN KEY (`message_id`) REFERENCES `messages` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `message_user_deletions_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `tasks`
--
ALTER TABLE `tasks`
  ADD CONSTRAINT `tasks_ibfk_1` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `tasks_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

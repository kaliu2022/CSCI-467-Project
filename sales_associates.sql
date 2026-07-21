-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 20, 2026 at 08:00 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `quotesystem`
--

-- --------------------------------------------------------

--
-- Table structure for table `sales_associates`
--

CREATE TABLE `sales_associates` (
  `associate_id` varchar(20) NOT NULL,
  `user_id` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(100) NOT NULL,
  `address` varchar(150) DEFAULT NULL,
  `accumulated_commission` decimal(10,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sales_associates`
--

INSERT INTO `sales_associates` (`associate_id`, `user_id`, `password`, `name`, `address`, `accumulated_commission`) VALUES
('RE-112233', 'mjones', 'pass123', 'Maria Jones', '456 Oak Ave', 0.00),
('RE-334455', 'tking', 'pass456', 'Tyler King', '789 Pine Rd', 0.00),
('RE-556677', 'agarcia', 'pass789', 'Ana Garcia', '321 Elm St', 0.00),
('RE-676732', 'jsmith', 'test123', 'John Smith', '123 Main St', 0.00);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `sales_associates`
--
ALTER TABLE `sales_associates`
  ADD PRIMARY KEY (`associate_id`),
  ADD UNIQUE KEY `user_id` (`user_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

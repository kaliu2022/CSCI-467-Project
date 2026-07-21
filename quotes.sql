-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 20, 2026 at 07:59 PM
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
-- Table structure for table `quotes`
--

CREATE TABLE `quotes` (
  `quote_id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `associate_id` varchar(20) NOT NULL,
  `status` enum('draft','finalized','sanctioned','ordered') DEFAULT 'draft',
  `discount_type` enum('percent','amount') DEFAULT NULL,
  `discount_value` decimal(10,2) DEFAULT 0.00,
  `final_amount` decimal(10,2) DEFAULT NULL,
  `secret_notes` text DEFAULT NULL,
  `po_number` varchar(50) DEFAULT NULL,
  `processing_date` date DEFAULT NULL,
  `commission_rate` decimal(5,2) DEFAULT NULL,
  `created_date` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `quotes`
--

INSERT INTO `quotes` (`quote_id`, `customer_id`, `associate_id`, `status`, `discount_type`, `discount_value`, `final_amount`, `secret_notes`, `po_number`, `processing_date`, `commission_rate`, `created_date`) VALUES
(1, 21, 'RE-676732', 'draft', NULL, 0.00, NULL, 'test note', NULL, NULL, NULL, '2026-07-20 12:51:44'),
(2, 22, 'RE-112233', 'draft', NULL, 0.00, NULL, 'Follow up next week', NULL, NULL, NULL, '2026-07-20 12:54:09'),
(3, 23, 'RE-334455', 'finalized', NULL, 0.00, NULL, NULL, NULL, NULL, NULL, '2026-07-20 12:54:09');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `quotes`
--
ALTER TABLE `quotes`
  ADD PRIMARY KEY (`quote_id`),
  ADD KEY `associate_id` (`associate_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `quotes`
--
ALTER TABLE `quotes`
  MODIFY `quote_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `quotes`
--
ALTER TABLE `quotes`
  ADD CONSTRAINT `quotes_ibfk_1` FOREIGN KEY (`associate_id`) REFERENCES `sales_associates` (`associate_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

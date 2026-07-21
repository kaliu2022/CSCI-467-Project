-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 20, 2026 at 10:31 PM
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
-- Table structure for table `quote_line_items`
--

CREATE TABLE `quote_line_items` (
  `quote_id` int(11) NOT NULL,
  `item_id` int(11) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `quote_line_items`
--

INSERT INTO `quote_line_items` (`quote_id`, `item_id`, `price`, `quantity`) VALUES
(1, 1, 9.99, 3),
(1, 2, 14.50, 1),
(2, 3, 3.25, 10),
(3, 1, 9.99, 2),
(3, 2, 14.50, 4);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `quote_line_items`
--
ALTER TABLE `quote_line_items`
  ADD PRIMARY KEY (`quote_id`,`item_id`),
  ADD KEY `item_id` (`item_id`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `quote_line_items`
--
ALTER TABLE `quote_line_items`
  ADD CONSTRAINT `quote_line_items_ibfk_1` FOREIGN KEY (`quote_id`) REFERENCES `quotes` (`quote_id`),
  ADD CONSTRAINT `quote_line_items_ibfk_2` FOREIGN KEY (`item_id`) REFERENCES `items` (`item_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

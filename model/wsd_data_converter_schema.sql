-- MariaDB dump 10.19  Distrib 10.5.13-MariaDB, for Linux (x86_64)
--
-- Host: localhost    Database: wsd_data_converter
-- ------------------------------------------------------
-- Server version	10.5.13-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `dat_category`
--

DROP TABLE IF EXISTS `dat_category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dat_category` (
  `category_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `category_uuid` varchar(36) COLLATE utf8_unicode_ci NOT NULL,
  `category_name` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `created_on` timestamp NOT NULL DEFAULT current_timestamp(),
  `removed_on` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`category_id`),
  UNIQUE KEY `category_uuid` (`category_uuid`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `dat_clients`
--

DROP TABLE IF EXISTS `dat_clients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dat_clients` (
  `client_serial` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `client_uuid` varchar(36) COLLATE utf8_unicode_ci NOT NULL,
  `client_type` varchar(40) COLLATE utf8_unicode_ci NOT NULL,
  `client_name` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `client_postcode` varchar(40) COLLATE utf8_unicode_ci DEFAULT NULL,
  `client_addr_1` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `client_addr_2` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `client_representative` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `client_phone` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `client_email` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `created_on` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_by` varchar(36) COLLATE utf8_unicode_ci NOT NULL,
  `updated_on` timestamp NULL DEFAULT NULL,
  `updated_by` varchar(36) COLLATE utf8_unicode_ci DEFAULT NULL,
  `removed_on` timestamp NULL DEFAULT NULL,
  `removed_by` varchar(36) COLLATE utf8_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`client_serial`),
  UNIQUE KEY `client_uuid` (`client_uuid`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `dat_fixing`
--

DROP TABLE IF EXISTS `dat_fixing`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dat_fixing` (
  `fix_serial` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `removed_order_no` int(11) NOT NULL,
  `updated_order_no` int(11) NOT NULL,
  `invalid_order_no` int(11) NOT NULL,
  `created_on` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`fix_serial`),
  UNIQUE KEY `removed` (`invalid_order_no`,`removed_order_no`,`updated_order_no`)
) ENGINE=InnoDB AUTO_INCREMENT=74 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `dat_fixing2`
--

DROP TABLE IF EXISTS `dat_fixing2`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dat_fixing2` (
  `fix_serial` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `customer_no` int(11) NOT NULL,
  `invalid_date` date DEFAULT NULL,
  `invalid_order_no` int(11) DEFAULT NULL,
  `invalid_organization_no` int(11) DEFAULT NULL,
  `remove_date` date DEFAULT NULL,
  `remove_order_no` int(11) DEFAULT NULL,
  `remove_organization_no` int(11) DEFAULT NULL,
  `update_date` date DEFAULT NULL,
  `update_order_no` int(11) DEFAULT NULL,
  `update_organization_no` int(11) DEFAULT NULL,
  `created_on` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`fix_serial`),
  UNIQUE KEY `order_unique` (`invalid_date`,`invalid_order_no`)
) ENGINE=InnoDB AUTO_INCREMENT=1297 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `dat_ipfs_store`
--

DROP TABLE IF EXISTS `dat_ipfs_store`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dat_ipfs_store` (
  `order_source` enum('UTSUMI','JANBURE') NOT NULL COMMENT '注文元',
  `order_no` int(10) unsigned NOT NULL COMMENT '注文番号',
  `order_date` date NOT NULL COMMENT '注文日',
  `delivery_date` date NOT NULL COMMENT '出荷日',
  `process_time` timestamp NOT NULL DEFAULT current_timestamp() COMMENT '処理時間',
  `recipient_name` varchar(255) NOT NULL COMMENT '配達先名',
  `amount` decimal(15,3) NOT NULL COMMENT '金額',
  `ipfs_hash` varchar(100) NOT NULL DEFAULT '' COMMENT 'pdfまたはheader,messaiのipfs cid',
  `ipfs_files` text NOT NULL,
  `incoming_data` text NOT NULL COMMENT '注文を受けたときのJSON string',
  `processed_data` text DEFAULT NULL,
  `processed_flag` tinyint(4) NOT NULL DEFAULT 0,
  `confirm_time` datetime DEFAULT NULL,
  PRIMARY KEY (`order_source`,`order_date`,`order_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `dat_orders`
--

DROP TABLE IF EXISTS `dat_orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dat_orders` (
  `order_serial` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `order_uuid` varchar(36) COLLATE utf8_unicode_ci NOT NULL,
  `pdf_date` date DEFAULT NULL,
  `pdf_no` varchar(20) COLLATE utf8_unicode_ci DEFAULT NULL,
  `order_no` varchar(20) COLLATE utf8_unicode_ci DEFAULT NULL,
  `delivery_date` date DEFAULT NULL,
  `shipment_confirmation_date` date DEFAULT NULL,
  `customer_no` varchar(20) COLLATE utf8_unicode_ci DEFAULT NULL,
  `organization_no` varchar(20) COLLATE utf8_unicode_ci DEFAULT NULL,
  `contact` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `recipient` text COLLATE utf8_unicode_ci NOT NULL,
  `shipper` text COLLATE utf8_unicode_ci NOT NULL,
  `has_change` tinyint(4) NOT NULL,
  `hex_hash` varchar(36) COLLATE utf8_unicode_ci DEFAULT NULL,
  `notes` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `delivery_notice` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `shipper_notice` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `products` text COLLATE utf8_unicode_ci NOT NULL,
  `created_on` timestamp NOT NULL DEFAULT current_timestamp(),
  `touched_on` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`order_serial`),
  UNIQUE KEY `order_uuid` (`order_uuid`),
  UNIQUE KEY `order_unique` (`pdf_date`,`order_no`)
) ENGINE=InnoDB AUTO_INCREMENT=17848 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `dat_orders2`
--

DROP TABLE IF EXISTS `dat_orders2`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dat_orders2` (
  `order_serial` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `order_uuid` varchar(36) COLLATE utf8_unicode_ci NOT NULL,
  `order_no` varchar(36) COLLATE utf8_unicode_ci NOT NULL,
  `order_date` date NOT NULL,
  `supply` text COLLATE utf8_unicode_ci DEFAULT NULL,
  `customer_no` varchar(36) COLLATE utf8_unicode_ci DEFAULT NULL,
  `customer` text COLLATE utf8_unicode_ci DEFAULT NULL,
  `recipient_no` varchar(36) COLLATE utf8_unicode_ci DEFAULT NULL,
  `recipient` text COLLATE utf8_unicode_ci DEFAULT NULL,
  `details` text COLLATE utf8_unicode_ci DEFAULT NULL,
  `destination_division` varchar(10) COLLATE utf8_unicode_ci DEFAULT NULL,
  `warehouse` text COLLATE utf8_unicode_ci DEFAULT NULL,
  `order_number` varchar(36) COLLATE utf8_unicode_ci DEFAULT NULL,
  `cash_on_delivery_amount` varchar(20) COLLATE utf8_unicode_ci DEFAULT NULL,
  `order_amount` varchar(20) COLLATE utf8_unicode_ci DEFAULT NULL,
  `consumption_tax` varchar(20) COLLATE utf8_unicode_ci DEFAULT NULL,
  `total_order_amount` varchar(20) COLLATE utf8_unicode_ci DEFAULT NULL,
  `cash_on_delivery_division` varchar(5) COLLATE utf8_unicode_ci DEFAULT NULL,
  `contact` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `extra_data` text COLLATE utf8_unicode_ci DEFAULT NULL,
  `created_on` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`order_serial`),
  UNIQUE KEY `order_uuid` (`order_uuid`),
  UNIQUE KEY `order_unique` (`order_no`,`order_date`)
) ENGINE=InnoDB AUTO_INCREMENT=7668 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `dat_orders_forest`
--

DROP TABLE IF EXISTS `dat_orders_forest`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dat_orders_forest` (
  `order_serial` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `order_uuid` varchar(36) COLLATE utf8_unicode_ci NOT NULL,
  `local_serial` varchar(10) COLLATE utf8_unicode_ci DEFAULT NULL,
  `supplier` text COLLATE utf8_unicode_ci DEFAULT NULL,
  `order_classification` varchar(10) COLLATE utf8_unicode_ci DEFAULT NULL,
  `order_date` date DEFAULT NULL,
  `order_no` varchar(20) COLLATE utf8_unicode_ci DEFAULT NULL,
  `total_order_amount` varchar(20) COLLATE utf8_unicode_ci DEFAULT NULL,
  `delivery` text COLLATE utf8_unicode_ci DEFAULT NULL,
  `details` text COLLATE utf8_unicode_ci DEFAULT NULL,
  `designated_delivery_date` date DEFAULT NULL,
  `delivery_response` varchar(30) COLLATE utf8_unicode_ci DEFAULT NULL,
  `special_column` varchar(30) COLLATE utf8_unicode_ci DEFAULT NULL,
  `reserved` text COLLATE utf8_unicode_ci DEFAULT NULL,
  `created_on` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`order_serial`),
  UNIQUE KEY `order_uuid` (`order_uuid`),
  UNIQUE KEY `order_no` (`order_no`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `dat_pricing`
--

DROP TABLE IF EXISTS `dat_pricing`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dat_pricing` (
  `price_serial` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `staff_uuid` varchar(36) COLLATE utf8_unicode_ci NOT NULL,
  `product_uuid` varchar(36) COLLATE utf8_unicode_ci NOT NULL,
  `A_price_low` decimal(10,2) DEFAULT NULL,
  `A_price_med` decimal(10,2) DEFAULT NULL,
  `A_price_high` decimal(10,2) DEFAULT NULL,
  `B_price_low` decimal(10,2) DEFAULT NULL,
  `B_price_med` decimal(10,2) DEFAULT NULL,
  `B_price_high` decimal(10,2) DEFAULT NULL,
  `C_price_low` decimal(10,2) DEFAULT NULL,
  `C_price_med` decimal(10,2) DEFAULT NULL,
  `C_price_high` decimal(10,2) DEFAULT NULL,
  `D_price_low` decimal(10,2) DEFAULT NULL,
  `D_price_med` decimal(10,2) DEFAULT NULL,
  `D_price_high` decimal(10,2) DEFAULT NULL,
  `E_price_low` decimal(10,2) DEFAULT NULL,
  `E_price_med` decimal(10,2) DEFAULT NULL,
  `E_price_high` decimal(10,2) DEFAULT NULL,
  `created_on` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_on` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`price_serial`),
  UNIQUE KEY `staff_product` (`staff_uuid`,`product_uuid`)
) ENGINE=InnoDB AUTO_INCREMENT=14564 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `dat_products`
--

DROP TABLE IF EXISTS `dat_products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dat_products` (
  `product_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `product_uuid` varchar(36) COLLATE utf8_unicode_ci NOT NULL,
  `product_code` varchar(40) COLLATE utf8_unicode_ci NOT NULL,
  `product_img` text COLLATE utf8_unicode_ci DEFAULT NULL,
  `category_uuid` varchar(36) COLLATE utf8_unicode_ci DEFAULT NULL,
  `product_attr` text COLLATE utf8_unicode_ci NOT NULL,
  `created_on` timestamp NOT NULL DEFAULT current_timestamp(),
  `removed_on` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`product_id`),
  UNIQUE KEY `product_uuid` (`product_uuid`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `dat_products2`
--

DROP TABLE IF EXISTS `dat_products2`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dat_products2` (
  `product_serial` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `my_company_code` varchar(20) COLLATE utf8_unicode_ci NOT NULL,
  `utsumi_code` varchar(20) COLLATE utf8_unicode_ci DEFAULT NULL,
  `product_name` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `case_count` varchar(20) COLLATE utf8_unicode_ci DEFAULT NULL,
  `utsumi_price` varchar(50) COLLATE utf8_unicode_ci DEFAULT NULL,
  `jyanpure_price` varchar(50) COLLATE utf8_unicode_ci DEFAULT NULL,
  `forest_price` varchar(50) COLLATE utf8_unicode_ci DEFAULT NULL,
  `created_on` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_on` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`product_serial`),
  UNIQUE KEY `my_company_code` (`my_company_code`)
) ENGINE=InnoDB AUTO_INCREMENT=158 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `dat_products3`
--

DROP TABLE IF EXISTS `dat_products3`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dat_products3` (
  `jyanbure_code` varchar(40) COLLATE utf8_unicode_ci NOT NULL,
  `jyanbure_name` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `my_company_code` varchar(40) COLLATE utf8_unicode_ci DEFAULT NULL,
  `my_company_name` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `inner_count` varchar(40) COLLATE utf8_unicode_ci DEFAULT NULL,
  `last_price0` varchar(40) COLLATE utf8_unicode_ci DEFAULT NULL,
  `last_price1` varchar(40) COLLATE utf8_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`jyanbure_code`),
  UNIQUE KEY `my_company_code` (`my_company_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `dat_ranking`
--

DROP TABLE IF EXISTS `dat_ranking`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dat_ranking` (
  `rank_serial` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `rank_uuid` varchar(36) COLLATE utf8_unicode_ci NOT NULL,
  `staff_uuid` varchar(36) COLLATE utf8_unicode_ci NOT NULL,
  `client_rank` varchar(10) COLLATE utf8_unicode_ci NOT NULL,
  `slot_1_uuid` varchar(36) COLLATE utf8_unicode_ci NOT NULL,
  `slot_1_name` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `slot_2_uuid` varchar(36) COLLATE utf8_unicode_ci NOT NULL,
  `slot_2_name` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `slot_3_uuid` varchar(36) COLLATE utf8_unicode_ci NOT NULL,
  `slot_3_name` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `slot_4_uuid` varchar(36) COLLATE utf8_unicode_ci NOT NULL,
  `slot_4_name` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `slot_5_uuid` varchar(36) COLLATE utf8_unicode_ci NOT NULL,
  `slot_5_name` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `remove_slot` varchar(36) COLLATE utf8_unicode_ci NOT NULL DEFAULT '',
  `created_on` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_on` timestamp NULL DEFAULT NULL,
  `removed_on` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`rank_serial`),
  UNIQUE KEY `rank_uuid` (`rank_uuid`),
  UNIQUE KEY `slots` (`slot_1_uuid`,`slot_2_uuid`,`slot_3_uuid`,`slot_4_uuid`,`slot_5_uuid`,`remove_slot`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `dat_staff`
--

DROP TABLE IF EXISTS `dat_staff`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dat_staff` (
  `staff_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `staff_uuid` varchar(36) COLLATE utf8_unicode_ci NOT NULL,
  `staff_email` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `staff_name` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `staff_hash` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `staff_type` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `created_on` timestamp NOT NULL DEFAULT current_timestamp(),
  `removed_on` timestamp NULL DEFAULT NULL,
  `locked` tinyint(4) NOT NULL DEFAULT 0,
  PRIMARY KEY (`staff_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `log_forest_orders`
--

DROP TABLE IF EXISTS `log_forest_orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `log_forest_orders` (
  `log_serial` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `order_uuid` varchar(36) COLLATE utf8_unicode_ci NOT NULL,
  `user_uuid` varchar(36) COLLATE utf8_unicode_ci NOT NULL,
  `batch_uuid` varchar(36) COLLATE utf8_unicode_ci NOT NULL,
  `checked` tinyint(4) NOT NULL,
  `data` text COLLATE utf8_unicode_ci NOT NULL,
  `created_on` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`log_serial`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `log_jyanpure_orders`
--

DROP TABLE IF EXISTS `log_jyanpure_orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `log_jyanpure_orders` (
  `log_serial` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `order_uuid` varchar(36) COLLATE utf8_unicode_ci NOT NULL,
  `user_uuid` varchar(36) COLLATE utf8_unicode_ci NOT NULL,
  `batch_uuid` varchar(36) COLLATE utf8_unicode_ci NOT NULL,
  `checked` tinyint(4) NOT NULL,
  `data` text COLLATE utf8_unicode_ci NOT NULL,
  `created_on` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`log_serial`)
) ENGINE=InnoDB AUTO_INCREMENT=8043 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `log_login_attempts`
--

DROP TABLE IF EXISTS `log_login_attempts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `log_login_attempts` (
  `login_serial` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `username_input` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `username_match` tinyint(4) NOT NULL,
  `login_result` tinyint(4) NOT NULL,
  `session_id` varchar(40) COLLATE utf8_unicode_ci DEFAULT NULL,
  `reason` varchar(40) COLLATE utf8_unicode_ci DEFAULT NULL,
  `created_on` timestamp NOT NULL DEFAULT current_timestamp(),
  `remote_ip` varchar(50) COLLATE utf8_unicode_ci DEFAULT NULL,
  `real_ip` varchar(50) COLLATE utf8_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`login_serial`)
) ENGINE=InnoDB AUTO_INCREMENT=2039 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `log_one_time_pass`
--

DROP TABLE IF EXISTS `log_one_time_pass`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `log_one_time_pass` (
  `serial` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `one_time_pass` varchar(40) COLLATE utf8_unicode_ci DEFAULT NULL,
  `created_on` timestamp NOT NULL DEFAULT current_timestamp(),
  `alter_uuid` varchar(36) COLLATE utf8_unicode_ci DEFAULT NULL,
  `redeemed` tinyint(4) DEFAULT 0,
  PRIMARY KEY (`serial`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `log_products2`
--

DROP TABLE IF EXISTS `log_products2`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `log_products2` (
  `serial_log` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_uuid` varchar(36) COLLATE utf8_unicode_ci NOT NULL,
  `my_company_code` varchar(20) COLLATE utf8_unicode_ci NOT NULL,
  `action` varchar(20) COLLATE utf8_unicode_ci DEFAULT NULL,
  `old_value` text COLLATE utf8_unicode_ci DEFAULT NULL,
  `new_value` text COLLATE utf8_unicode_ci DEFAULT NULL,
  `logged_on` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`serial_log`)
) ENGINE=InnoDB AUTO_INCREMENT=347 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `log_utsumi_orders`
--

DROP TABLE IF EXISTS `log_utsumi_orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `log_utsumi_orders` (
  `log_serial` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `order_uuid` varchar(36) COLLATE utf8_unicode_ci NOT NULL,
  `user_uuid` varchar(36) COLLATE utf8_unicode_ci NOT NULL,
  `batch_uuid` varchar(36) COLLATE utf8_unicode_ci NOT NULL,
  `checked` tinyint(4) NOT NULL,
  `data` text COLLATE utf8_unicode_ci NOT NULL,
  `created_on` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`log_serial`)
) ENGINE=InnoDB AUTO_INCREMENT=3111 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2022-12-29 13:17:36

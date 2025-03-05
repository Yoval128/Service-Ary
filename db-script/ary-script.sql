/*
SQLyog Community v13.3.0 (64 bit)
MySQL - 10.4.32-MariaDB : Database - ary
*********************************************************************
*/

/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
CREATE DATABASE /*!32312 IF NOT EXISTS*/`ary` /*!40100 DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci */;

USE `ary`;

/*Table structure for table `accesos` */

DROP TABLE IF EXISTS `accesos`;

CREATE TABLE `accesos` (
  `ID_Acceso` int(11) NOT NULL AUTO_INCREMENT,
  `ID_Usuario` int(11) DEFAULT NULL,
  `Fecha_Hora` datetime DEFAULT current_timestamp(),
  `Tipo_Acceso` enum('Ingreso','Egreso') DEFAULT NULL,
  `Ubicacion` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`ID_Acceso`),
  KEY `ID_Usuario` (`ID_Usuario`),
  CONSTRAINT `accesos_ibfk_1` FOREIGN KEY (`ID_Usuario`) REFERENCES `usuarios` (`ID_Usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

/*Data for the table `accesos` */

insert  into `accesos`(`ID_Acceso`,`ID_Usuario`,`Fecha_Hora`,`Tipo_Acceso`,`Ubicacion`) values 
(1,36,'2025-03-04 23:38:34','Ingreso','Entrada Principal'),
(2,36,'2025-03-04 23:38:34','Egreso','Salida Principal'),
(3,127,'2025-03-04 23:38:34','Ingreso','Entrada Principal'),
(4,127,'2025-03-04 23:38:34','Egreso','Salida Principal'),
(5,128,'2025-03-04 23:38:34','Ingreso','Entrada Secundaria'),
(6,128,'2025-03-04 23:38:34','Egreso','Salida Secundaria'),
(7,133,'2025-03-04 23:38:34','Ingreso','Entrada Principal'),
(8,133,'2025-03-04 23:38:34','Egreso','Salida Principal'),
(9,36,'2025-03-04 23:38:34','Ingreso','Entrada Principal'),
(10,36,'2025-03-04 23:38:34','Egreso','Salida Principal'),
(11,127,'2025-03-04 23:38:34','Ingreso','Entrada Principal'),
(12,127,'2025-03-04 23:38:34','Egreso','Salida Principal'),
(13,128,'2025-03-04 23:38:34','Ingreso','Entrada Secundaria'),
(14,128,'2025-03-04 23:38:34','Egreso','Salida Secundaria'),
(15,133,'2025-03-04 23:38:34','Ingreso','Entrada Principal'),
(16,133,'2025-03-04 23:38:34','Egreso','Salida Principal'),
(17,36,'2025-03-04 23:38:34','Ingreso','Entrada Principal'),
(18,36,'2025-03-04 23:38:34','Egreso','Salida Principal'),
(19,127,'2025-03-04 23:38:34','Ingreso','Entrada Principal'),
(20,127,'2025-03-04 23:38:34','Egreso','Salida Principal');

/*Table structure for table `administradores` */

DROP TABLE IF EXISTS `administradores`;

CREATE TABLE `administradores` (
  `ID_Admin` int(11) NOT NULL AUTO_INCREMENT,
  `ID_Usuario` int(11) DEFAULT NULL,
  `Nivel_Permiso` enum('Básico','Medio','Avanzado') DEFAULT NULL,
  PRIMARY KEY (`ID_Admin`),
  UNIQUE KEY `ID_Usuario` (`ID_Usuario`),
  CONSTRAINT `administradores_ibfk_1` FOREIGN KEY (`ID_Usuario`) REFERENCES `usuarios` (`ID_Usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

/*Data for the table `administradores` */

insert  into `administradores`(`ID_Admin`,`ID_Usuario`,`Nivel_Permiso`) values 
(1,128,'Medio');

/*Table structure for table `documentos` */

DROP TABLE IF EXISTS `documentos`;

CREATE TABLE `documentos` (
  `ID_Documento` int(11) NOT NULL AUTO_INCREMENT,
  `Nombre_Documento` varchar(255) DEFAULT NULL,
  `Tipo_Documento` varchar(100) DEFAULT NULL,
  `Ubicacion` varchar(255) DEFAULT NULL,
  `Estado` enum('Disponible','Prestado') DEFAULT NULL,
  `ID_Etiqueta_RFID` int(11) DEFAULT NULL,
  PRIMARY KEY (`ID_Documento`),
  UNIQUE KEY `ID_Etiqueta_RFID` (`ID_Etiqueta_RFID`),
  CONSTRAINT `documentos_ibfk_1` FOREIGN KEY (`ID_Etiqueta_RFID`) REFERENCES `etiquetas_rfid` (`ID_Etiqueta_RFID`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

/*Data for the table `documentos` */

insert  into `documentos`(`ID_Documento`,`Nombre_Documento`,`Tipo_Documento`,`Ubicacion`,`Estado`,`ID_Etiqueta_RFID`) values 
(8,'Cara','Perspmal','A2','Disponible',3);

/*Table structure for table `etiquetas_rfid` */

DROP TABLE IF EXISTS `etiquetas_rfid`;

CREATE TABLE `etiquetas_rfid` (
  `ID_Etiqueta_RFID` int(11) NOT NULL AUTO_INCREMENT,
  `Codigo_RFID` varchar(50) NOT NULL,
  `Estado` enum('Activo','Inactivo') DEFAULT NULL,
  PRIMARY KEY (`ID_Etiqueta_RFID`),
  UNIQUE KEY `Codigo_RFID` (`Codigo_RFID`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

/*Data for the table `etiquetas_rfid` */

insert  into `etiquetas_rfid`(`ID_Etiqueta_RFID`,`Codigo_RFID`,`Estado`) values 
(1,'1234','Activo'),
(3,'011','Activo'),
(4,'012','Inactivo'),
(5,'001','Activo'),
(6,'002','Activo');

/*Table structure for table `movimientos_documentos` */

DROP TABLE IF EXISTS `movimientos_documentos`;

CREATE TABLE `movimientos_documentos` (
  `ID_Movimiento` int(11) NOT NULL AUTO_INCREMENT,
  `ID_Documento` int(11) DEFAULT NULL,
  `ID_Usuario` int(11) DEFAULT NULL,
  `Fecha_Hora_Salida` datetime DEFAULT current_timestamp(),
  `Fecha_Hora_Entrada` datetime DEFAULT NULL,
  `Estado` enum('En préstamo','Devuelto') DEFAULT NULL,
  PRIMARY KEY (`ID_Movimiento`),
  KEY `ID_Documento` (`ID_Documento`),
  KEY `ID_Usuario` (`ID_Usuario`),
  CONSTRAINT `movimientos_documentos_ibfk_1` FOREIGN KEY (`ID_Documento`) REFERENCES `documentos` (`ID_Documento`),
  CONSTRAINT `movimientos_documentos_ibfk_2` FOREIGN KEY (`ID_Usuario`) REFERENCES `usuarios` (`ID_Usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

/*Data for the table `movimientos_documentos` */

insert  into `movimientos_documentos`(`ID_Movimiento`,`ID_Documento`,`ID_Usuario`,`Fecha_Hora_Salida`,`Fecha_Hora_Entrada`,`Estado`) values 
(1,8,36,'2025-03-05 02:44:54',NULL,'En préstamo');

/*Table structure for table `tarjetas_rfid` */

DROP TABLE IF EXISTS `tarjetas_rfid`;

CREATE TABLE `tarjetas_rfid` (
  `ID_Tarjeta_RFID` int(11) NOT NULL AUTO_INCREMENT,
  `Codigo_RFID` varchar(50) NOT NULL,
  `Estado` enum('Activo','Inactivo') DEFAULT NULL,
  PRIMARY KEY (`ID_Tarjeta_RFID`),
  UNIQUE KEY `Codigo_RFID` (`Codigo_RFID`)
) ENGINE=InnoDB AUTO_INCREMENT=102 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

/*Data for the table `tarjetas_rfid` */

insert  into `tarjetas_rfid`(`ID_Tarjeta_RFID`,`Codigo_RFID`,`Estado`) values 
(1,'RFID001','Inactivo'),
(2,'RFID002','Activo'),
(3,'RFID003','Inactivo'),
(4,'RFID004','Activo'),
(5,'RFID005','Inactivo'),
(6,'RFID006','Activo'),
(7,'RFID007','Inactivo'),
(8,'RFID008','Activo'),
(9,'RFID009','Inactivo'),
(10,'RFID010','Activo'),
(11,'RFID011','Inactivo'),
(12,'RFID012','Activo'),
(13,'RFID013','Inactivo'),
(14,'RFID014','Activo'),
(15,'RFID015','Inactivo'),
(16,'RFID016','Activo'),
(17,'RFID017','Inactivo'),
(18,'RFID018','Activo'),
(19,'RFID019','Inactivo'),
(20,'RFID020','Activo'),
(21,'RFID021','Inactivo'),
(22,'RFID022','Activo'),
(23,'RFID023','Inactivo'),
(24,'RFID024','Activo'),
(25,'RFID025','Inactivo'),
(26,'RFID026','Activo'),
(27,'RFID027','Inactivo'),
(28,'RFID028','Activo'),
(29,'RFID029','Inactivo'),
(30,'RFID030','Activo'),
(31,'RFID031','Inactivo'),
(32,'RFID032','Activo'),
(33,'RFID033','Inactivo'),
(34,'RFID034','Activo'),
(35,'RFID035','Inactivo'),
(36,'RFID036','Activo'),
(37,'RFID037','Inactivo'),
(38,'RFID038','Activo'),
(39,'RFID039','Inactivo'),
(40,'RFID040','Activo'),
(41,'RFID041','Inactivo'),
(42,'RFID042','Activo'),
(43,'RFID043','Inactivo'),
(44,'RFID044','Activo'),
(45,'RFID045','Inactivo'),
(46,'RFID046','Activo'),
(47,'RFID047','Inactivo'),
(48,'RFID048','Activo'),
(49,'RFID049','Inactivo'),
(50,'RFID050','Activo'),
(51,'RFID051','Activo'),
(52,'RFID052','Inactivo'),
(53,'RFID053','Activo'),
(54,'RFID054','Inactivo'),
(55,'RFID055','Activo'),
(56,'RFID056','Inactivo'),
(57,'RFID057','Activo'),
(58,'RFID058','Inactivo'),
(59,'RFID059','Activo'),
(60,'RFID060','Inactivo'),
(61,'RFID061','Activo'),
(62,'RFID062','Inactivo'),
(63,'RFID063','Activo'),
(64,'RFID064','Inactivo'),
(65,'RFID065','Activo'),
(66,'RFID066','Inactivo'),
(67,'RFID067','Activo'),
(68,'RFID068','Inactivo'),
(69,'RFID069','Activo'),
(70,'RFID070','Inactivo'),
(71,'RFID071','Activo'),
(72,'RFID072','Inactivo'),
(73,'RFID073','Activo'),
(74,'RFID074','Inactivo'),
(75,'RFID075','Activo'),
(76,'RFID076','Inactivo'),
(77,'RFID077','Activo'),
(78,'RFID078','Inactivo'),
(79,'RFID079','Activo'),
(80,'RFID080','Inactivo'),
(81,'RFID081','Activo'),
(82,'RFID082','Inactivo'),
(83,'RFID083','Activo'),
(84,'RFID084','Inactivo'),
(85,'RFID085','Activo'),
(86,'RFID086','Inactivo'),
(87,'RFID087','Activo'),
(88,'RFID088','Inactivo'),
(89,'RFID089','Activo'),
(90,'RFID090','Inactivo'),
(91,'RFID091','Activo'),
(92,'RFID092','Inactivo'),
(93,'RFID093','Activo'),
(94,'RFID094','Inactivo'),
(95,'RFID095','Activo'),
(96,'RFID096','Inactivo'),
(97,'RFID097','Activo'),
(98,'RFID098','Inactivo'),
(99,'RFID099','Activo'),
(100,'RFID100','Inactivo');

/*Table structure for table `usuarios` */

DROP TABLE IF EXISTS `usuarios`;

CREATE TABLE `usuarios` (
  `ID_Usuario` int(11) NOT NULL AUTO_INCREMENT,
  `Nombre` varchar(100) DEFAULT NULL,
  `Apellido` varchar(100) DEFAULT NULL,
  `Cargo` varchar(100) DEFAULT NULL,
  `Correo` varchar(150) DEFAULT NULL,
  `Contraseña` varchar(255) DEFAULT NULL,
  `Telefono` varchar(20) DEFAULT NULL,
  `ID_Tarjeta_RFID` int(11) DEFAULT NULL,
  PRIMARY KEY (`ID_Usuario`),
  UNIQUE KEY `Correo` (`Correo`),
  UNIQUE KEY `ID_Tarjeta_RFID` (`ID_Tarjeta_RFID`),
  CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`ID_Tarjeta_RFID`) REFERENCES `tarjetas_rfid` (`ID_Tarjeta_RFID`)
) ENGINE=InnoDB AUTO_INCREMENT=134 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

/*Data for the table `usuarios` */

insert  into `usuarios`(`ID_Usuario`,`Nombre`,`Apellido`,`Cargo`,`Correo`,`Contraseña`,`Telefono`,`ID_Tarjeta_RFID`) values 
(36,'Omar','Yoval Aviles','administrador','yovalaviles812@gmail.com','$2b$10$oC05abMxRQgILJwMP0SnmOWNpZmZg3hMnOrMSf7VFwYVY7eUs351u','1234567890',1),
(127,'Carlos Pérez','Gonzales','administrador','carlos.perez@empresa.com','Abc12345','1234556',2),
(128,'Ana','Gómez Perez','empleado','ana.gomez@empresa.com','Klm67890','1234556',3),
(133,'Carolina','Jimenez Ocampo','empleado','JImenezOcampo@gmail.com','$2b$10$MNO1qsqVraA/SnyscuiVS.mD9xpyeKiNIo.jzv.ekMrzb/Aj/dlze','21345678',8);

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

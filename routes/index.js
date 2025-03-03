const express = require("express");
const router = express.Router();

// Importa las rutas individuales
const authRoutes = require("./auth");
const usersRoutes = require("./users");
const uploadsRoutes = require("./uploads.js")
// const gestionRoutes = require("./gestion");
// const documentsRoutes = require("./documents");
// const accessRoutes = require("./access");
// const archiversRoutes = require("./archivers");
const rfidCardsRoutes = require("./rfidCards.js");

// Usa las rutas
router.use("/auth", authRoutes);
router.use("/users", usersRoutes);
router.use("/uploads", uploadsRoutes);
// router.use("/gestion", gestionRoutes);
// router.use("/documents", documentsRoutes);
// router.use('/access', accessRoutes);
// router.use('/archivers', archiversRoutes);
router.use('/rfid-cards', rfidCardsRoutes);

module.exports = router;

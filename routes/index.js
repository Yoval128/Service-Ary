const express = require("express");
const router = express.Router();


// Importa las rutas individuales
const pingRoutes = require("./ping")
const authRoutes = require("./auth");
const usersRoutes = require("./users");
const uploadsRoutes = require("./uploads.js");
const documentsRoutes = require("./documents");
const accessRoutes = require("./access.js");
const archiversRoutes = require("./archivers.js");
const rfidCardsRoutes = require("./rfidCards.js");
const rfidTagsRoutes = require("./rfidTags.js");
const administratorsRoutes = require("./administrators.js");
const documentMovementsRoutes = require("./documentMovements.js");

// Usa las rutas
router.use("/ping", pingRoutes);
router.use("/auth", authRoutes);
router.use("/users", usersRoutes);
router.use("/uploads", uploadsRoutes);
router.use("/rfidTags", rfidTagsRoutes);
router.use("/documents", documentsRoutes);
router.use("/access", accessRoutes);
router.use("/archivers", archiversRoutes);
router.use("/rfidCards", rfidCardsRoutes);
router.use("/administrators", administratorsRoutes);
router.use("/documentMovements", documentMovementsRoutes);

module.exports = router;

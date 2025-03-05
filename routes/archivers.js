const express = require("express");
const connection = require("../db/connection");
const router = express.Router();

// 📌 Ruta de prueba
router.get("/", (req, res) => {
    res.send("Ruta de Archiveros funcionando");
  });

  
module.exports = router;
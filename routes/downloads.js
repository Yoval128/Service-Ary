const express = require("express");
const path = require("path"); // Asegúrate de importar path
const router = express.Router();

// 📌 Ruta de prueba
router.get("/", (req, res) => {
  res.send("Ruta de descargas funcionando");
});

// ✅ Ruta para descargar el archivo Excel
router.get("/excelTemplates/Usuarios.xlsx", (req, res) => { 
    const filePath = path.join(__dirname, "..", "uploads", "excelTemplates", "Usuarios.xlsx"); // Corregir la ruta

    res.download(filePath, "Usuarios.xlsx", (err) => {
        if (err) {
            console.error("Error al enviar el archivo:", err);
            res.status(500).send("Error al enviar el archivo");
        }
    });
});

module.exports = router;

const express = require("express");
const connection = require("../db/connection");
const router = express.Router();

console.log("Rutas de accesos");
// 📌 Ruta de prueba
router.get("/", (req, res) => {
  res.send("Ruta de Accesos funcionando");
});

// Ruta para listar accesos con detalles de usuarios
router.get("/list-access", (req, res) => {
  const query = `
          SELECT a.ID_Acceso, a.Fecha_Hora, a.Tipo_Acceso, a.Ubicacion, 
                 u.Nombre, u.Apellido, u.Cargo, u.Correo
          FROM accesos a
          LEFT JOIN usuarios u ON a.ID_Usuario = u.ID_Usuario
          ORDER BY a.Fecha_Hora DESC;
      `;

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error al obtener los accesos:", err);
      return res.status(500).json({ error: "Error al obtener los accesos." });
    }

    res.status(200).json(results);
  });
});

// 📌 Obtener una Acceso por ID
router.get("/tag-rfid/:id", (req, res) => {
  const {id} = req.params;

  connection.query(
      "SELECT * FROM accesos WHERE ID_Acceso = ?",
      [id],
      (err, results) => {
          if (err) {
              console.error("Error al obtener el acceso:", err);
              res.status(500).json({error: "Error al obtener el acceso"});
              return;
          }

          if (results.length === 0) {
              return res.status(404).json({error: "Acceso no encontrada"});
          }

          res.status(200).json(results[0]);
      }
  );
});

module.exports = router;

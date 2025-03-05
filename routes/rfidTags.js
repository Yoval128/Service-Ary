const express = require("express");
const connection = require("../db/connection");
const router = express.Router();

// 📌 Ruta de prueba
router.get("/", (req, res) => {
  res.send("Ruta de etiquetas Rfid funcionando");
});

// 📌 Obtener todas las Etiquetas RFID
router.get("/tags-list", (req, res) => {
  connection.query("SELECT * FROM etiquetas_rfid", (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// 📌 Obtener una etiqueta RFID por ID
router.get("/tag-rfid/:id", (req, res) => {
  const {id} = req.params;

  connection.query(
      "SELECT * FROM etiquetas_rfid WHERE ID_Etiqueta_RFID = ?",
      [id],
      (err, results) => {
          if (err) {
              console.error("Error al obtener la etiqueta RFID:", err);
              res.status(500).json({error: "Error al obtener la etiqueta RFID"});
              return;
          }

          if (results.length === 0) {
              return res.status(404).json({error: "Etiqueta RFID no encontrada"});
          }

          res.status(200).json(results[0]);
      }
  );
});


// 📌 Registrar Etiquetas RFID
router.post("/register-tags", (req, res) => {
  const { Codigo_RFID, Estado } = req.body;

  if (!Codigo_RFID || !Estado) {
    return res
      .status(400)
      .json({ error: "Código RFID y Estado son necesarios." });
  }

  connection.query(
    "INSERT INTO etiquetas_rfid (Codigo_RFID, Estado) VALUES (?, ?)",
    [Codigo_RFID, Estado],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res
        .status(201)
        .json({
          message: "Etiqueta RFID registrada exitosamente",
          id: result.insertId,
        });
    }
  );
});

// 📌 Actualizar una Etiqueta RFID
router.put("/update-tags/:id", (req, res) => {
  const { id } = req.params;
  const { Estado } = req.body;

  if (!Estado) {
    return res
      .status(400)
      .json({ error: "Estado es necesario para actualizar." });
  }

  connection.query(
    "UPDATE etiquetas_rfid SET Estado = ? WHERE ID_Etiqueta_RFID = ?",
    [Estado, id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Etiqueta RFID no encontrada." });
      }
      res.json({ message: "Etiqueta RFID actualizada exitosamente" });
    }
  );
});

// 📌 Eliminar una Etiqueta RFID
router.delete("/delete-tag/:id", (req, res) => {
  const { id } = req.params;

  connection.query(
    "DELETE FROM etiquetas_rfid WHERE ID_Etiqueta_RFID = ?",
    [id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Etiqueta RFID no encontrada." });
      }
      res.json({ message: "Etiqueta RFID eliminada exitosamente" });
    }
  );
});

// 📌 Obtener todas las Etiquetas RFID Disponibles
router.get("/tags-list-disponible", (req, res) => {
  connection.query(
    "SELECT * FROM etiquetas_rfid WHERE Estado = 'Activo'  AND ID_Etiqueta_RFID NOT IN (SELECT ID_Etiqueta_RFID FROM documentos WHERE ID_Etiqueta_RFID IS NOT NULL);",
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(results);
    }
  );
});

module.exports = router;

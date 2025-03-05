const express = require("express");
const { body, param, validationResult } = require("express-validator");
const connection = require("../db/connection");

const router = express.Router();

// ✅ Ruta de prueba
router.get("/", (req, res) => {
  res.send("Ruta de DocumentMovements funcionando");
});

// 📌 Obtener todos los movimientos de documentos
router.get("/movements-list", (req, res) => {
  connection.query("SELECT * FROM movimientos_documentos", (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// 📌 Obtener un movimiento de documento por ID
router.get("/movement/:id", (req, res) => {
  const { id } = req.params;

  connection.query(
    "SELECT * FROM movimientos_documentos WHERE ID_Movimiento = ?",
    [id],
    (err, results) => {
      if (err) {
        console.error("Error al obtener el movimiento de documento:", err);
        return res.status(500).json({ error: "Error al obtener el movimiento" });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: "Movimiento no encontrado" });
      }

      res.status(200).json(results[0]);
    }
  );
});

// 📌 Registrar un movimiento de documento
router.post("/register-movement", [
  body("ID_Documento").isInt().withMessage("El ID del documento debe ser un número entero."),
  body("ID_Usuario").isInt().withMessage("El ID del usuario debe ser un número entero."),
  body("Estado").isIn(['En préstamo', 'Devuelto']).withMessage("El estado debe ser 'En préstamo' o 'Devuelto'."),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { ID_Documento, ID_Usuario, Estado } = req.body;

  connection.query(
    "INSERT INTO movimientos_documentos (ID_Documento, ID_Usuario, Estado) VALUES (?, ?, ?)",
    [ID_Documento, ID_Usuario, Estado],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({
        message: "Movimiento de documento registrado exitosamente",
        id: result.insertId,
      });
    }
  );
});

// 📌 Actualizar el estado de un movimiento de documento
router.put("/update-movement/:id", [
  param("id").isInt().withMessage("El ID del movimiento debe ser un número entero."),
  body("Estado").isIn(['En préstamo', 'Devuelto']).withMessage("El estado debe ser 'En préstamo' o 'Devuelto'."),
], (req, res) => {
  const { id } = req.params;
  const { Estado } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  connection.query(
    "UPDATE movimientos_documentos SET Estado = ? WHERE ID_Movimiento = ?",
    [Estado, id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Movimiento de documento no encontrado." });
      }
      res.json({ message: "Estado del movimiento de documento actualizado exitosamente" });
    }
  );
});

// 📌 Eliminar un movimiento de documento
router.delete("/delete-movement/:id", (req, res) => {
  const { id } = req.params;

  connection.query(
    "DELETE FROM movimientos_documentos WHERE ID_Movimiento = ?",
    [id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Movimiento de documento no encontrado." });
      }
      res.json({ message: "Movimiento de documento eliminado exitosamente" });
    }
  );
});

module.exports = router;

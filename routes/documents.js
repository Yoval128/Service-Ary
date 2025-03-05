const express = require("express");
const { body, param, validationResult } = require("express-validator");
const connection = require("../db/connection");

const router = express.Router();

// ✅ Ruta de prueba
router.get("/", (req, res) => {
  res.send("Ruta de Documentos funcionando");
});

// ✅ Obtener la lista de todos los documentos
router.get("/list-documents", (req, res) => {
  const query = "SELECT * FROM documentos";

  connection.query(query, (err, result) => {
    if (err) return res.status(500).json({ error: "Error al obtener la lista de documentos" });
    res.status(200).json(result);
  });
});

// ✅ Obtener un documento por ID con validación
router.get("/document/:id", 
  param("id").isInt().withMessage("El ID debe ser un número entero"), 
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const query = "SELECT * FROM documentos WHERE ID_Documento = ?";

    connection.query(query, [id], (err, result) => {
      if (err) return res.status(500).json({ error: "Error al obtener el documento" });
      if (result.length === 0) return res.status(404).json({ message: "Documento no encontrado" });
      res.status(200).json(result[0]);
    });
  }
);

// ✅ Registrar un Documento con validaciones
router.post("/register-document", [
  body("Nombre_Documento").notEmpty().withMessage("El nombre es obligatorio"),
  body("Tipo_Documento").notEmpty().withMessage("El tipo de documento es obligatorio"),
  body("Ubicacion").notEmpty().withMessage("La ubicación es obligatoria"),
  body("Estado").isIn(["Disponible", "Prestado"]).withMessage("Estado inválido"),
  body("ID_Etiqueta_RFID").optional().isInt().withMessage("El ID de la etiqueta RFID debe ser un número")
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { Nombre_Documento, Tipo_Documento, Ubicacion, Estado, ID_Etiqueta_RFID } = req.body;

  const query = `INSERT INTO documentos (Nombre_Documento, Tipo_Documento, Ubicacion, Estado, ID_Etiqueta_RFID) VALUES (?, ?, ?, ?, ?)`;

  connection.query(query, [Nombre_Documento, Tipo_Documento, Ubicacion, Estado, ID_Etiqueta_RFID], (err, result) => {
    if (err) return res.status(500).json({ error: "Error al registrar el documento" });
    res.status(201).json({ message: "Documento registrado exitosamente", ID_Documento: result.insertId });
  });
});

// ✅ Actualizar un Documento con validaciones
router.put("/update-document/:id", [
  param("id").isInt().withMessage("El ID debe ser un número entero"),
  body("Nombre_Documento").optional().notEmpty().withMessage("El nombre no puede estar vacío"),
  body("Tipo_Documento").optional().notEmpty().withMessage("El tipo no puede estar vacío"),
  body("Ubicacion").optional().notEmpty().withMessage("La ubicación no puede estar vacía"),
  body("Estado").optional().isIn(["Disponible", "Prestado"]).withMessage("Estado inválido"),
  body("ID_Etiqueta_RFID").optional().isInt().withMessage("El ID de la etiqueta RFID debe ser un número")
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { Nombre_Documento, Tipo_Documento, Ubicacion, Estado, ID_Etiqueta_RFID } = req.body;

  // Comprobamos si el documento existe antes de actualizar
  const checkQuery = "SELECT * FROM documentos WHERE ID_Documento = ?";
  connection.query(checkQuery, [id], (err, result) => {
    if (err) return res.status(500).json({ error: "Error al verificar el documento" });
    if (result.length === 0) return res.status(404).json({ message: "Documento no encontrado" });

    // Construimos la consulta de actualización de forma dinámica
    let updateQuery = `UPDATE documentos SET Nombre_Documento = ?, Tipo_Documento = ?, Ubicacion = ?, Estado = ?`;
    let queryParams = [Nombre_Documento, Tipo_Documento, Ubicacion, Estado];

    // Si ID_Etiqueta_RFID fue enviado, lo añadimos a la consulta
    if (ID_Etiqueta_RFID !== undefined) {
      updateQuery += ", ID_Etiqueta_RFID = ?";
      queryParams.push(ID_Etiqueta_RFID);
    }

    updateQuery += " WHERE ID_Documento = ?";
    queryParams.push(id);

    // Ejecutamos la consulta de actualización
    connection.query(updateQuery, queryParams, (err, result) => {
      if (err) return res.status(500).json({ error: "Error al actualizar el documento" });
      res.status(200).json({ message: "Documento actualizado exitosamente" });
    });
  });
});


// ✅ Eliminar un Documento con validación
router.delete("/delete-document/:id", 
  param("id").isInt().withMessage("El ID debe ser un número entero"), 
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const query = "DELETE FROM documentos WHERE ID_Documento = ?";

    connection.query(query, [id], (err, result) => {
      if (err) return res.status(500).json({ error: "Error al eliminar el documento" });
      if (result.affectedRows === 0) return res.status(404).json({ message: "Documento no encontrado" });
      res.status(200).json({ message: "Documento eliminado exitosamente" });
    });
  }
);

module.exports = router;

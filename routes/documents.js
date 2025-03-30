const express = require("express");
const connection = require("../db/connection");
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { body, param, validationResult } = require('express-validator');

// Configuración de Multer para subir archivos PDF
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/documents/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos PDF'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5 // Límite de 5MB
  }
});

// Ruta de prueba
router.get("/", (req, res) => {
  res.send("Ruta de Documentos funcionando");
});

// Obtener la lista de todos los documentos
router.get("/list-documents", (req, res) => {
  const query = "SELECT * FROM documentos";

  connection.query(query, (err, result) => {
    if (err)
      return res
        .status(500)
        .json({ error: "Error al obtener la lista de documentos" });
    res.status(200).json(result);
  });
});

// Obtener un documento por ID con validación
router.get(
  "/document/:id",
  param("id").isInt().withMessage("El ID debe ser un número entero"),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const query = "SELECT * FROM documentos WHERE ID_Documento = ?";

    connection.query(query, [id], (err, result) => {
      if (err)
        return res.status(500).json({ error: "Error al obtener el documento" });
      if (result.length === 0)
        return res.status(404).json({ message: "Documento no encontrado" });
      res.status(200).json(result[0]);
    });
  }
);

// Registrar un Documento con validaciones
router.post("/register-document",
  upload.single("file"),
  [
    body("Nombre_Documento").notEmpty().withMessage("El nombre es obligatorio"),
    body("Tipo_Documento")
      .notEmpty()
      .withMessage("El tipo de documento es obligatorio"),
    body("Ubicacion").notEmpty().withMessage("La ubicación es obligatoria"),
    body("Estado")
      .isIn(["Disponible", "Prestado"])
      .withMessage("Estado inválido"),
    body("ID_Etiqueta_RFID")
      .optional()
      .isInt()
      .withMessage("El ID de la etiqueta RFID debe ser un número"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Si hay errores de validación, elimina el archivo subido si existe
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ errors: errors.array() });
    }

    // Verifica que se haya subido un archivo
    if (!req.file) {
      return res.status(400).json({ error: "Debe subir un archivo PDF" });
    }

    const {
      Nombre_Documento,
      Tipo_Documento,
      Ubicacion,
      Estado,
      ID_Etiqueta_RFID,
    } = req.body;

    const filePath = `uploads/documents/${req.file.filename}`;

    const query = `INSERT INTO documentos (Nombre_Documento, Tipo_Documento, Ubicacion, filePath, Estado, ID_Etiqueta_RFID) VALUES (?, ?, ?, ?, ?, ?)`;

    connection.query(
      query,
      [Nombre_Documento, Tipo_Documento, Ubicacion, filePath, Estado, ID_Etiqueta_RFID],
      (err, result) => {
        if (err) {
          // Si hay error en la base de datos, elimina el archivo subido
          fs.unlinkSync(req.file.path);
          return res.status(500).json({ error: "Error al registrar el documento" });
        }

        res.status(201).json({
          message: "Documento registrado exitosamente",
          ID_Documento: result.insertId,
          filePath,
        });
      }
    );
  }
);

// Actualizar un Documento con validaciones
router.put(
  "/update-document/:id",
  upload.single("file"),  // Aquí se usa el middleware de multer para manejar el archivo
  [
    param("id").isInt().withMessage("El ID debe ser un número entero"),
    body("Nombre_Documento")
      .optional()
      .notEmpty()
      .withMessage("El nombre no puede estar vacío"),
    body("Tipo_Documento")
      .optional()
      .notEmpty()
      .withMessage("El tipo no puede estar vacío"),
    body("Ubicacion")
      .optional()
      .notEmpty()
      .withMessage("La ubicación no puede estar vacía"),
    body("Estado")
      .optional()
      .isIn(["Disponible", "Prestado"])
      .withMessage("Estado inválido"),
    body("ID_Etiqueta_RFID")
      .optional()
      .isInt()
      .withMessage("El ID de la etiqueta RFID debe ser un número"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const {
      Nombre_Documento,
      Tipo_Documento,
      Ubicacion,
      Estado,
      ID_Etiqueta_RFID,
    } = req.body;

    // Verificamos si el documento existe antes de actualizar
    const checkQuery = "SELECT * FROM documentos WHERE ID_Documento = ?";
    connection.query(checkQuery, [id], (err, result) => {
      if (err)
        return res
          .status(500)
          .json({ error: "Error al verificar el documento" });
      if (result.length === 0)
        return res.status(404).json({ message: "Documento no encontrado" });

      // Si se ha subido un nuevo archivo, eliminamos el archivo antiguo
      let filePath = result[0].filePath;
      if (req.file) {
        // Eliminamos el archivo anterior
        fs.unlinkSync(filePath); // Esto eliminará el archivo previo en el servidor

        // Guardamos el nuevo archivo y generamos la nueva ruta
        filePath = `uploads/documents/${req.file.filename}`;
      }

      // Construimos la consulta de actualización de forma dinámica
      let updateQuery = `UPDATE documentos SET Nombre_Documento = ?, Tipo_Documento = ?, Ubicacion = ?, Estado = ?, filePath = ?`;
      let queryParams = [Nombre_Documento, Tipo_Documento, Ubicacion, Estado, filePath];

      // Si ID_Etiqueta_RFID fue enviado, lo añadimos a la consulta
      if (ID_Etiqueta_RFID !== undefined) {
        updateQuery += ", ID_Etiqueta_RFID = ?";
        queryParams.push(ID_Etiqueta_RFID);
      }

      updateQuery += " WHERE ID_Documento = ?";
      queryParams.push(id);

      // Ejecutamos la consulta de actualización
      connection.query(updateQuery, queryParams, (err, result) => {
        if (err)
          return res
            .status(500)
            .json({ error: "Error al actualizar el documento" });
        res.status(200).json({ message: "Documento actualizado exitosamente" });
      });
    });
  }
);



// Eliminar un Documento con validación
router.delete(
  "/delete-document/:id",
  param("id").isInt().withMessage("El ID debe ser un número entero"),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    
    // Primero obtenemos la información del documento para saber la ruta del archivo
    const getQuery = "SELECT filePath FROM documentos WHERE ID_Documento = ?";
    
    connection.query(getQuery, [id], (err, result) => {
      if (err) {
        return res.status(500).json({ error: "Error al obtener el documento" });
      }
      if (result.length === 0) {
        return res.status(404).json({ message: "Documento no encontrado" });
      }
      
      const filePath = result[0].filePath;
      
      // Eliminamos el registro de la base de datos
      const deleteQuery = "DELETE FROM documentos WHERE ID_Documento = ?";
      connection.query(deleteQuery, [id], (err, result) => {
        if (err) {
          return res.status(500).json({ error: "Error al eliminar el documento" });
        }
        if (result.affectedRows === 0) {
          return res.status(404).json({ message: "Documento no encontrado" });
        }
        
        // Si existe el archivo físico, lo eliminamos
        if (filePath) {
          const absolutePath = path.join(__dirname, '../', filePath);
          if (fs.existsSync(absolutePath)) {
            fs.unlinkSync(absolutePath);
          }
        }
        
        res.status(200).json({ message: "Documento eliminado exitosamente" });
      });
    });
  }
);

router.get("/total-documents", (req, res) => {
  connection.query(
    `SELECT COUNT(*) AS totalDocuments FROM documentos`,
    (err, results) => {
      if (err) {
        console.error("Error al obtener la cantidad de documentos:", err);
        res
          .status(500)
          .json({ error: "Error al obtener la cantidad de documentos" });
        return;
      }
      res.status(200).json({
        totalDocuments: results[0].totalDocuments,
      });
    }
  );
});

router.get("/download/:id", (req, res) => {
  const { id } = req.params;
  const query = "SELECT filePath FROM documentos WHERE ID_Documento = ?";

  connection.query(query, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Error al obtener el documento" });
    }
    if (result.length === 0 || !result[0].filePath) {
      return res.status(404).json({ message: "Documento no encontrado" });
    }

    const filePath = result[0].filePath;
    const absolutePath = path.join(__dirname, '../', filePath);

    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ message: "Archivo no encontrado" });
    }

    res.download(absolutePath);
  });
});

module.exports = router;

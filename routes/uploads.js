const express = require("express");
const multer = require("multer");
const xlsx = require("xlsx");
const connection = require("../db/connection");
const router = express.Router();

// 📌 Ruta de prueba
router.get("/", (req, res) => {
  res.send("Ruta de uploadsExcel funcionando");
});

// Configuración de multer para almacenar los archivos
const upload = multer({ dest: "uploads/" });

// Ruta para cargar el archivo Excel
router.post(
  "/upload-excel-usuarios",
  upload.single("file"),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No se ha cargado ningún archivo" });
    }

    try {
      const workbook = xlsx.readFile(req.file.path);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      const data = xlsx.utils.sheet_to_json(sheet);
      if (!data || data.length === 0) {
        return res
          .status(400)
          .json({ error: "El archivo no contiene datos válidos" });
      }

      let totalRegistros = 0;
      let subidos = 0;
      let errores = 0;

      for (const item of data) {
        totalRegistros++;
        const {
          Nombre,
          Apellido,
          Cargo,
          Correo,
          Contraseña,
          Telefono,
          ID_Tarjeta_RFID,
        } = item;

        if (
          !Nombre ||
          !Apellido ||
          !Correo ||
          !Contraseña ||
          !Telefono ||
          !ID_Tarjeta_RFID
        ) {
          errores++;
          continue;
        }

        try {
          const query =
            "INSERT INTO usuarios (Nombre, Apellido, Cargo, Correo, Contraseña, Telefono, ID_Tarjeta_RFID  ) VALUES (?, ?, ?, ?, ?, ?, ?)";
          const values = [Nombre, Apellido, Cargo, Correo, Contraseña, Telefono, ID_Tarjeta_RFID];

          await new Promise((resolve, reject) => {
            connection.query(query, values, (err, results) => {
              if (err) {
                return reject("Error al insertar un registro");
              }
              resolve(results);
            });
          });
          subidos++;
        } catch (error) {
          errores++;
        }
      }

      res.status(200).json({
        message: "Datos cargados correctamente",
        resultados: {
          totalRegistros,
          subidos,
          errores,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Hubo un error al procesar el archivo" });
    }
  }
);



module.exports = router;

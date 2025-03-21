const express = require("express");
const connection = require("../db/connection");
const router = express.Router();
const { serialPort, parser } = require("./serialPort"); // Importamos las configuraciones de serialPort.js
const moment = require("moment"); // 📌 Agregar para manejar fechas y horas

const accessHistory = []; // 📌 Lista para almacenar el historial de accesos

let lastRFID = "";

// Lógica para manejar la lectura de los datos del puerto serie
parser.on("data", async (data) => {
  data = data.trim(); // Elimina espacios en blanco o saltos de línea

  console.log("Datos recibidos:", data); // Verifica lo que se recibe

  if (!data.startsWith("{")) {
    console.warn("Datos ignorados (no es JSON):", data);
    return; // Ignora los mensajes que no son JSON
  }

  try {
    const jsonData = JSON.parse(data); // Parsea solo JSON válido
    if (jsonData.rfid) {
      const rfid = jsonData.rfid;
      const timestamp = moment().format("YYYY-MM-DD HH:mm:ss"); // Obtiene la hora actual

      // Guarda en el historial
      accessHistory.unshift({ rfid: rfid, time: timestamp });

      console.log(`Tarjeta RFID detectada: ${rfid} - Hora: ${timestamp}`);

      // Obtener el ID_Usuario asociado al RFID
      const ID_Usuario = await obtenerIdUsuarioPorRFID(rfid);

      if (ID_Usuario === null) {
        console.warn(`No se encontró un usuario asociado al RFID: ${rfid}`);
        return; // No se puede insertar el acceso sin un ID_Usuario válido
      }

      // Insertar el acceso en la base de datos
      const query = `
        INSERT INTO accesos (ID_Usuario, Fecha_Hora, Tipo_Acceso, Ubicacion)
        VALUES (?, ?, ?, ?);
      `;

      const Tipo_Acceso = 'Ingreso'; 
      const Ubicacion = 'Puerta Principal';

      connection.query(query, [ID_Usuario, timestamp, Tipo_Acceso, Ubicacion], (err, results) => {
        if (err) {
          console.error("Error al insertar el acceso:", err);
          return;
        }

        console.log("Acceso registrado en la base de datos:", results);
      });
    }
  } catch (error) {
    console.error("Error leyendo JSON:", error);
  }
});

// Función para obtener el ID_Usuario por RFID (debes implementarla según tu lógica)
async function obtenerIdUsuarioPorRFID(rfid) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT u.ID_Usuario
      FROM usuarios u
      JOIN tarjetas_rfid t ON u.ID_Tarjeta_RFID = t.ID_Tarjeta_RFID
      WHERE t.Codigo_RFID = ?;
    `;

    connection.query(query, [rfid], (err, results) => {
      if (err) {
        console.error("Error al consultar la base de datos:", err);
        return reject(err);
      }

      if (results.length === 0) {
        console.warn(`No se encontró un usuario asociado al RFID: ${rfid}`);
        return resolve(null); // No hay usuario asociado
      }

      // Devuelve el ID_Usuario
      resolve(results[0].ID_Usuario);
    });
  });
}

// 📌 Ruta de prueba
router.get("/", (req, res) => {
  res.send("Ruta de Accesos funcionando");
});

// Ruta para obtener el último RFID detectado
router.get("/historial-rfid", (req, res) => {
  res.json(accessHistory);
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
  const { id } = req.params;

  connection.query(
    "SELECT * FROM accesos WHERE ID_Acceso = ?",
    [id],
    (err, results) => {
      if (err) {
        console.error("Error al obtener el acceso:", err);
        res.status(500).json({ error: "Error al obtener el acceso" });
        return;
      }

      if (results.length === 0) {
        return res.status(404).json({ error: "Acceso no encontrada" });
      }

      res.status(200).json(results[0]);
    }
  );
});

module.exports = router;
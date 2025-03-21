const express = require("express");
const connection = require("../db/connection");
const router = express.Router();
const { SerialPort, ReadlineParser } = require("serialport");
const moment = require("moment"); // 📌 Agregar para manejar fechas y horas

const serialPort = new SerialPort({
  path: "COM3",
  baudRate: 9600,
});

const parser = serialPort.pipe(new ReadlineParser({ delimiter: "\n" }));

const accessHistory = []; // 📌 Lista para almacenar el historial de accesos

let lastRFID = "";

// Lógica para manejar la lectura de los datos del puerto serie

parser.on("data", (data) => {
  data = data.trim(); // 🛠 Elimina espacios en blanco o saltos de línea

  console.log("Datos recibidos:", data); // Verifica lo que se recibe

  if (!data.startsWith("{")) {
    console.warn("Datos ignorados (no es JSON):", data);
    return; // 🛑 Ignora los mensajes que no son JSON
  }

  try {
    const jsonData = JSON.parse(data); // ✅ Parsea solo JSON válido
    if (jsonData.rfid) {
      lastRFID = jsonData.rfid;
      const timestamp = moment().format("YYYY-MM-DD HH:mm:ss"); // 📌 Obtiene la hora de la laptop

      // 📌 Guarda en el historial
      accessHistory.unshift({ rfid: lastRFID, time: timestamp });

      console.log(`Tarjeta RFID detectada: ${lastRFID} - Hora: ${timestamp}`);
    }
  } catch (error) {
    console.error("Error leyendo JSON:", error);
  }
});

console.log("Rutas de accesos");
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

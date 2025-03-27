const express = require("express");
const connection = require("../db/connection");
const router = express.Router();



// 📌 Ruta de prueba
router.get("/", (req, res) => {
  res.send("Ruta de tarjetas RFID funcionando");
});

router.post("/", (req, res) => {
  const { Codigo_RFID } = req.body;
  
  if (!Codigo_RFID) {
      return res.status(400).json({ error: "Código RFID requerido" });
  }

  // Emitir el código RFID a todos los clientes conectados
  const io = req.app.get('io');
  io.emit('newRFID', { Codigo_RFID });
  
  res.status(200).json({ message: "Código RFID recibido" });
});

// 📌 Obtener todas las tarjetas RFID
router.get("/rfid-list", (req, res) => {
  connection.query("SELECT * FROM tarjetas_rfid", (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// 📌 Obtener tarjeta RFID por ID_Tarjeta_RFID
router.get("/rfid/:id", (req, res) => {
  const {id} = req.params;

  connection.query(
      "SELECT * FROM tarjetas_rfid WHERE ID_Tarjeta_RFID = ?",
      [id],
      (err, results) => {
          if (err) {
              console.error("Error al obtener la tarjeta RFID:", err);
              res.status(500).json({error: "Error al obtener la tarjeta RFID"});
              return;
          }

          if (results.length === 0) {
              return res.status(404).json({error: "Tarjeta RFID no encontrada"});
          }

          res.status(200).json(results[0]);
      }
  );
});


// 📌 Registrar una nueva tarjeta RFID
router.post("/register-rfid", (req, res) => {
  const { Codigo_RFID, Estado } = req.body;
  if (!Codigo_RFID || !Estado) {
    return res.status(400).json({ error: "Faltan datos requeridos" });
  }

  connection.query(
    "INSERT INTO tarjetas_rfid (Codigo_RFID, Estado) VALUES (?, ?)",
    [Codigo_RFID, Estado],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: "Tarjeta registrada", id: result.insertId });
    }
  );
});

// 📌 Actualizar el estado de una tarjeta RFID
router.put("/update-rfid/:id", (req, res) => {
  const { Estado } = req.body;
  const { id } = req.params;

  if (!Estado) {
    return res.status(400).json({ error: "El estado es requerido" });
  }

  connection.query(
    "UPDATE tarjetas_rfid SET Estado = ? WHERE ID_Tarjeta_RFID = ?",
    [Estado, id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: "Estado actualizado" });
    }
  );
});

// 📌 Eliminar una tarjeta RFID
router.delete("/delete-rfid/:id", (req, res) => {
  const { id } = req.params;

  connection.query(
    "DELETE FROM tarjetas_rfid WHERE ID_Tarjeta_RFID = ?",
    [id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: "Tarjeta eliminada" });
    }
  );
});

// 📌 Obtener todas las tarjetas RFID Disponibles
router.get("/rfid-list-disponible", (req, res) => {
  connection.query(
    "SELECT * FROM tarjetas_rfid WHERE Estado = 'Activo' AND ID_Tarjeta_RFID NOT IN (SELECT ID_Tarjeta_RFID FROM usuarios WHERE ID_Tarjeta_RFID IS NOT NULL)",
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(results);
    }
  );
});

// 📌 Obtener el número de rfidCards activos
router.get("/active-rfidCards", (req, res) => {
  connection.query(
    `
    SELECT 
      COUNT(CASE WHEN estado = 'activo' THEN 1 END) AS activeRfidCards,
      COUNT(CASE WHEN estado = 'inactivo' THEN 1 END) AS inactiveRfidCards
    FROM tarjetas_rfid
    `,
    (err, results) => {
      if (err) {
        console.error("Error al obtener la cantidad de tarjetas RFID:", err);
        res
          .status(500)
          .json({ error: "Error al obtener la cantidad de tarjetas RFID" });
        return;
      }

      res.status(200).json({
        activeRfidCards: results[0].activeRfidCards,
        inactiveRfidCards: results[0].inactiveRfidCards
      });
    }
  );
});

module.exports = router;

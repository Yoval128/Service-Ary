const express = require("express");
const connection = require("../db/connection");
const router = express.Router();

console.log("Rutas de accesos");
// 📌 Ruta de prueba
router.get("/", (req, res) => {
  res.send("Ruta de Accesos funcionando");
});

// Ruta para registrar acceso mediante tarjeta RFID
router.post("/register-access-rfid", (req, res) => {
  const { Codigo_RFID, Tipo_Acceso, Ubicacion } = req.body;

  // Validar campos requeridos
  if (!Codigo_RFID || !Tipo_Acceso || !Ubicacion) {
    return res.status(400).json({ error: "Faltan datos necesarios (Codigo_RFID, Tipo_Acceso, Ubicacion)" });
  }

  // Consulta para encontrar el usuario asociado a la tarjeta RFID
  const findUserQuery = `
    SELECT u.ID_Usuario, u.Nombre, u.Apellido, u.Cargo, t.Codigo_RFID 
    FROM usuarios u
    JOIN tarjetas_rfid t ON u.ID_Tarjeta_RFID = t.ID_Tarjeta_RFID
    WHERE t.Codigo_RFID = ? AND u.Estado = 'activo' AND t.Estado = 'Activo'
  `;

  connection.query(findUserQuery, [Codigo_RFID], (err, userResults) => {
    if (err) {
      console.error("Error al buscar usuario:", err);
      return res.status(500).json({ error: "Error al buscar usuario asociado a la tarjeta" });
    }

    if (userResults.length === 0) {
      return res.status(404).json({ 
        error: "Tarjeta no encontrada o no asociada a un usuario activo",
        Codigo_RFID: Codigo_RFID
      });
    }

    const usuario = userResults[0];
    
    // Registrar el acceso
    const registerQuery = `
      INSERT INTO accesos (ID_Usuario, Tipo_Acceso, Ubicacion)
      VALUES (?, ?, ?)
    `;

    connection.query(registerQuery, [usuario.ID_Usuario, Tipo_Acceso, Ubicacion], (err, result) => {
      if (err) {
        console.error("Error al registrar acceso:", err);
        return res.status(500).json({ error: "Error al registrar el acceso" });
      }

      // Respuesta con detalles del acceso y usuario
      res.status(201).json({
        message: "Acceso registrado correctamente",
        acceso: {
          ID_Acceso: result.insertId,
          Fecha_Hora: new Date().toISOString(),
          Tipo_Acceso,
          Ubicacion
        },
        usuario: {
          ID_Usuario: usuario.ID_Usuario,
          Nombre: usuario.Nombre,
          Apellido: usuario.Apellido,
          Cargo: usuario.Cargo,
          Codigo_RFID: usuario.Codigo_RFID
        }
      });
    });
  });
});


// Ruta para listar accesos con detalles completos
router.get("/list-access-detailed", (req, res) => {
  const query = `
    SELECT 
      a.ID_Acceso, 
      a.Fecha_Hora, 
      a.Tipo_Acceso, 
      a.Ubicacion,
      u.ID_Usuario,
      u.Nombre, 
      u.Apellido, 
      u.Cargo, 
      u.Correo,
      t.ID_Tarjeta_RFID,
      t.Codigo_RFID
    FROM accesos a
    LEFT JOIN usuarios u ON a.ID_Usuario = u.ID_Usuario
    LEFT JOIN tarjetas_rfid t ON u.ID_Tarjeta_RFID = t.ID_Tarjeta_RFID
    ORDER BY a.Fecha_Hora DESC
    LIMIT 100;  -- Limitar resultados para no sobrecargar
  `;

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error al obtener accesos:", err);
      return res.status(500).json({ error: "Error al obtener el historial de accesos" });
    }

    // Formatear fecha más legible
    const formattedResults = results.map(acceso => ({
      ...acceso,
      Fecha_Hora_Formateada: new Date(acceso.Fecha_Hora).toLocaleString()
    }));

    res.status(200).json(formattedResults);
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

// Obtener accesos por ID de usuario
router.get("/user-access/:userId", (req, res) => {
  const { userId } = req.params;

  const query = `
    SELECT 
      a.ID_Acceso,
      a.Fecha_Hora,
      a.Tipo_Acceso,
      a.Ubicacion,
      t.Codigo_RFID
    FROM accesos a
    LEFT JOIN usuarios u ON a.ID_Usuario = u.ID_Usuario
    LEFT JOIN tarjetas_rfid t ON u.ID_Tarjeta_RFID = t.ID_Tarjeta_RFID
    WHERE a.ID_Usuario = ?
    ORDER BY a.Fecha_Hora DESC
    LIMIT 50;
  `;

  connection.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Error al obtener accesos del usuario:", err);
      return res.status(500).json({ error: "Error al obtener historial del usuario" });
    }

    res.status(200).json(results);
  });
});

// Obtener últimos accesos por código RFID
router.get("/rfid-access/:codigoRFID", (req, res) => {
  const { codigoRFID } = req.params;

  const query = `
    SELECT 
      a.ID_Acceso,
      a.Fecha_Hora,
      a.Tipo_Acceso,
      a.Ubicacion,
      u.Nombre,
      u.Apellido,
      u.Cargo
    FROM accesos a
    JOIN usuarios u ON a.ID_Usuario = u.ID_Usuario
    JOIN tarjetas_rfid t ON u.ID_Tarjeta_RFID = t.ID_Tarjeta_RFID
    WHERE t.Codigo_RFID = ?
    ORDER BY a.Fecha_Hora DESC
    LIMIT 10;
  `;

  connection.query(query, [codigoRFID], (err, results) => {
    if (err) {
      console.error("Error al obtener accesos por RFID:", err);
      return res.status(500).json({ error: "Error al obtener historial de la tarjeta" });
    }

    res.status(200).json(results);
  });
});

module.exports = router;

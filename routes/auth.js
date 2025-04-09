const jwt = require("jsonwebtoken");
const express = require("express");
const router = express.Router();
const connection = require("../db/connection");
const bcrypt = require("bcryptjs");

console.log("Rutas de Auth");

// Ruta de prueba
router.get("/", (req, res) => {
  console.log("Se ingreso a la ruta index");
  res.send("Ruta de autenticación funcionando");
});

// Ruta de autenticación (Login)
router.post("/login", (req, res) => {
  const { correo, contrasena } = req.body;

  if (!correo || !contrasena) {
    return res
      .status(400)
      .json({ error: "Correo y contraseña son requeridos" });
  }

  connection.query(
    "SELECT * FROM usuarios WHERE Correo = ?",
    [correo],
    async (err, results) => {
      if (err) {
        console.error("Error en la consulta:", err);
        return res.status(500).json({ error: "Error en el servidor" });
      }

      if (results.length === 0) {
        console.log("No se encontró el usuario con correo:", correo);
        return res
          .status(401)
          .json({ error: "Correo o contraseña incorrectos" });
      }

      const usuario = results[0];

      console.log("Contraseña ingresada:", contrasena);
      console.log("Contraseña almacenada en BD:", usuario.Contraseña);

      // Comparar la contraseña ingresada con la almacenada
      const isMatch = await bcrypt.compare(contrasena, usuario.Contraseña);
      console.log("¿Coincide?", isMatch);

      if (!isMatch) {
        return res
          .status(401)
          .json({ error: "Correo o contraseña incorrectos" });
      }

      // Generar token JWT usando JWT_SECRET desde las variables de entorno
      const token = jwt.sign(
        {
          id: usuario.ID_Usuario,
          correo: usuario.Correo,
          cargo: usuario.Cargo,
        },
        process.env.JWT_SECRET, // Aquí usamos process.env.JWT_SECRET
        { expiresIn: "2h" }
      );

      // Devolver la respuesta con el token y los datos del usuario
      console.log("Login exitoso para usuario:", usuario.Correo);
      console.log("Con el rol de: ", usuario.Cargo);
      return res.json({
        message: "Login exitoso",
        token,
        usuario: {
          id: usuario.ID_Usuario,
          nombre: usuario.Nombre,
          apellido: usuario.Apellido,
          email: usuario.Correo,
          rol: usuario.Cargo,
          telefono: usuario.Telefono,
          id_tarjeta_rfid: usuario.ID_Tarjeta_RFID,
        },
      });
    }
  );
});

// Ruta para verificar contraseña de administrador
router.post("/verify-user-password", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(email);
    console.log(password);
    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Correo y contraseña son requeridos" });
    }

    // Buscar al usuario en la base de datos
    const query =
      "SELECT * FROM usuarios WHERE Correo = ? AND Estado = 'activo'";

    connection.query(query, [email], async (err, results) => {
      if (err) {
        console.error("Error al buscar usuario:", err);
        return res
          .status(500)
          .json({ error: "Error al verificar la contraseña" });
      }

      if (results.length === 0) {
        return res
          .status(401)
          .json({ isValid: false, error: "Usuario no encontrado" });
      }

      const user = results[0];

      // Verificar la contraseña
      const match = await bcrypt.compare(password, user.Contraseña);
      if (match) {
        return res.json({ isValid: true });
      } else {
        return res
          .status(401)
          .json({ isValid: false, error: "Contraseña incorrecta" });
      }
    });
  } catch (error) {
    console.error("Error en la verificación:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.post("/verify-nfc", (req, res) => {
  const { codigo_rfid } = req.body;

  if (!codigo_rfid) {
    return res.status(400).json({ error: "El código RFID es requerido" });
  }

  // Buscar la tarjeta RFID en la base de datos
  const query = `
      SELECT u.ID_Usuario, u.Nombre, u.Cargo, u.Correo
      FROM usuarios u
      JOIN tarjetas_rfid t ON u.ID_Tarjeta_RFID = t.ID_Tarjeta_RFID
      WHERE t.Codigo_RFID = ? AND u.Estado = 'activo' AND t.Estado = 'Activo'
  `;

  connection.query(query, [codigo_rfid], (err, results) => {
    if (err) {
      console.error("Error al verificar la tarjeta RFID:", err);
      return res.status(500).json({ error: "Error interno del servidor" });
    }

    if (results.length > 0) {
      return res.json({ isValid: true, user: results[0] });
    } else {
      return res
        .status(401)
        .json({
          isValid: false,
          error: "Tarjeta RFID no válida o usuario inactivo",
        });
    }
  });
});

router.post("/verify-nfc-admin", (req, res) => {
  const { codigo_rfid } = req.body;

  // Validación más completa
  if (
    !codigo_rfid ||
    typeof codigo_rfid !== "string" ||
    codigo_rfid.trim() === ""
  ) {
    return res.status(400).json({
      success: false,
      error: "Se requiere un código RFID válido",
    });
  }

  const query = `
      SELECT
          u.ID_Usuario,
          u.Nombre,
          u.Apellido,
          u.Cargo,
          CASE
              WHEN u.Cargo = 'Administrador' THEN 1
              ELSE 0
          END AS EsAdministrador,
          t.Estado AS EstadoTarjeta,
          u.Estado AS EstadoUsuario
      FROM
          tarjetas_rfid t
      JOIN
          usuarios u ON t.ID_Tarjeta_RFID = u.ID_Tarjeta_RFID
      WHERE
          t.Codigo_RFID = ?
          AND t.Estado = 'Activo'
          AND u.Estado = 'activo'
  `;

  connection.query(query, [codigo_rfid.trim()], (err, results) => {
    if (err) {
      console.error("Error al verificar la tarjeta RFID:", err);
      return res.status(500).json({
        success: false,
        error: "Error interno del servidor",
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        isValid: false,
        error: "Tarjeta no registrada o usuario inactivo",
      });
    }

    const userData = results[0];
    return res.json({
      success: true,
      isValid: true,
      isAdmin: userData.EsAdministrador === 1,
      user: {
        id: userData.ID_Usuario,
        nombre: userData.Nombre,
        apellido: userData.Apellido,
        cargo: userData.Cargo,
      },
    });
  });
});

module.exports = router;

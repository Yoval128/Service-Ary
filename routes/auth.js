const jwt = require("jsonwebtoken");
const express = require("express");
const router = express.Router();
const connection = require("../db/connection");
const bcrypt = require("bcryptjs");

console.log("Rutas de Auth");

// Ruta de prueba
router.get("/", (req, res) => {
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

module.exports = router;

const bcrypt = require("bcryptjs");
const express = require("express");
const router = express.Router();
const connection = require("../db/connection");

const { sendWhatsAppMessage } = require("../services/whatsappService");
const PDFDocument = require("pdfkit");
const fs = require("fs");

// Ruta de prueba
router.get("/", (req, res) => {
  res.send("Ruta de Usuarios funcionando");
});

// Obtener todos los usuarios
router.get("/list-users", (req, res) => {
  connection.query("SELECT * FROM usuarios", (err, results) => {
    if (err) {
      console.error("Error al obtener los usuarios:", err);
      res.status(500).json({ error: "Error al obtener los usuarios" });
      return;
    }
    res.status(200).json(results);
  });
});

// Actualizar un usuario por ID
router.put("/update-user/:id", async (req, res) => {
  const { id } = req.params;
  const {
    Nombre,
    Apellido,
    Cargo,
    Correo,
    Contraseña,
    Telefono,
    ID_Tarjeta_RFID,
  } = req.body;

  let values = [];
  let updateFields = [];

  if (Nombre) {
    updateFields.push("Nombre = ?");
    values.push(Nombre);
  }

  if (Apellido) {
    updateFields.push("Apellido = ?");
    values.push(Apellido);
  }

  if (Cargo) {
    updateFields.push("Cargo = ?");
    values.push(Cargo);
  }

  if (Correo) {
    updateFields.push("Correo = ?");
    values.push(Correo);
  }

  if (Contraseña) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(Contraseña, salt);
    updateFields.push("Contraseña = ?");
    values.push(hashedPassword);
  }

  if (Telefono) {
    updateFields.push("Telefono = ?");
    values.push(Telefono);
  }

  if (ID_Tarjeta_RFID) {
    updateFields.push("ID_Tarjeta_RFID = ?");
    values.push(ID_Tarjeta_RFID);
  }

  if (updateFields.length === 0) {
    return res
      .status(400)
      .json({ error: "No se proporcionaron datos para actualizar." });
  }

  values.push(id);

  const query = `UPDATE usuarios
                   SET ${updateFields.join(", ")}
                   WHERE ID_Usuario = ?`;

  try {
    connection.query(query, values, async (err, results) => {
      if (err) {
        console.error("Error al actualizar el usuario:", err);
        return res
          .status(500)
          .json({ error: "Error al actualizar el usuario" });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

      res.status(200).json({
        message: "Usuario actualizado exitosamente y notificación enviada.",
      });
    });
  } catch (error) {
    console.error("Error al procesar la solicitud:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Actualizar un usuario por ID Ademas de una Alerta por whatsapp
router.put("/update-user-alert/:id", async (req, res) => {
  const { id } = req.params;
  const {
    Nombre,
    Apellido,
    Cargo,
    Correo,
    Contraseña,
    Telefono,
    ID_Tarjeta_RFID,
  } = req.body;

  let values = [];
  let updateFields = [];

  if (Nombre) {
    updateFields.push("Nombre = ?");
    values.push(Nombre);
  }

  if (Apellido) {
    updateFields.push("Apellido = ?");
    values.push(Apellido);
  }

  if (Cargo) {
    updateFields.push("Cargo = ?");
    values.push(Cargo);
  }

  if (Correo) {
    updateFields.push("Correo = ?");
    values.push(Correo);
  }

  if (Contraseña) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(Contraseña, salt);
    updateFields.push("Contraseña = ?");
    values.push(hashedPassword);
  }

  if (Telefono) {
    updateFields.push("Telefono = ?");
    values.push(Telefono);
  }

  if (ID_Tarjeta_RFID) {
    updateFields.push("ID_Tarjeta_RFID = ?");
    values.push(ID_Tarjeta_RFID);
  }

  if (updateFields.length === 0) {
    return res
      .status(400)
      .json({ error: "No se proporcionaron datos para actualizar." });
  }

  values.push(id);

  const query = `UPDATE usuarios
                   SET ${updateFields.join(", ")}
                   WHERE ID_Usuario = ?`;

  try {
    connection.query(query, values, async (err, results) => {
      if (err) {
        console.error("Error al actualizar el usuario:", err);
        return res
          .status(500)
          .json({ error: "Error al actualizar el usuario" });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

      if (Telefono) {
        const message = `Hola ${
          Nombre || "Usuario"
        }, tus datos han sido actualizados correctamente en el sistema. Si no reconoces esta operación, comunicate con el área de sistemas.`;
        try {
          await sendWhatsAppMessage(Telefono, message);
        } catch (error) {
          console.error("Error al enviar el mensaje de WhatsApp:", error);
          return res.status(500).json({
            error:
              "Usuario actualizado, pero hubo un error al enviar el mensaje",
          });
        }
      }

      res.status(200).json({
        message: "Usuario actualizado exitosamente y notificación enviada.",
      });
    });
  } catch (error) {
    console.error("Error al procesar la solicitud:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Obtener un usuario por ID
router.get("/user/:id", (req, res) => {
  const userId = req.params.id;

  const query = `
      SELECT 
          u.ID_Usuario, 
          u.Nombre, 
          u.Apellido, 
          u.Cargo, 
          u.Correo, 
          u.Telefono, 
          u.Estado, 
          t.Codigo_RFID
      FROM usuarios u
      LEFT JOIN tarjetas_rfid t ON u.ID_Tarjeta_RFID = t.ID_Tarjeta_RFID
      WHERE u.ID_Usuario = ?;
  `;

  connection.query(query, [userId], (err, results) => {
      if (err) {
          console.error(err);
          return res.status(500).json({ error: "Error al obtener los detalles del usuario" });
      }
      if (results.length === 0) {
          return res.status(404).json({ message: "Usuario no encontrado" });
      }
      res.json(results[0]); 
  });
});


// Registrar un nuevo usuario
router.post("/register-user", async (req, res) => {
  const {
    Nombre,
    Apellido,
    Cargo,
    Correo,
    Contraseña,
    Telefono,
    ID_Tarjeta_RFID,
  } = req.body;

  console.log("Nombre", Nombre);

  // Verificación de campos vacíos
  if (
    !Nombre ||
    !Apellido ||
    !Cargo ||
    !Correo ||
    !Contraseña ||
    !Telefono ||
    !ID_Tarjeta_RFID
  ) {
    return res
      .status(400)
      .json({ error: "Todos los campos requeridos deben ser proporcionados" });
  }

  try {
    // Verificar si el ID_Tarjeta_RFID existe en la tabla tarjetas_rfid
    const checkRFIDQuery =
      "SELECT * FROM tarjetas_rfid WHERE ID_Tarjeta_RFID = ?";
    connection.query(checkRFIDQuery, [ID_Tarjeta_RFID], (err, results) => {
      if (err) {
        console.error("Error al verificar la tarjeta RFID:", err);
        return res.status(500).json({ error: "Error interno del servidor" });
      }

      if (results.length === 0) {
        return res
          .status(400)
          .json({ error: "El ID de tarjeta RFID no existe." });
      }

      // Si el ID_Tarjeta_RFID existe, proceder con la encriptación de la contraseña
      bcrypt.genSalt(10, (err, salt) => {
        if (err) {
          return res
            .status(500)
            .json({ error: "Error al generar el salt de la contraseña" });
        }

        bcrypt.hash(Contraseña, salt, (err, hashedPassword) => {
          if (err) {
            return res
              .status(500)
              .json({ error: "Error al encriptar la contraseña" });
          }

          // Realizar la inserción del usuario en la base de datos
          const query =
            "INSERT INTO usuarios (Nombre, Apellido, Cargo, Correo, Contraseña, Telefono, ID_Tarjeta_RFID) VALUES (?, ?, ?, ?, ?, ?, ?)";
          const values = [
            Nombre,
            Apellido,
            Cargo,
            Correo,
            hashedPassword, // Aquí va la contraseña encriptada
            Telefono,
            ID_Tarjeta_RFID,
          ];

          connection.query(query, values, (err, results) => {
            if (err) {
              console.error("Error al registrar el usuario:", err);
              return res
                .status(500)
                .json({ error: "Error al registrar el usuario" });
            }

            // Usuario registrado con éxito
            res.status(201).json({
              message: "Usuario registrado exitosamente",
              ID_Usuario: results.insertId,
            });
          });
        });
      });
    });
  } catch (error) {
    console.error("Error al procesar la solicitud:", error);
    res.status(500).json({ error: "Error interno del servidor Api" });
  }
});

// Actualizar un usuario por ID
router.put("/update-user/:id", async (req, res) => {
  const { id } = req.params;
  const {
    Nombre,
    Apellido,
    Cargo,
    Correo,
    Contraseña,
    Telefono,
    ID_Tarjeta_RFID,
  } = req.body;

  // Preparamos un objeto de valores con los campos que realmente se envían
  let values = [];
  let updateFields = [];

  if (Nombre) {
    updateFields.push("Nombre = ?");
    values.push(Nombre);
  }

  if (Apellido) {
    updateFields.push("Apellido = ?");
    values.push(Apellido);
  }

  if (Cargo) {
    updateFields.push("Cargo = ?");
    values.push(Cargo);
  }

  if (Correo) {
    updateFields.push("Correo = ?");
    values.push(Correo);
  }

  if (Contraseña) {
    // Encriptar la nueva contraseña si se ha enviado
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(Contraseña, salt);
    updateFields.push("Contraseña = ?");
    values.push(hashedPassword);
  }

  if (Telefono) {
    updateFields.push("Telefono = ?");
    values.push(Telefono);
  }

  if (ID_Tarjeta_RFID) {
    updateFields.push("ID_Tarjeta_RFID = ?");
    values.push(ID_Tarjeta_RFID);
  }

  // Si no hay campos para actualizar, devolvemos un error
  if (updateFields.length === 0) {
    return res
      .status(400)
      .json({ error: "No se proporcionaron datos para actualizar." });
  }

  // Añadir el ID al final de los valores
  values.push(id);

  // Crear la consulta SQL dinámica
  const query = `UPDATE usuarios
                   SET ${updateFields.join(", ")}
                   WHERE ID_Usuario = ?`;

  try {
    connection.query(query, values, (err, results) => {
      if (err) {
        console.error("Error al actualizar el usuario:", err);
        return res
          .status(500)
          .json({ error: "Error al actualizar el usuario" });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

      res.status(200).json({ message: "Usuario actualizado exitosamente" });
    });
  } catch (error) {
    console.error("Error al procesar la solicitud:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Eliminar un usuario por ID
router.delete("/delete-user/:id", (req, res) => {
  const { id } = req.params;

  // Eliminar los registros en movimientos_documentos que hacen referencia al usuario
  connection.query(
    "DELETE FROM movimientos_documentos WHERE ID_Usuario = ?",
    [id],
    (err, results) => {
      if (err) {
        console.error("Error al eliminar los movimientos de documentos:", err);
        return res
          .status(500)
          .json({ error: "Error al eliminar los movimientos de documentos" });
      }

      // Eliminar los registros de administradores relacionados con el usuario
      connection.query(
        "DELETE FROM administradores WHERE ID_Usuario = ?",
        [id],
        (err, results) => {
          if (err) {
            console.error("Error al eliminar el administrador:", err);
            return res
              .status(500)
              .json({ error: "Error al eliminar el administrador" });
          }

          // Eliminar los accesos del usuario
          connection.query(
            "DELETE FROM accesos WHERE ID_Usuario = ?",
            [id],
            (err, results) => {
              if (err) {
                console.error("Error al eliminar los accesos:", err);
                return res
                  .status(500)
                  .json({ error: "Error al eliminar los accesos" });
              }

              // Finalmente, eliminar el usuario de la tabla usuarios
              connection.query(
                "DELETE FROM usuarios WHERE ID_Usuario = ?",
                [id],
                (err, results) => {
                  if (err) {
                    console.error("Error al eliminar el usuario:", err);
                    return res
                      .status(500)
                      .json({ error: "Error al eliminar el usuario" });
                  }

                  if (results.affectedRows === 0) {
                    return res
                      .status(404)
                      .json({ error: "Usuario no encontrado" });
                  }

                  res.status(200).json({
                    message:
                      "Usuario, accesos, administrador y movimientos eliminados exitosamente",
                  });
                }
              );
            }
          );
        }
      );
    }
  );
});

// Obtener el número de usuarios activos (Estadisticas)
router.get("/active-users", (req, res) => {
  connection.query(
    "SELECT COUNT(*) AS activeUsers FROM usuarios",
    (err, results) => {
      if (err) {
        console.error("Error al obtener la cantidad de usuarios:", err);
        res
          .status(500)
          .json({ error: "Error al obtener la cantidad de usuarios" });
        return;
      }

      res.status(200).json({ activeUsers: results[0].activeUsers });
    }
  );
});

// Exportacion a PDF

router.get("/generate-pdf", async (req, res) => {
  try {
    // Recuperar todos los usuarios
    connection.query("SELECT * FROM usuarios", (err, users) => {
      if (err) {
        console.error("Error al obtener los usuarios:", err);
        return res.status(500).json({ error: "Error al obtener los usuarios" });
      }

      const doc = new PDFDocument();

      // Configurar la fecha actual
      const currentDate = new Date().toLocaleDateString();

      // Título con la fecha de exportación
      doc
        .fontSize(12)
        .text(`Lista de Usuarios - Exportado el: ${currentDate}`, {
          align: "center",
        });
      doc.moveDown(1);

      // Encabezado de la tabla sin la columna "Contraseña"
      const header = [
        "ID_Usuario",
        "Nombre",
        "Apellido",
        "Cargo",
        "Correo",
        "Telefono",
        "ID_Tarjeta_RFID",
      ];

      // Ancho de cada columna (ajustado para ser aún más pequeño)
      const columnWidth = [30, 80, 80, 70, 150, 80, 80]; // Columnas más estrechas
      const tableTop = 140; // Posición para la tabla
      let currentY = tableTop;

      // Dibujar encabezado de la tabla
      header.forEach((title, index) => {
        doc
          .fontSize(8)
          .text(
            title,
            50 + columnWidth.slice(0, index).reduce((a, b) => a + b, 0),
            currentY
          );
      });
      currentY += 15;

      // Dibujar las filas sin la columna "Contraseña"
      users.forEach((user) => {
        const row = [
          user.ID_Usuario,
          user.Nombre,
          user.Apellido,
          user.Cargo,
          user.Correo,
          user.Telefono,
          user.ID_Tarjeta_RFID,
        ];

        row.forEach((value, index) => {
          // Añadir cada valor de la fila con la posición calculada
          doc
            .fontSize(7)
            .text(
              value,
              50 + columnWidth.slice(0, index).reduce((a, b) => a + b, 0),
              currentY
            );
        });
        currentY += 12; // Reducir el espaciado entre filas
      });

      // Establecer el nombre del archivo y enviarlo como respuesta
      const filename = "usuarios.pdf";
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`
      );

      // Pipestream del documento PDF al cliente
      doc.pipe(res);
      doc.end();
    });
  } catch (error) {
    console.error("Error generando el PDF:", error);
    res.status(500).json({ error: "Error generando el PDF" });
  }
});

// Cargos (Estadisticas)
router.get("/cargos", async (req, res) => {
  connection.query(
    "SELECT Cargo, COUNT(*) AS cantidad FROM usuarios GROUP BY Cargo",
    (err, results) => {
      if (err) {
        console.error("Error al obtener los cargos:", err);
        res.status(500).json({ error: "Error al obtener los cargos" });
        return;
      }

      res.status(200).json(results); // Devuelve directamente el array de resultados
    }
  );
});

// Ultimo usuario (Estadisticas)
router.get("/last-user", async (req, res) => {
  connection.query(
    "SELECT * FROM usuarios ORDER BY ID_Usuario DESC LIMIT 1",
    (err, results) => {
      if (err) {
        console.error("Error al obtener el último usuario:", err);
        res.status(500).json({ error: "Error al obtener el último usuario" });
        return;
      }

      if (results.length === 0) {
        return res.status(404).json({ error: "No se encontró un usuario" });
      }

      res.status(200).json(results[0]);
    }
  );
});




module.exports = router;

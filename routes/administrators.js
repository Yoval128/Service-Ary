const express = require("express");
const connection = require("../db/connection");
const router = express.Router();

// Ruta de prueba
router.get("/", (req, res) => {
    res.send("Ruta de Administradores funcionando");
  });

// Ruta para obtener un administrador por ID con información del usuario
router.get("/administrator/:id", (req, res) => {
  const { id } = req.params;

  if (!id.trim()) {
    return res.status(400).json({ message: "ID_Admin is required" });
  }

  const query = `
    SELECT a.ID_Admin, a.ID_Usuario, u.Nombre, u.Apellido, u.Cargo, u.Correo, u.Telefono, u.Estado
    FROM administradores a
    JOIN usuarios u ON a.ID_Usuario = u.ID_Usuario
    WHERE a.ID_Admin = ?
  `;

  connection.query(query, [id], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Error fetching administrator" });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "Administrator not found" });
    }

    const administratorData = {
      ID_Admin: results[0].ID_Admin,
      ID_Usuario: results[0].ID_Usuario,
      Usuario: {
        Nombre: results[0].Nombre,
        Apellido: results[0].Apellido,
        Cargo: results[0].Cargo,
        Correo: results[0].Correo,
        Telefono: results[0].Telefono,
        Estado: results[0].Estado
      }
    };

    return res.status(200).json(administratorData);
  });
});
    

// Ruta Lista
router.get("/administrators-list", (req, res) => {
  const query = `
    SELECT a.ID_Admin, a.Nivel_Permiso, 
           u.ID_Usuario, u.Nombre, u.Apellido, u.Cargo, u.Correo, u.Telefono, u.Estado 
    FROM administradores a
    JOIN usuarios u ON a.ID_Usuario = u.ID_Usuario
  `; 

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Error fetching administrators" });
    }
    res.status(200).json(results);
  });
});


// Ruta Registr (Register a new administrator)
router.post("/register-administrator", (req, res) => {
  const { ID_Usuario, Nivel_Permiso } = req.body;

  if (!ID_Usuario || !Nivel_Permiso) {
    return res.status(400).json({ message: "ID_Usuario and Nivel_Permiso are required" });
  }

  const query = "INSERT INTO administradores (ID_Usuario, Nivel_Permiso) VALUES (?, ?)";
  connection.query(query, [ID_Usuario, Nivel_Permiso], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Error registering administrator" });
    }
    res.status(201).json({ message: "Administrator registered successfully", id: results.insertId });
  });
});

 
// Ruta de Actualización (Update an administrator)
router.put("/update-administrator", (req, res) => {
  const { ID_Admin, Nivel_Permiso } = req.body;

  if (!ID_Admin || !Nivel_Permiso) {
    return res.status(400).json({ message: "ID_Admin and Nivel_Permiso are required" });
  }

  const query = "UPDATE administradores SET Nivel_Permiso = ? WHERE ID_Admin = ?";
  connection.query(query, [Nivel_Permiso, ID_Admin], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Error updating administrator" });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Administrator not found" });
    }
    res.json({ message: "Administrator updated successfully" });
  });
});


// Ruta de Eliminación (Delete an administrator)
router.delete("/delete-administrator/:id", (req, res) => {
  const { id } = req.params;

  if (!id) {
      return res.status(400).json({ message: "ID_Admin is required" });
  }

  const query = "DELETE FROM administradores WHERE ID_Admin = ?";
  connection.query(query, [id], (err, results) => {
      if (err) {
          console.error(err);
          return res.status(500).json({ message: "Error deleting administrator" });
      }
      if (results.affectedRows === 0) {
          return res.status(404).json({ message: "Administrator not found" });
      }
      res.json({ message: "Administrator deleted successfully" });
  });
});

module.exports = router;
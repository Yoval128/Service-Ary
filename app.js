const dotenv = require("dotenv");
const path = require("path");
const express = require("express");
const app = express();
const routes = require("./routes");
const cors = require("cors");

// Forzar el entorno a producción
process.env.NODE_ENV = "production";

// Cargar variables según el entorno
const envFile = ".env.production"; // Siempre cargará el archivo .env.production
dotenv.config({ path: path.resolve(__dirname, envFile) });

console.log("Env: " + envFile);
console.log("JWT_SECRET: " + process.env.JWT_SECRET);

// Configuración de CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL, // Usa la URL del frontend definida en .env.production
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middleware para parsear el cuerpo de la solicitud en formato JSON
app.use(express.json());

// Rutas de la API
app.use("/api", routes);

// Ruta de prueba
app.get('/api', (req, res) => {
  res.send("Api Ary funcionando");
});

// Puerto de la aplicación
const PORT = process.env.PORT || 3001; // Puerto para la aplicación Node.js
app.listen(PORT, () => {
  console.log(`API en ${process.env.NODE_ENV} esperando en el puerto ${PORT}`);
});
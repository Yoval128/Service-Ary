require("dotenv").config();
const express = require("express");
const app = express();
const routes = require("./routes");
const cors = require("cors");

// Use CORS middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:8081", // Si no está definida en el .env, usa la URL por defecto
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middleware para parsear el cuerpo de la solicitud en formato JSON
app.use(express.json());

// Rutas de la API
app.use("/api", routes);

app.get('/api', (req, res) => {
  res.send("Api Ary funcionando");
});

// Puerto
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API server esperando en el puerto ${PORT}`);
});

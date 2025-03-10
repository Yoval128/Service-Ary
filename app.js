require("dotenv").config();
const express = require('express');
const app = express();
const routes = require('./routes');
const cors = require('cors');

// Use CORS middleware
app.use(cors({
  origin: 'http://localhost:8081',  // Cambiado a la URL de tu frontend React
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Middleware para parsear el cuerpo de la solicitud en formato JSON
app.use(express.json());

// Rutas de la API
app.use('/api', routes);


// Puerto
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`API server esperando en el puerto ${PORT}`);
});

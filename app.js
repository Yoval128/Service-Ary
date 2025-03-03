require("dotenv").config();
const express = require('express');
const app = express();
const routes = require('./routes');


// Middleware para parsear el cuerpo de la solicitud en formato JSON
app.use(express.json());

// Middleware para configurar las cabeceras CORS
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

// Rutas de la API
app.use('/api', routes);

// Puerto
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor API a la espera de consulta, por el puerto ${PORT}`);
});
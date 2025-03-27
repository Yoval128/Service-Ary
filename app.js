const dotenv = require("dotenv");
const path = require("path");
const express = require("express");
const http = require("http"); // Importar módulo http
const socketIo = require("socket.io"); // Importar Socket.io
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
const corsOptions = {
  origin: process.env.FRONTEND_URL,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

// Middleware para parsear el cuerpo de la solicitud en formato JSON
app.use(express.json());

// Crear servidor HTTP
const server = http.createServer(app);

// Configurar Socket.io
const io = socketIo(server, {
  cors: corsOptions
});

// Manejar conexiones Socket.io
io.on('connection', (socket) => {
  console.log('Nuevo cliente conectado:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

// Pasar io a las rutas
app.set('io', io);

// Rutas de la API
app.use("/api", routes);

// Ruta de prueba
app.get('/api', (req, res) => {
  res.send("Api Ary funcionando");
});

// Puerto de la aplicación
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`API en ${process.env.NODE_ENV} esperando en el puerto ${PORT}`);
});
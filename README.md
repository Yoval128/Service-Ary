# ARYControlAccess

Sistema de gestión de accesos basado en RFID, desarrollado con Node.js y MySQL.

## ✅ Requisitos

Antes de comenzar, asegúrate de tener instalados los siguientes programas:

- [Node.js](https://nodejs.org) (v18 o superior)
- [npm](https://www.npmjs.com/)
- Base de datos SQL (MySQL o MariaDB)

## 📦 Instalación de las Dependencias

Sigue estos pasos para configurar el entorno del proyecto:

1. Clona el repositorio:

```bash
git clone https://github.com/Yoval128/Service-Ary.git
cd Service-Ary
```

2. Inicializa el proyecto y descarga las dependencias principales:

```bash
npm init -y
npm install
```

3. Instala las dependencias adicionales necesarias:

- **Encriptación de contraseñas y manejo de JWT (JSON Web Tokens):**

```bash
npm install bcryptjs jsonwebtoken
```

- **Manejo de rutas y conexión a la base de datos:**

```bash
npm install express mysql mysql2 mariadb
```

- **Manejo de archivos y validaciones:**

```bash
npm install multer xlsx dotenv express-validator
```

```bash
npm install twilio
```

```bash
npm install cors
```

## ▶️ Ejecución del Proyecto

1. Asegúrate de tener tu base de datos configurada y el archivo `.env` con las credenciales correspondientes.

2. Ejecuta el proyecto:

```bash
npm start
```

## 📖 Notas

- **express:** Para manejar las rutas y solicitudes HTTP (GET, POST, PUT, DELETE).
- **bcryptjs:** Para la encriptación segura de las contraseñas.
- **jsonwebtoken:** Para la autenticación mediante tokens JWT.
- **multer:** Para la gestión de archivos.
- **dotenv:** Para la configuración de variables de entorno.

## Estructura del proyecto

services/
├── db/ # Conexión y configuración de la base de datos
├── db-script/ # Scripts para inicialización de la base de datos
├── node_modules/ # Dependencias del proyecto (generado automáticamente por npm)
├── routes/ # Rutas del API REST
│ ├── access.js # Rutas de acceso
│ ├── administrators.js # Rutas para administradores
│ ├── archivers.js # Rutas de archivadores
│ ├── auth.js # Rutas de autenticación
│ ├── documentMovements.js # Rutas para el movimiento de documentos
│ ├── documents.js # Rutas para la gestión de documentos
│ ├── index.js # Punto de entrada de las rutas
│ ├── rfidCards.js # Rutas para las tarjetas RFID
│ ├── rfidTags.js # Rutas para las etiquetas RFID
│ ├── uploads.js # Rutas para la gestión de archivos subidos
│ └── users.js # Rutas para la gestión de usuarios
├── uploads/ # Carpeta para almacenamiento de archivos subidos
├── .env # Variables de entorno (configuración sensible)
├── .gitignore # Archivos y carpetas ignorados por Git
├── app.js # Archivo principal del servidor
├── package.json # Archivo de configuración de dependencias
├── package-lock.json # Versión fija de las dependencias
└── README.md # Documentación del proyecto

## Prueba de la Api

- http://localhost:3001/api/auth

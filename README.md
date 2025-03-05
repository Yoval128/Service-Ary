# ARYControlAccess

## Requisitos

Antes de comenzar, asegúrate de tener instalados los siguientes programas:

- [Node.js]
- [npm]
- [Base de datos SQL (MySQL)]

## Instalación de las Dependencias

Para iniciar el proyecto y asegurarte de que todas las dependencias necesarias estén instaladas, sigue estos pasos:

```bash
npm install
npm init -y
```

*Para la encriptación de contraseñas y jsonwebtoken

```bash
* npm install bcryptjs jsonwebtoken 
```

*Manejo de Rutas: Te permite definir diferentes rutas para manejar diversas solicitudes HTTP como GET, POST, PUT,
DELETE,

```bash
npm install express  
npm install mysql
npm install express multer xlsx mysql2
npm install express multer xlsx mariadb
npm install dotenv
npm i express-validator
  ```

## Estructura del proyecto

/aryaccesscontrol
/services
│
├── /node_modules # Módulos de dependencias (generado por npm)
├── /db # Conexión con la base de datos
│ └── connection.js # Archivo con la conexión a la base de datos
├── /routes # Rutas de la API
│ ├── auth.js # Rutas de autenticación (Login, Registro)
│ └── index.js # Rutas principales, incluir todas las rutas
├── app.js # Archivo principal que inicia el servidor
├── package.json # Dependencias del proyecto
├── .env # Variables de entorno (clave de JWT, base de datos, etc.)
└── README.md # Documentación básica del proyecto

## Prueba de la Api

* http://localhost:3001/api/auth

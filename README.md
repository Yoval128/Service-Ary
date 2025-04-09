# ARYControlAccess - API

**Versión Final - Proyecto Integrador**  
**Backend del sistema de control de accesos y gestión de documentos mediante RFID**

Esta API forma parte del sistema [**ARYControlAccess**](https://github.com/Yoval128/app-arycontrolaccess), un proyecto enfocado en la **seguridad, trazabilidad y gestión de documentos confidenciales** mediante tecnología RFID. Desarrollada con **Node.js** y **MySQL**, esta API se encarga de la autenticación, registro y administración de usuarios, control de accesos, carga y movimiento de archivos, todo con control de roles y cifrado de datos.

---

## ✅ Requisitos

Antes de comenzar, asegúrate de tener instalados los siguientes programas:

- [Node.js](https://nodejs.org) (v18 o superior)
- [npm](https://www.npmjs.com/)
- Base de datos SQL (MySQL o MariaDB)

---

## 📦 Instalación de dependencias

1. Clona el repositorio:

```bash
git clone https://github.com/Yoval128/Service-Ary.git
cd Service-Ary
```

2. Inicializa el proyecto y descarga las dependencias:

```bash
npm install
```

---

## ▶️ Ejecución del Proyecto

Asegúrate de tener tu base de datos en ejecución y el archivo `.env` configurado correctamente.

```bash
npm start
```

> Por defecto corre en `http://localhost:3001/api`

---

## 📚 Funcionalidades principales

- **Autenticación de usuarios** mediante JWT y bcrypt.
- **Gestión de usuarios, administradores y archivadores.**
- **Carga, descarga consulta y movimiento de documentos (PDF).**
- **Control de accesos RFID.**
- **Gestión de tarjetas RFID y etiquetas.**
- **Notificaciones y mensajes SMS (Twilio).**
- **Exportación a PDF.**

---


## 👨‍💻 Autor

**Yoval128**  
Técnico en Programación | Estudiante TSU en Desarrollo de Software  
[GitHub: Yoval128](https://github.com/Yoval128)
const express = require('express');
const router = express.Router();

// Ruta para verificar si la API está funcionando
router.get('/ping', (req, res) => {
    res.status(200).json({ message: 'API está funcionando' });
});

// Ruta para recibir datos del ESP32 y verificar la conexión
router.post('/esp32data', (req, res) => {
    // Aquí asumimos que el ESP32 enviará datos en formato JSON
    const esp32Data = req.body;

    if (!esp32Data) {
        return res.status(400).json({ message: 'No se recibieron datos' });
    }

    // Verificar si los datos recibidos son correctos (esto dependerá de lo que envíes)
    // Ejemplo de verificación: Si recibimos un campo "rfidCode"
    if (esp32Data.rfidCode) {
        // Realizar cualquier procesamiento que necesites
        console.log(`Datos recibidos del ESP32: ${esp32Data.rfidCode}`);
        
        // Responder confirmando que los datos se recibieron correctamente
        return res.status(200).json({
            message: 'Datos recibidos correctamente',
            rfidCode: esp32Data.rfidCode,
        });
    } else {
        return res.status(400).json({ message: 'Faltan datos requeridos' });
    }
});

module.exports = router;

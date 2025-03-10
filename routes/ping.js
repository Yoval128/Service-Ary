const express = require('express');
const router = express.Router();

// Definir ruta /ping
router.get('/ping', (req, res) => {
    res.status(200).json({ message: 'API está funcionando' });
});


module.exports = router;

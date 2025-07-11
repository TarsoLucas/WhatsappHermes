const express = require('express');
const router = express.Router();

// Importando as rotas específicas
const hermesRoutes = require('./hermesRoutes');
const fileRoutes = require('./fileRoutes');

// Usando as rotas
router.use('/hermes', hermesRoutes);
router.use('/files', fileRoutes);

module.exports = router;
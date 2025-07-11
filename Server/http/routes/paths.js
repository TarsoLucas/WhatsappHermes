const express = require('express');
const router = express.Router();

// Importando as rotas específicas
const hermesRoutes = require('./hermesRoutes');
const fileRoutes = require('./fileRoutes');
// const contatosRoutes = require('./contatosRoutes'); // Temporariamente desabilitado

// Usando as rotas
router.use('/hermes', hermesRoutes);
router.use('/files', fileRoutes);
// router.use('/contatos', contatosRoutes); // Temporariamente desabilitado

module.exports = router;
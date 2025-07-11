const express = require('express');
const router = express.Router();
const { buscaContatos } = require('../../applications/fileReader/buscaContatos');

router.get('/buscaContatos', (req, res) => {   
    try {
        const contatos = buscaContatos(req.query.arquivoContatos); 
        contatos.map(contato => {console.log(contato.name)});
        res.json(contatos);
    } catch (error) {
        res.status(500).send('Erro ao listar contatos: ' + error.message);
    }
});

module.exports = router; 
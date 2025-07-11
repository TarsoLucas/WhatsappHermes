const express = require('express');
const router = express.Router();
const ContatosService = require('../../applications/database/contatosService');

let contatosService;

// Middleware para inicializar o serviço apenas se o banco estiver disponível
const initService = (req, res, next) => {
    if (!process.env.DATABASE_URL) {
        return res.status(503).json({ 
            error: 'Banco de dados não configurado',
            message: 'Configure DATABASE_URL para usar esta funcionalidade'
        });
    }
    
    if (!contatosService) {
        contatosService = new ContatosService();
    }
    
    next();
};

// Listar todos os contatos
router.get('/', initService, async (req, res) => {
    try {
        const { categoria } = req.query;
        const contatos = await contatosService.buscarTodos(categoria);
        res.json(contatos);
    } catch (error) {
        console.error('Erro ao buscar contatos:', error);
        res.status(500).json({ error: 'Erro ao buscar contatos' });
    }
});

// Listar categorias disponíveis
router.get('/categorias', initService, async (req, res) => {
    try {
        const categorias = await contatosService.buscarCategorias();
        res.json(categorias);
    } catch (error) {
        console.error('Erro ao buscar categorias:', error);
        res.status(500).json({ error: 'Erro ao buscar categorias' });
    }
});

// Buscar contato por ID
router.get('/:id', initService, async (req, res) => {
    try {
        const contato = await contatosService.buscarPorId(req.params.id);
        if (!contato) {
            return res.status(404).json({ error: 'Contato não encontrado' });
        }
        res.json(contato);
    } catch (error) {
        console.error('Erro ao buscar contato:', error);
        res.status(500).json({ error: 'Erro ao buscar contato' });
    }
});

// Criar novo contato
router.post('/', initService, async (req, res) => {
    try {
        const { nome, telefone, categoria } = req.body;

        if (!nome || !telefone) {
            return res.status(400).json({ error: 'Nome e telefone são obrigatórios' });
        }

        // Gerar whatsapp_id a partir do telefone
        const whatsapp_id = telefone.replace(/\D/g, '') + '@c.us';

        const contato = await contatosService.criar({
            nome,
            telefone,
            whatsapp_id,
            categoria: categoria || 'geral'
        });

        res.status(201).json(contato);
    } catch (error) {
        console.error('Erro ao criar contato:', error);
        if (error.code === '23505') { // Unique violation
            res.status(409).json({ error: 'Contato já existe com este telefone' });
        } else {
            res.status(500).json({ error: 'Erro ao criar contato' });
        }
    }
});

// Atualizar contato
router.put('/:id', initService, async (req, res) => {
    try {
        const { nome, telefone, categoria, ativo } = req.body;

        if (!nome || !telefone) {
            return res.status(400).json({ error: 'Nome e telefone são obrigatórios' });
        }

        const whatsapp_id = telefone.replace(/\D/g, '') + '@c.us';

        const contato = await contatosService.atualizar(req.params.id, {
            nome,
            telefone,
            whatsapp_id,
            categoria: categoria || 'geral',
            ativo: ativo !== undefined ? ativo : true
        });

        if (!contato) {
            return res.status(404).json({ error: 'Contato não encontrado' });
        }

        res.json(contato);
    } catch (error) {
        console.error('Erro ao atualizar contato:', error);
        res.status(500).json({ error: 'Erro ao atualizar contato' });
    }
});

// Desativar contato
router.delete('/:id', initService, async (req, res) => {
    try {
        const contato = await contatosService.desativar(req.params.id);
        if (!contato) {
            return res.status(404).json({ error: 'Contato não encontrado' });
        }
        res.json({ message: 'Contato desativado com sucesso' });
    } catch (error) {
        console.error('Erro ao desativar contato:', error);
        res.status(500).json({ error: 'Erro ao desativar contato' });
    }
});

// Buscar histórico de envios
router.get('/:id/historico', initService, async (req, res) => {
    try {
        const { limite = 50 } = req.query;
        const historico = await contatosService.buscarHistoricoEnvios(
            req.params.id, 
            parseInt(limite)
        );
        res.json(historico);
    } catch (error) {
        console.error('Erro ao buscar histórico:', error);
        res.status(500).json({ error: 'Erro ao buscar histórico' });
    }
});

module.exports = router;

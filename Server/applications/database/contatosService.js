const Database = require('./connection');

class ContatosService {
    constructor() {
        this.db = new Database();
    }

    // Buscar todos os contatos ativos
    async buscarTodos(categoria = null) {
        try {
            let query = 'SELECT * FROM contatos WHERE ativo = true';
            let params = [];

            if (categoria) {
                query += ' AND categoria = $1';
                params.push(categoria);
            }

            query += ' ORDER BY nome';

            const result = await this.db.query(query, params);
            return result.rows;
        } catch (error) {
            console.error('Erro ao buscar contatos:', error);
            throw error;
        }
    }

    // Buscar contatos por categoria
    async buscarPorCategoria(categoria) {
        return this.buscarTodos(categoria);
    }

    // Buscar contato por ID
    async buscarPorId(id) {
        try {
            const result = await this.db.query('SELECT * FROM contatos WHERE id = $1', [id]);
            return result.rows[0] || null;
        } catch (error) {
            console.error('Erro ao buscar contato por ID:', error);
            throw error;
        }
    }

    // Criar novo contato
    async criar(dados) {
        try {
            const { nome, telefone, whatsapp_id, categoria = 'geral' } = dados;

            const result = await this.db.query(
                'INSERT INTO contatos (nome, telefone, whatsapp_id, categoria) VALUES ($1, $2, $3, $4) RETURNING *',
                [nome, telefone, whatsapp_id, categoria]
            );

            return result.rows[0];
        } catch (error) {
            console.error('Erro ao criar contato:', error);
            throw error;
        }
    }

    // Atualizar contato
    async atualizar(id, dados) {
        try {
            const { nome, telefone, whatsapp_id, categoria, ativo } = dados;

            const result = await this.db.query(
                `UPDATE contatos
                 SET nome = $1, telefone = $2, whatsapp_id = $3, categoria = $4, ativo = $5, updated_at = CURRENT_TIMESTAMP
                 WHERE id = $6 RETURNING *`,
                [nome, telefone, whatsapp_id, categoria, ativo, id]
            );

            return result.rows[0] || null;
        } catch (error) {
            console.error('Erro ao atualizar contato:', error);
            throw error;
        }
    }

    // Desativar contato (soft delete)
    async desativar(id) {
        try {
            const result = await this.db.query(
                'UPDATE contatos SET ativo = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
                [id]
            );

            return result.rows[0] || null;
        } catch (error) {
            console.error('Erro ao desativar contato:', error);
            throw error;
        }
    }

    // Buscar categorias disponíveis
    async buscarCategorias() {
        try {
            const result = await this.db.query(
                'SELECT DISTINCT categoria FROM contatos WHERE ativo = true ORDER BY categoria'
            );
            return result.rows.map(row => row.categoria);
        } catch (error) {
            console.error('Erro ao buscar categorias:', error);
            throw error;
        }
    }

    // Registrar envio de mensagem
    async registrarEnvio(contatoId, mensagem, tipo = 'texto', status = 'enviado', erro = null) {
        try {
            const result = await this.db.query(
                'INSERT INTO envios (contato_id, mensagem, tipo, status, erro) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                [contatoId, mensagem, tipo, status, erro]
            );

            return result.rows[0];
        } catch (error) {
            console.error('Erro ao registrar envio:', error);
            throw error;
        }
    }

    // Buscar histórico de envios
    async buscarHistoricoEnvios(contatoId = null, limite = 100) {
        try {
            let query = `
                SELECT e.*, c.nome, c.telefone 
                FROM envios e 
                JOIN contatos c ON e.contato_id = c.id
            `;
            let params = [];

            if (contatoId) {
                query += ' WHERE e.contato_id = $1';
                params.push(contatoId);
            }

            query += ' ORDER BY e.enviado_em DESC LIMIT $' + (params.length + 1);
            params.push(limite);

            const result = await this.db.query(query, params);
            return result.rows;
        } catch (error) {
            console.error('Erro ao buscar histórico:', error);
            throw error;
        }
    }
}

module.exports = ContatosService;

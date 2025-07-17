const Database = require('./connection');
const Contato = require('./models/Contato');
const Envio = require('./models/Envio');

class ContatosService {
    constructor() {
        this.db = new Database();
    }

    // Buscar todos os contatos ativos
    async buscarTodos(categoria = null) {
        try {
            await this.db.connect();

            let query = { ativo: true };
            if (categoria) {
                query.categoria = categoria;
            }

            const contatos = await Contato.find(query).sort({ nome: 1 });
            return contatos;
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
            await this.db.connect();
            const contato = await Contato.findById(id);
            return contato;
        } catch (error) {
            console.error('Erro ao buscar contato por ID:', error);
            throw error;
        }
    }

    // Criar novo contato
    async criar(dados) {
        try {
            await this.db.connect();

            const contato = new Contato(dados);
            const contatoSalvo = await contato.save();
            return contatoSalvo;
        } catch (error) {
            console.error('Erro ao criar contato:', error);
            throw error;
        }
    }

    // Atualizar contato
    async atualizar(id, dados) {
        try {
            await this.db.connect();

            const contato = await Contato.findByIdAndUpdate(id, dados, {
                new: true,
                runValidators: true
            });
            return contato;
        } catch (error) {
            console.error('Erro ao atualizar contato:', error);
            throw error;
        }
    }

    // Desativar contato (soft delete)
    async desativar(id) {
        try {
            await this.db.connect();

            const contato = await Contato.findByIdAndUpdate(id, { ativo: false }, { new: true });
            return contato;
        } catch (error) {
            console.error('Erro ao desativar contato:', error);
            throw error;
        }
    }

    // Buscar categorias disponíveis
    async buscarCategorias() {
        try {
            await this.db.connect();

            const categorias = await Contato.distinct('categoria', { ativo: true });
            return categorias.sort();
        } catch (error) {
            console.error('Erro ao buscar categorias:', error);
            throw error;
        }
    }

    // Registrar envio de mensagem
    async registrarEnvio(contatoId, mensagem, tipo = 'texto', status = 'enviado', erro = null) {
        try {
            await this.db.connect();

            const envio = new Envio({
                contato_id: contatoId,
                mensagem,
                tipo,
                status,
                erro
            });

            const envioSalvo = await envio.save();
            return envioSalvo;
        } catch (error) {
            console.error('Erro ao registrar envio:', error);
            throw error;
        }
    }

    // Buscar histórico de envios
    async buscarHistoricoEnvios(contatoId = null, limite = 100) {
        try {
            await this.db.connect();

            let query = {};
            if (contatoId) {
                query.contato_id = contatoId;
            }

            const envios = await Envio.find(query)
                .populate('contato_id', 'nome telefone')
                .sort({ createdAt: -1 })
                .limit(limite);

            return envios;
        } catch (error) {
            console.error('Erro ao buscar histórico:', error);
            throw error;
        }
    }
}

module.exports = ContatosService;

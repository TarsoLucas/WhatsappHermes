const Database = require('./connection');

class Migrations {
    constructor() {
        this.db = new Database();
    }

    async createTables() {
        try {
            console.log('🔄 Criando tabelas do banco de dados...');

            // Tabela de contatos
            await this.db.query(`
                CREATE TABLE IF NOT EXISTS contatos (
                    id SERIAL PRIMARY KEY,
                    nome VARCHAR(100) NOT NULL,
                    telefone VARCHAR(20) NOT NULL,
                    whatsapp_id VARCHAR(50) UNIQUE NOT NULL,
                    grupo VARCHAR(50) DEFAULT 'geral',
                    ativo BOOLEAN DEFAULT true,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // Tabela de histórico de envios
            await this.db.query(`
                CREATE TABLE IF NOT EXISTS envios (
                    id SERIAL PRIMARY KEY,
                    contato_id INTEGER REFERENCES contatos(id),
                    mensagem TEXT,
                    tipo VARCHAR(20) DEFAULT 'texto',
                    status VARCHAR(20) DEFAULT 'enviado',
                    erro TEXT,
                    enviado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // Índices para performance
            await this.db.query(`
                CREATE INDEX IF NOT EXISTS idx_contatos_whatsapp_id ON contatos(whatsapp_id);
                CREATE INDEX IF NOT EXISTS idx_contatos_grupo ON contatos(grupo);
                CREATE INDEX IF NOT EXISTS idx_envios_contato_id ON envios(contato_id);
                CREATE INDEX IF NOT EXISTS idx_envios_enviado_em ON envios(enviado_em);
            `);

            console.log('✅ Tabelas criadas com sucesso!');
            return true;
        } catch (error) {
            console.error('❌ Erro ao criar tabelas:', error);
            throw error;
        }
    }

    async seedInitialData() {
        try {
            console.log('🌱 Inserindo dados iniciais...');

            // Verificar se já existem contatos
            const existingContacts = await this.db.query('SELECT COUNT(*) FROM contatos');
            if (parseInt(existingContacts.rows[0].count) > 0) {
                console.log('📋 Dados já existem, pulando seed inicial');
                return;
            }

            // Inserir contatos de exemplo (baseado no seu contatosTeste.txt)
            const contatos = [
                { nome: 'FV Paula', telefone: '+5571999632643', whatsapp_id: '5571999632643@c.us' },
                { nome: 'C Michele', telefone: '+5571997111098', whatsapp_id: '5571997111098@c.us' },
                { nome: 'Eu', telefone: '+5571991691800', whatsapp_id: '5571991691800@c.us' }
            ];

            for (const contato of contatos) {
                await this.db.query(
                    'INSERT INTO contatos (nome, telefone, whatsapp_id) VALUES ($1, $2, $3)',
                    [contato.nome, contato.telefone, contato.whatsapp_id]
                );
            }

            console.log('✅ Dados iniciais inseridos com sucesso!');
        } catch (error) {
            console.error('❌ Erro ao inserir dados iniciais:', error);
            throw error;
        }
    }

    async run() {
        try {
            await this.createTables();
            await this.seedInitialData();
            console.log('🎉 Migração concluída com sucesso!');
        } catch (error) {
            console.error('💥 Erro na migração:', error);
            throw error;
        }
    }
}

module.exports = Migrations;

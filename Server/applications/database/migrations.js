const Database = require('./connection');
const Contato = require('./models/Contato');
const Envio = require('./models/Envio');

class Migrations {
    constructor() {
        this.db = new Database();
    }

    async createTables() {
        try {
            console.log('🔄 Configurando MongoDB...');

            // Conectar ao MongoDB
            await this.db.connect();

            // Os modelos Mongoose já criam as coleções automaticamente
            // Vamos apenas garantir que os índices estão criados

            console.log('✅ MongoDB configurado com sucesso!');
            return true;
        } catch (error) {
            console.error('❌ Erro ao configurar MongoDB:', error);
            throw error;
        }
    }

    async seedInitialData() {
        try {
            console.log('🌱 Verificando dados iniciais...');

            // Verificar se já existem contatos
            const existingContacts = await Contato.countDocuments();
            if (existingContacts > 0) {
                console.log('📋 Dados já existem, pulando seed inicial');
                return;
            }

            // Inserir contatos de exemplo
            const contatos = [
                { nome: 'FV Paula', telefone: '+5571999632643', whatsapp_id: '5571999632643@c.us', categoria: 'teste' },
                { nome: 'C Michele', telefone: '+5571997111098', whatsapp_id: '5571997111098@c.us', categoria: 'teste' },
                { nome: 'Eu', telefone: '+5571991691800', whatsapp_id: '5571991691800@c.us', categoria: 'teste' }
            ];

            await Contato.insertMany(contatos);
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

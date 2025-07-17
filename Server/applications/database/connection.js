const mongoose = require('mongoose');

class Database {
    constructor() {
        this.isConnected = false;
        console.log('Conexão MongoDB configurada');
    }

    async connect() {
        try {
            if (this.isConnected) {
                return true;
            }

            if (!process.env.DATABASE_URL) {
                throw new Error('DATABASE_URL não configurada');
            }

            await mongoose.connect(process.env.DATABASE_URL);
            this.isConnected = true;
            console.log('✅ Conectado ao MongoDB');
            return true;
        } catch (error) {
            console.error('❌ Erro ao conectar MongoDB:', error.message);
            return false;
        }
    }

    async testConnection() {
        try {
            const connected = await this.connect();
            if (connected) {
                console.log('✅ Conexão com MongoDB OK');
                return true;
            }
            return false;
        } catch (error) {
            console.error('❌ Erro ao testar conexão MongoDB:', error.message);
            return false;
        }
    }

    async close() {
        if (this.isConnected) {
            await mongoose.connection.close();
            this.isConnected = false;
            console.log('Conexão MongoDB fechada');
        }
    }
}

module.exports = Database;

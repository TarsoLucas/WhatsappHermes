const { Pool } = require('pg');

class Database {
    constructor() {
        // Railway fornece DATABASE_URL automaticamente
        this.pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
        });
        
        console.log('Conexão com banco de dados configurada');
    }

    async query(text, params) {
        const client = await this.pool.connect();
        try {
            const result = await client.query(text, params);
            return result;
        } catch (error) {
            console.error('Erro na query:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    async testConnection() {
        try {
            const result = await this.query('SELECT NOW()');
            console.log('✅ Conexão com banco de dados OK:', result.rows[0]);
            return true;
        } catch (error) {
            console.error('❌ Erro ao conectar com banco:', error.message);
            return false;
        }
    }

    async close() {
        await this.pool.end();
        console.log('Conexão com banco de dados fechada');
    }
}

module.exports = Database;

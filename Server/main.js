const Server = require('./cmd/server');
const Database = require('./applications/database/connection');
const Migrations = require('./applications/database/migrations');
require('dotenv').config();


async function main() {
    // Railway define a PORT automaticamente, usar 8000 como fallback para desenvolvimento
    const port = process.env.PORT || 8000;
    const env = process.env.NODE_ENV || 'development';

    console.log(`Iniciando servidor na porta: ${port}, ambiente: ${env}`);

    // Inicializar banco de dados se DATABASE_URL estiver disponível
    if (process.env.DATABASE_URL) {
        console.log('🗄️ Configurando banco de dados...');
        try {
            const db = new Database();
            const isConnected = await db.testConnection();

            if (isConnected) {
                const migrations = new Migrations();
                await migrations.run();
                console.log('✅ Banco de dados configurado com sucesso!');
            }
        } catch (error) {
            console.error('❌ Erro ao configurar banco de dados:', error.message);
            console.log('⚠️ Continuando sem banco de dados...');
        }
    } else {
        console.log('⚠️ DATABASE_URL não encontrada, rodando sem banco de dados');
    }

    const server = new Server(port, env);
    await server.inicializar();
}

main().catch(error => {
    console.error('Erro ao iniciar a aplicação:', error);
    process.exit(1);
});
const Database = require('../applications/database/connection');
const Migrations = require('../applications/database/migrations');

async function setupDatabase() {
    try {
        console.log('🚀 Configurando banco de dados...');
        
        // Verificar se DATABASE_URL está configurada
        if (!process.env.DATABASE_URL) {
            console.error('❌ DATABASE_URL não configurada!');
            console.log('\n📋 Para configurar o banco de dados:');
            console.log('1. Acesse https://railway.app');
            console.log('2. Crie uma conta gratuita');
            console.log('3. Crie um novo projeto');
            console.log('4. Adicione PostgreSQL');
            console.log('5. Copie a DATABASE_URL das variáveis');
            console.log('6. Crie um arquivo .env na pasta Server com:');
            console.log('   DATABASE_URL=postgresql://...');
            console.log('\nOu use PostgreSQL local:');
            console.log('   DATABASE_URL=postgresql://usuario:senha@localhost:5432/whatsapp_hermes');
            process.exit(1);
        }

        const db = new Database();

        // Testar conexão
        console.log('🔌 Testando conexão...');
        const isConnected = await db.testConnection();
        if (!isConnected) {
            console.error('❌ Não foi possível conectar ao banco de dados');
            console.log('Verifique se a DATABASE_URL está correta');
            process.exit(1);
        }

        // Executar migrações
        console.log('📋 Executando migrações...');
        const migrations = new Migrations();
        await migrations.run();

        await db.close();
        console.log('\n🎉 Banco de dados configurado com sucesso!');
        console.log('Agora você pode executar: node scripts/importarContatos.js');

    } catch (error) {
        console.error('💥 Erro na configuração:', error);
        process.exit(1);
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    require('dotenv').config();
    setupDatabase();
}

module.exports = setupDatabase;

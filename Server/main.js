const Server = require('./cmd/server');
require('dotenv').config();


async function main() {
    // Railway define a PORT automaticamente, usar 8000 como fallback para desenvolvimento
    const port = process.env.PORT || 8000;
    const env = process.env.NODE_ENV || 'development';

    console.log(`Iniciando servidor na porta: ${port}, ambiente: ${env}`);

    const server = new Server(port, env);
    await server.inicializar();
}

main().catch(error => {
    console.error('Erro ao iniciar a aplicação:', error);
    process.exit(1);
});
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const routes = require('../http/routes/paths');

class Server {
    constructor(port, env) {
        this.app = express();
        this.port = port;
        console.log("Iniciando servidor...");
        
        // Criar diretório temporário se não existir
        const tempDir = require('path').join(__dirname, '../../temp');
        if (!require('fs').existsSync(tempDir)) {
            require('fs').mkdirSync(tempDir, { recursive: true });
            console.log(`Diretório temporário criado: ${tempDir}`);
        }
    }

    _setupRequestLogger() {
        const requestLogger = (req, res, next) => {
            const timestamp = new Date().toISOString();
            console.log(`[${timestamp}] ${req.method} ${req.url}`);
            next();
        };
        this.app.use(requestLogger);
    }

    _setupMiddlewares() {
        this._setupRequestLogger();
        this.app.use(cors());
        
        // Aumentar o limite de tamanho do corpo da requisição para 50MB
        this.app.use(express.json({ limit: '50mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '50mb' }));
    }

    _setupErrorHandler() {
        this.app.use((err, req, res, next) => {
            console.error(`[Erro] ${err.stack}`);
            res.status(500).json({
                error: 'Erro interno do servidor',
                message: this.env === 'development' ? err.message : undefined
            });
        });
    }

    _setupRoutes() {
        // API routes
        this.app.use('/', routes);

        // Servir arquivos estáticos do React (apenas em produção)
        if (process.env.NODE_ENV === 'production') {
            const clientBuildPath = path.join(__dirname, '../../Client/build');
            this.app.use(express.static(clientBuildPath));

            // Catch all handler: enviar index.html para qualquer rota não-API
            this.app.get('*', (req, res) => {
                res.sendFile(path.join(clientBuildPath, 'index.html'));
            });
        }
    }

    _setupGracefulShutdown(server) {
        const gracefulShutdown = () => {
            console.log('Iniciando desligamento gracioso do servidor...');
            server.close(() => {
                console.log('Servidor encerrado com sucesso');
                process.exit(0);
            });

            setTimeout(() => {
                console.error('Não foi possível encerrar o servidor graciosamente, forçando encerramento');
                process.exit(1);
            }, process.env.SHUTDOWN_TIMEOUT || 10000);
        };

        process.on('SIGTERM', gracefulShutdown);
        process.on('SIGINT', gracefulShutdown);
    }

    async inicializar() {
        try {
            this._setupMiddlewares();
            this._setupRoutes();
            this._setupErrorHandler();

            // Inicia o servidor
            const serverPort = this.app.listen(this.port, () => {
                console.log(`Servidor rodando em http://localhost:${this.port}`);
            });

            serverPort.on('error', (error) => {
                if (error.code === 'EADDRINUSE') {
                    console.error(`Porta ${this.port} já está em uso`);
                    process.exit(1);
                } else {
                    console.error('Erro ao iniciar o servidor:', error);
                    process.exit(1);
                }
            });

            this._setupGracefulShutdown(serverPort);

            return serverPort;
        } catch (error) {
            console.error('Erro ao inicializar o servidor:', error);
            process.exit(1);
        }
    }
}

module.exports = Server; 

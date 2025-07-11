const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const path = require('path');

class WhatsappConnection {
    constructor() {
        // Configurações para produção (Railway)
        const clientOptions = {
            // Configurar LocalAuth para persistência de sessão
            authStrategy: new LocalAuth({
                clientId: "hermes-session",
                dataPath: path.join(__dirname, '../../../session_data')
            })
        };

        if (process.env.NODE_ENV === 'production') {
            clientOptions.puppeteer = {
                headless: 'new',
                executablePath: '/usr/bin/google-chrome-stable',
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-gpu',
                    '--no-first-run',
                    '--disable-extensions',
                    '--disable-default-apps'
                ]
            };

            // Configurações mais conservadoras
            clientOptions.authTimeoutMs = 0; // Sem timeout
            clientOptions.takeoverOnConflict = false;
        }

        this._client = new Client(clientOptions);
        this._isReady = false;
    }

    async iniciaSecao() {
        if (this._isReady) return Promise.resolve(this);

        try {
            console.log('Iniciando cliente WhatsApp...');

            // Evento para quando a sessão é carregada (não precisa de QR)
            this._client.on('authenticated', () => {
                console.log('✅ Sessão autenticada! Carregando dados salvos...');
            });

            // Evento para quando precisa de QR Code
            this._client.on('qr', (qr) => {
                console.log('📱 QR Code recebido - Escaneie para autenticar');
                qrcode.generate(qr, {small: true});
                this._lastQR = qr;
            });

            // Evento para quando o cliente está pronto
            this._client.on('ready', () => {
                console.log('🚀 Cliente WhatsApp está pronto!');
                this._isReady = true;
            });

            // Evento para desconexão
            this._client.on('disconnected', (reason) => {
                console.log('❌ Cliente WhatsApp foi desconectado:', reason);
                this._isReady = false;
            });

            // Evento para falha de autenticação
            this._client.on('auth_failure', (msg) => {
                console.error('❌ Falha na autenticação:', msg);
            });

            await this._client.initialize();
            return this;

        } catch (error) {
            console.error('Erro na inicialização:', error);
            throw error;
        }
    }

    getLastQR() {
        return this._lastQR;
    }

    isReady() {
        return this._isReady;
    }

    getClient() {
        return this._client;
    }
}

module.exports = WhatsappConnection;
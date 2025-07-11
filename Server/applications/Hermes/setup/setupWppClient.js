const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

class WhatsappConnection {
    constructor() {
        // Configurações para produção (Railway)
        const clientOptions = {};

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

            this._client.on('qr', (qr) => {
                console.log('QR Code recebido');
                qrcode.generate(qr, {small: true});
                this._lastQR = qr;
            });

            this._client.on('ready', () => {
                console.log('Cliente WhatsApp está pronto!');
                this._isReady = true;
            });

            this._client.on('disconnected', () => {
                console.log('Cliente WhatsApp foi desconectado');
                this._isReady = false;
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
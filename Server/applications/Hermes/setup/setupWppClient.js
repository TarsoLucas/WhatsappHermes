const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

class WhatsappConnection {
    constructor() {
        // Configurações para produção (Railway)
        const clientOptions = {};

        if (process.env.NODE_ENV === 'production') {
            clientOptions.puppeteer = {
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--single-process',
                    '--disable-gpu',
                    '--disable-web-security',
                    '--disable-features=VizDisplayCompositor',
                    '--disable-background-timer-throttling',
                    '--disable-backgrounding-occluded-windows',
                    '--disable-renderer-backgrounding'
                ],
                timeout: 60000
            };

            // Configurações adicionais para WhatsApp Web.js
            clientOptions.authTimeoutMs = 60000;
            clientOptions.takeoverOnConflict = true;
            clientOptions.takeoverTimeoutMs = 60000;
        }

        this._client = new Client(clientOptions);
        this._isReady = false;
    }

    async iniciaSecao() {
        if (this._isReady) return Promise.resolve(this);

        return new Promise((resolve, reject) => {
            // Timeout personalizado para produção
            const timeout = process.env.NODE_ENV === 'production' ? 120000 : 60000;

            const timeoutId = setTimeout(() => {
                reject(new Error('Timeout na inicialização do WhatsApp Web'));
            }, timeout);

            this._client.once('ready', () => {
                console.log('Cliente WhatsApp está pronto!');
                clearTimeout(timeoutId);
                this._isReady = true;
                resolve(this);
            });

            this._client.on('qr', (qr) => {
                console.log('QR RECEIVED');
                qrcode.generate(qr, {small: true});
                this._lastQR = qr;
            });

            this._client.on('disconnected', () => {
                console.log('Cliente WhatsApp foi desconectado');
                this._isReady = false;
            });

            this._client.on('auth_failure', (msg) => {
                console.error('Falha na autenticação:', msg);
                clearTimeout(timeoutId);
                reject(new Error('Falha na autenticação: ' + msg));
            });

            this._client.initialize().catch((error) => {
                console.error('Erro na inicialização:', error);
                clearTimeout(timeoutId);
                reject(error);
            });
        });
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
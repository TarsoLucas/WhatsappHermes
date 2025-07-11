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
                    '--disable-gpu'
                ]
            };
        }

        this._client = new Client(clientOptions);
        this._isReady = false;
    }

    async iniciaSecao() {
        if (this._isReady) return Promise.resolve(this);
        
        return new Promise((resolve, reject) => {
            this._client.once('ready', () => {
                console.log('Cliente WhatsApp está pronto!');
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
            
            this._client.initialize().catch(reject);
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
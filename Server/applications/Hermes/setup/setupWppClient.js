const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

class WhatsappConnection {
    constructor() {
        this._client = new Client();
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
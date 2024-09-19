const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client();

function iniciaSecao() {
    client.once('ready', () => {
        console.log('Cliente WhatsApp está pronto!');
    });
    
    client.on('qr', (qr) => {
        console.log('QR RECEIVED', qr);
    });
    
    client.on('qr', qr => {
        qrcode.generate(qr, {small: true});
    });
    
    client.initialize();
}

function escreveClient() {
    console.log("bateu aqui - escreve client");

    if (client.info) {
        console.log(client);
    }
}

module.exports = { iniciaSecao, escreveClient };
const express = require('express');
const pegarContatos = require('./pegarContatos');
const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const app = express();
const port = 4000;

const client = new Client();

let contatos = [];
let qrCodeBase64 = '';

async function listChats() {
    try {
        const chats = await client.getChats();
        console.log('Chats disponíveis:');
        chats.forEach(chat => {
            console.log(`ID: ${chat.id._serialized}, Nome: ${chat.name || 'Sem nome'}, Tipo: ${chat.isGroup ? 'Grupo' : 'Indivíduo'}`);
        });
    } catch (err) {
        console.error('Erro ao obter chats:', err);
    }
}

// Evento quando o cliente está pronto
client.once('ready', () => {
    console.log('Cliente WhatsApp está pronto!');
});

client.on('ready', listChats)

client.on('qr', (qr) => {
    console.log('QR RECEIVED', qr);
});

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.initialize();

app.get('/listacontatos', (req, res) => {
    contatos = pegarContatos('contatosTeste.txt');
    res.json(contatos);

    // Envia a mensagem "teste" para todos os contatos após a lista ser obtida
    if (contatos && contatos.length > 0) {
        const mensagem = "teste";
        contatos.forEach(numero => {
            client.sendMessage(`${numero}@c.us`, mensagem).then(response => {
                console.log(`Mensagem enviada com sucesso para ${numero}:`, response);
            }).catch(err => {
                console.error(`Erro ao enviar mensagem para ${numero}:`, err);
            });
        });
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});

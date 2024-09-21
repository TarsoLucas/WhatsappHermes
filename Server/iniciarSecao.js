const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client();
var chats, chatSummary

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

async function listaChats() {
    console.log("bateu aqui - lista Chats");

    try {
        chats = await client.getChats();
        chatSummary = chats.map(chat => {
            console.log(chat.name)
            if (chat.name === "Eu") {
                chat.sendMessage("aaa")
                    .then(() => console.log(`Mensagem enviada para ${chat.name} via listaChats`))
                    .catch(error => console.error(`Erro ao enviar mensagem para ${chat.name} via listaChats:`, error));
            }
            return chat.name
        });
        console.log(chatSummary)
        return chatSummary;
    } catch (error) {
        console.error("Erro ao listar chats: ", error);
        throw error;
    }
}

function enviaMensagem() {
    console.log("bateu aqui - envia msg")
        chats.forEach((chat) => {
            if (chat.name === "Chele") {
                chat.sendMessage(`Olá ${chat.name} sou um robo and I will haunt you 💟 😇`)
                    .then(() => console.log(`Mensagem enviada para ${chat.name} via enviaMsg`))
                    .catch(error => console.error(`Erro ao enviar mensagem para ${chat.name}: via enviaMsg`, error));
            }
        })
}

module.exports = { iniciaSecao, escreveClient, listaChats, enviaMensagem };
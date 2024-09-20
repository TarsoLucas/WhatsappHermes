const express = require('express');
const pegarContatos = require('./pegarContatos');
const { iniciaSecao, escreveClient, listaChats} = require('./iniciarSecao')

const app = express();
const port = 4000;

var contatos = [];

// async function listChats() {
//     console.log("entrou na funcao")
//     try {
//         console.log("entoru no try")
//         const chats = await client.getChats();
//         console.log('Chats disponíveis:');
//         chats.forEach(chat => {
//             console.log(`ID: ${chat.id._serialized}, Nome: ${chat.name || 'Sem nome'}, Tipo: ${chat.isGroup ? 'Grupo' : 'Indivíduo'}`);
//         });
//     } catch (err) {
//         console.error('Erro ao obter chats:', err);
//     }
// }

app.get('/iniciaSecao', (req, res) => {
    iniciaSecao();
    res.send('Iniciando secao..');
});

app.get('/testeClient', (req, res) => {
    escreveClient();
    res.send('jogou endpont teste');
});

app.get('/listaChats', (req, res) => {
    listaChats();
    res.send('jogou endpont listar chats');
});

app.get('/listacontatos', (req, res) => {
    contatos = pegarContatos('contatosTeste.txt');
    res.send(contatos.forEach((contato) => console.log("O telefone de", contato.nome, "é", contato.telefone)))
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
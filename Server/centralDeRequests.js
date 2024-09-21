const express = require('express');
const pegarContatos = require('./pegarContatos');
const { iniciaSecao, escreveClient, listaChats, enviaMensagem, enviaImagem} = require('./iniciarSecao')

const app = express();
const port = 4000;

var contatos = [];
var arquivoContatos = 'contatosTeste.txt'
var mensagem = `Olá pessoa sigo com testes 💟 😇`

app.get('/iniciaSecao', (req, res) => {
    iniciaSecao();
    res.send('Iniciando secao..');
});

app.get('/testeClient', (req, res) => {
    escreveClient();
    res.send('jogou endpont teste');
});

app.get('/listaChats', (req, res) => {
    let chatSummary = listaChats();
    res.send(chatSummary);
});

app.get('/enviaMensagem', (req, res) => {
    console.log(contatos[0], mensagem)
    if(contatos && mensagem) {
        enviaMensagem(contatos, mensagem);
    }
    res.send('jogou endpont listar chats');
});

app.get('/enviaImagem', (req, res) => {
    enviaImagem();

    res.send('jogou endpont listar chats');
});

app.get('/listacontatos', (req, res) => {
    contatos = pegarContatos(arquivoContatos);
    res.send(contatos.map((contato) => {
        console.log("O telefone de", contato.nome, "é", contato.telefone); 
        return contato
    }))
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
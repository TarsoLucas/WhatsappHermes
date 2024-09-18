const fs = require('fs')
const path = require('path')

const caminhoArquivo = path.join(__dirname, 'contatosTeste.txt')

const contatos = fs.readFileSync(caminhoArquivo, 'utf8')

contato = contatos.split("\n")
telefone = null //construa uma forma de retornar os telefones em grupo e individualmente.

console.log(contatos)
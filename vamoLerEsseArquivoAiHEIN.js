const fs = require('fs')
const path = require('path')

const caminhoArquivo = path.join(__dirname, 'contatosEx.txt')

const contatos = fs.readFileSync(caminhoArquivo, 'utf8')

var telefone
var nome
contato = contatos.split("\n")
console.log(typeof(contato))
contato.forEach((contato) => {
    let hifen = contato.indexOf("-")
    nome = contato.slice(0, hifen-1)
    telefone = contato.slice(hifen+1)
})


console.log(nome, telefone)
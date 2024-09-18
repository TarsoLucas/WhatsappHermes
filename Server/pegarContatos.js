const fs = require('fs')
const path = require('path')

function pegarContatos(arquivoContatos) {
    const caminhoArquivo = path.join(__dirname, arquivoContatos)

    const todosContatos = fs.readFileSync(caminhoArquivo, 'utf8')
    
    let contatos = todosContatos.split("\n")
    
    contatos.forEach(contato => {
        console.log(contato)
    });
}

module.exports = pegarContatos 
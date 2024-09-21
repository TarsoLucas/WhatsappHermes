const fs = require('fs')
const path = require('path')

function pegarContatos(arquivoContatos) {
    const caminhoArquivo = path.join(__dirname, arquivoContatos)

    const contatos = fs.readFileSync(caminhoArquivo, 'utf8')
    
    var telefone, nome
    var listaContatos = []

    contatosObjeto = contatos.split("\n")

    contatosObjeto.forEach((contato) => {
        let hifen = contato.indexOf("-")
        nome = contato.slice(0, hifen-1).trim()
        telefone = contato.slice(hifen+1).trim()

        listaContatos.push({ nome, telefone });
    })

    return listaContatos
}

module.exports = pegarContatos 
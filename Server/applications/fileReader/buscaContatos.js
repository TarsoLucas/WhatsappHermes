const fs = require('fs').promises
const path = require('path')

let osContatos = '../../../contatosTeste.txt'

async function buscaContatos(arquivoContatos) {
    var listaContatos = []

    const caminhoArquivo = path.join(__dirname, arquivoContatos)
    try{
        const contatos = await fs.readFile(caminhoArquivo, 'latin1')

        nomeTelefone = contatos.split("\n")
        nomeTelefone.forEach((contato) => {
            contatoTuple = contato.replace(/\r/g, '').split(',')
            nome = contatoTuple[0]
            telefone = contatoTuple[1]
            listaContatos.push({nome, telefone})
        })
        return listaContatos
    }
    catch (err) {
        console.error('Erro ao ler arquivo:', err)
    }
}

//console.log(buscaContatos(osContatos))

module.exports = { buscaContatos } 
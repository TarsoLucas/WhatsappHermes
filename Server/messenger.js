const express = require('express')
const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs')
const path = require('path')

const app = express();
const port = 4000;
app.use(cors());

(async function openWhatsAppWeb() {
    let driver = await new Builder().forBrowser('chrome').build();

    let options = new chrome.Options();
    options.addArguments('headless');
    options.addArguments('disable-gpu');
    options.addArguments('window-size=1280x800');

    try {
        await driver.get('https://web.whatsapp.com');
        await driver.wait(until.elementLocated(By.css('canvas')), 30000);
        console.log('WhatsApp Web foi carregado com sucesso. Por favor, escaneie o QR code para continuar.');

        const barraPesquisa = await driver.wait(until.elementLocated(By.className('selectable-text copyable-text x15bjb6t x1n2onr6')), 60000);

        console.log(barraPesquisa)

        await barraPesquisa.click()
        await barraPesquisa.sendKeys('Pessoa1')

        const pessoa1 = await driver.wait(until.elementLocated(By.className('blabla')), 60000);

        await pessoa1.click()

        const botaozinhoClips = await driver.wait(until.elementLocated(By.className('alguma coisa')))

        await botaozinhoClips.click()

        const boatozinhoFoto = await driver.wait(until.elementLocated(By.className('alguma coisa')))

        await boatozinhoFoto.click()

        const campoTextoNaFoto = await driver.wait(until.elementLocated(By.className('alguma coisa')))

        await campoTextoNaFoto.click()
        await campoTextoNaFoto.sendKeys('msg qualquer')

        const botaoEnviar = await driver.wait(until.elementLocated(By.className('alguma coisa')))

        await botaoEnviar.click();

    } catch (err) {
        console.error('Erro ao abrir o WhatsApp Web:', err);
    }
    }
)();

function pegarContatos(arquivoContatos) {
    const caminhoArquivo = path.join(__dirname, arquivoContatos)

    const todosContatos = fs.readFileSync(caminhoArquivo, 'utf8')
    
    let contatos = todosContatos.split("\n")
    
    contatos.forEach(contato => {
        console.log(contato)
    });
}

app.get('/listacontatos', (req, res) => {
    const contatos = pegarContatos('nome do arquivo de contatos');
    res.json(contatos);
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});


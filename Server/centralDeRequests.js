const express = require('express')
const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const contatos = require('./pegarContatos')
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

    } catch (err) {
        console.error('Erro ao abrir o WhatsApp Web:', err);
    }
    }
)();

app.get('/listacontatos', (req, res) => {
    contatos('nome do arquivo de contatos');
    res.json(contatos);
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});


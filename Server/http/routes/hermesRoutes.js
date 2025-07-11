const express = require('express');
const router = express.Router();
const WhatsappConnection = require('../../applications/Hermes/setup/setupWppClient');
const Hermes = require('../../applications/Hermes/hermesAcoes/sendMessages');
const QRCode = require('qrcode');

let hermes;
let whatsappConnection;

router.get('/iniciarSessao', async (req, res) => {
    try {
        // Verificar se já existe uma conexão ativa
        if (whatsappConnection && whatsappConnection.isReady()) {
            return res.json({ status: 'ready' });
        }
        
        // Criar nova conexão
        whatsappConnection = new WhatsappConnection();
        
        // Flag para controlar se a resposta já foi enviada
        let responseHasBeenSent = false;
        
        // Função para enviar resposta apenas uma vez
        const sendResponseOnce = (data) => {
            if (!responseHasBeenSent) {
                res.json(data);
                responseHasBeenSent = true;
            }
        };
        
        // Configurar listener para o QR code
        whatsappConnection.getClient().on('qr', async (qr) => {
            try {
                // Converter o QR code em uma imagem base64
                const qrCodeImage = await QRCode.toDataURL(qr);
                
                // Armazenar o QR code para uso posterior
                whatsappConnection._lastQR = qrCodeImage;
                
                // Enviar resposta apenas se ainda não foi enviada
                sendResponseOnce({ qrCode: qrCodeImage, status: 'pending' });
            } catch (error) {
                console.error('Erro ao gerar QR code:', error);
                if (!responseHasBeenSent) {
                    sendResponseOnce({ error: 'Erro ao gerar QR code' });
                }
            }
        });
        
        // Listener para quando o cliente estiver pronto
        whatsappConnection.getClient().once('ready', () => {
            console.log('Cliente WhatsApp está pronto!');
            
            // Atualizar o status da conexão
            whatsappConnection._isReady = true;
            
            // Pequeno atraso para garantir que a propriedade foi atualizada
            setTimeout(() => {
                try {
                    hermes = new Hermes(whatsappConnection);
                    console.log('Hermes inicializado com sucesso');
                } catch (error) {
                    console.error('Erro ao inicializar Hermes:', error);
                }
            }, 100);
        });
        
        // Iniciar a sessão
        whatsappConnection.iniciaSecao().catch(error => {
            console.error('Erro ao iniciar sessão:', error);
            if (!responseHasBeenSent) {
                sendResponseOnce({ error: 'Erro ao iniciar sessão: ' + error.message });
            }
        });
        
        // Timeout para caso o QR code não seja gerado
        setTimeout(() => {
            if (!responseHasBeenSent) {
                sendResponseOnce({ error: 'Timeout ao gerar QR code' });
            }
        }, 50000);
        
    } catch (error) {
        console.error('Erro ao iniciar sessão:', error);
        res.status(500).json({ error: 'Erro ao iniciar sessão: ' + error.message });
    }
});

// Adicionar um novo endpoint para verificar o status da conexão
router.get('/statusConexao', (req, res) => {
    if (!whatsappConnection) {
        return res.json({ status: 'not_initialized' });
    }
    
    res.json({ 
        status: whatsappConnection.isReady() ? 'ready' : 'pending',
        qrCode: whatsappConnection.getLastQR()
    });
});

router.post('/enviaMensagem', (req, res) => {   
    if (!req.body.contatos || !req.body.mensagem) {
        return res.status(400).send('Contatos ou mensagem não definidos');
    }
    
    if (!whatsappConnection || !whatsappConnection.isReady()) {
        return res.status(400).send('Conexão WhatsApp não está pronta. Inicie a sessão primeiro.');
    }
    
    if (!hermes) {
        try {
            hermes = new Hermes(whatsappConnection);
        } catch (error) {
            return res.status(500).send('Erro ao criar instância do Hermes: ' + error.message);
        }
    }
    
    try {
        hermes.enviaMensagem(req.body.contatos, req.body.mensagem);
        res.send('Mensagem enviada com sucesso');
    } catch (error) {
        res.status(500).send('Erro ao enviar mensagem: ' + error.message);
    }
});

router.post('/enviaImagem', (req, res) => { 
    console.log("Recebendo solicitação para enviar imagem");
    
    // Verificar se os campos necessários estão presentes
    if (!req.body.contatos) {
        console.error("Contatos não definidos");
        return res.status(400).send('Contatos não definidos');
    }
    
    if (req.body.mensagem === undefined) {
        console.error("Mensagem não definida");
        return res.status(400).send('Mensagem não definida');
    }
    
    if (!req.body.mediaPath) {
        console.error("mediaPath não definido");
        return res.status(400).send('Imagem não definida (mediaPath)');
    }
    
    if (!whatsappConnection || !whatsappConnection.isReady()) {
        console.error("Conexão WhatsApp não está pronta");
        return res.status(400).send('Conexão WhatsApp não está pronta. Inicie a sessão primeiro.');
    }
    
    if (!hermes) {
        try {
            console.log("Criando nova instância do Hermes");
            hermes = new Hermes(whatsappConnection);
        } catch (error) {
            console.error("Erro ao criar instância do Hermes:", error);
            return res.status(500).send('Erro ao criar instância do Hermes: ' + error.message);
        }
    }
    
    try {
        // Verificar se a imagem é base64 ou caminho de arquivo
        if (req.body.mediaPath && req.body.mediaPath.startsWith('data:')) {
            console.log("Processando imagem base64");
            // É uma string base64
            const matches = req.body.mediaPath.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
            
            if (!matches || matches.length !== 3) {
                console.error("Formato de imagem base64 inválido");
                return res.status(400).send('Formato de imagem base64 inválido');
            }
            
            const type = matches[1];
            const data = matches[2];
            console.log(`Tipo de imagem: ${type}, Tamanho dos dados: ${data.length} caracteres`);
            
            const buffer = Buffer.from(data, 'base64');
            
            // Criar um arquivo temporário
            const tempFilePath = require('path').join(__dirname, '../../../temp', `image_${Date.now()}.jpg`);
            require('fs').writeFileSync(tempFilePath, buffer);
            
            console.log(`Imagem salva temporariamente em: ${tempFilePath}`);
            
            // Enviar a imagem
            hermes.enviaImagem(req.body.contatos, req.body.mensagem, tempFilePath);
            
            // Remover o arquivo temporário após um tempo
            setTimeout(() => {
                try {
                    require('fs').unlinkSync(tempFilePath);
                    console.log(`Arquivo temporário removido: ${tempFilePath}`);
                } catch (err) {
                    console.error(`Erro ao remover arquivo temporário: ${err.message}`);
                }
            }, 5000);
            
            res.send('Imagem enviada com sucesso');
        } else if (req.body.mediaPath) {
            console.log("Processando caminho de arquivo:", req.body.mediaPath);
            // É um caminho de arquivo
            hermes.enviaImagem(req.body.contatos, req.body.mensagem, req.body.mediaPath);
            res.send('Imagem enviada com sucesso');
        } else {
            console.error("Imagem não definida");
            return res.status(400).send('Imagem não definida');
        }
    } catch (error) {
        console.error('Erro ao enviar imagem:', error);
        res.status(500).send('Erro ao enviar imagem: ' + error.message);
    }
});

// Rota para enviar mensagem com botões
router.post('/enviaMensagemComBotoes', (req, res) => {
    console.log("Recebendo solicitação para enviar mensagem com botões");
    console.log("Dados recebidos:", req.body);
    
    if (!req.body.contatos || !req.body.mensagem || !req.body.botoes) {
        console.error("Dados incompletos:", { 
            temContatos: !!req.body.contatos, 
            temMensagem: !!req.body.mensagem, 
            temBotoes: !!req.body.botoes 
        });
        return res.status(400).send('Contatos, mensagem ou botões não definidos');
    }
    
    if (!whatsappConnection || !whatsappConnection.isReady()) {
        console.error("Conexão WhatsApp não está pronta");
        return res.status(400).send('Conexão WhatsApp não está pronta. Inicie a sessão primeiro.');
    }
    
    if (!hermes) {
        try {
            console.log("Criando nova instância do Hermes");
            hermes = new Hermes(whatsappConnection);
        } catch (error) {
            console.error("Erro ao criar instância do Hermes:", error);
            return res.status(500).send('Erro ao criar instância do Hermes: ' + error.message);
        }
    }
    
    try {
        console.log("Enviando mensagem com botões");
        hermes.enviaMensagemComBotoes(req.body.contatos, req.body.mensagem, req.body.botoes);
        console.log("Mensagem com botões enviada com sucesso");
        res.send('Mensagem com botões enviada com sucesso');
    } catch (error) {
        console.error("Erro ao enviar mensagem com botões:", error);
        res.status(500).send('Erro ao enviar mensagem com botões: ' + error.message);
    }
});

// Rota para enviar mensagem com template
router.post('/enviaMensagemComTemplate', (req, res) => {
    console.log("Recebendo solicitação para enviar mensagem com template");
    console.log("Dados recebidos:", req.body);
    
    if (!req.body.contatos || !req.body.mensagem || !req.body.botoes) {
        console.error("Dados incompletos");
        return res.status(400).send('Contatos, mensagem ou botões não definidos');
    }
    
    if (!whatsappConnection || !whatsappConnection.isReady()) {
        console.error("Conexão WhatsApp não está pronta");
        return res.status(400).send('Conexão WhatsApp não está pronta. Inicie a sessão primeiro.');
    }
    
    if (!hermes) {
        try {
            console.log("Criando nova instância do Hermes");
            hermes = new Hermes(whatsappConnection);
        } catch (error) {
            console.error("Erro ao criar instância do Hermes:", error);
            return res.status(500).send('Erro ao criar instância do Hermes: ' + error.message);
        }
    }
    
    try {
        console.log("Enviando mensagem com template");
        hermes.enviaMensagemComTemplate(req.body.contatos, req.body.mensagem, req.body.botoes);
        console.log("Mensagem com template enviada com sucesso");
        res.send('Mensagem com template enviada com sucesso');
    } catch (error) {
        console.error("Erro ao enviar mensagem com template:", error);
        res.status(500).send('Erro ao enviar mensagem com template: ' + error.message);
    }
});

module.exports = router; 

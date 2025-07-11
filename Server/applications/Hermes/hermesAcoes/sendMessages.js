const { MessageMedia } = require('whatsapp-web.js');

class Hermes {
    constructor(whatsappConnection) {
        if (!whatsappConnection) {
            throw new Error('Conexão WhatsApp é necessária para inicializar o Hermes');
        }
        
        if (!whatsappConnection.isReady()) {
            throw new Error('Conexão WhatsApp não está pronta');
        }

        this.client = whatsappConnection.getClient();
    }

    enviaMensagem(listaContatos, message) {
        if (!listaContatos || !Array.isArray(listaContatos) || listaContatos.length === 0) {
            throw new Error("Lista de contatos inválida ou vazia");
        }

        if (!message || typeof message !== 'string' || message.trim() === '') {
            throw new Error("Mensagem inválida ou vazia");
        }

        listaContatos.forEach((contato) => {    
            this.client.sendMessage(contato.id, message)
            .then(() => console.log(`message enviada para ${contato.name} via enviaMsg`))
            .catch(error => console.error(`Erro ao enviar message para ${contato.name}: via enviaMsg`, error));
        });
    }

    enviaImagem(listaContatos, message, mediaPath) {
        if (!listaContatos || !Array.isArray(listaContatos) || listaContatos.length === 0) {
            throw new Error("Lista de contatos inválida ou vazia");
        }

        // Permitir mensagem vazia ao enviar imagem
        if (message === undefined) {
            message = ""; // Definir como string vazia se for undefined
        }

        if (typeof message !== 'string') {
            throw new Error("Mensagem deve ser uma string");
        }

        if (!mediaPath) {
            throw new Error("Caminho da mídia não fornecido");
        }

        try {
            const mediaFile = MessageMedia.fromFilePath(mediaPath);
            
            listaContatos.forEach((contato) => {
                this.client.sendMessage(contato.id, mediaFile, { caption: message })
                    .then(() => console.log(`Imagem enviada para ${contato.name}`))
                    .catch(error => console.error(`Erro ao enviar imagem para ${contato.name}:`, error));
            });
        } catch (error) {
            console.error("Erro ao processar imagem:", error);
            throw error;
        }
    }

    enviaMensagemComBotoes(listaContatos, message, buttons) {
        if (!listaContatos || !Array.isArray(listaContatos) || listaContatos.length === 0) {
            throw new Error("Lista de contatos inválida ou vazia");
        }

        if (!message || typeof message !== 'string' || message.trim() === '') {
            throw new Error("Mensagem inválida ou vazia");
        }

        if (!buttons || !Array.isArray(buttons) || buttons.length === 0) {
            throw new Error("Lista de botões inválida ou vazia");
        }

        try {
            console.log("Preparando mensagem com botões:", {
                contatos: listaContatos,
                mensagem: message,
                botoes: buttons
            });
            
            // Importar a classe Buttons do whatsapp-web.js
            const { Buttons } = require('whatsapp-web.js');
            
            listaContatos.forEach((contato) => {
                // Criar botões no formato correto
                const buttonOptions = {
                    body: message,
                    footer: 'Enviado via WhatsApp Hermes',
                    buttons: buttons.map(btn => ({ body: btn.body })),
                    // Se houver URLs, adicionar como texto na mensagem
                    headerText: buttons.some(btn => btn.url) ? 'Links disponíveis:' : undefined
                };
                
                // Adicionar URLs como texto se existirem
                if (buttons.some(btn => btn.url)) {
                    buttonOptions.body += '\n\n' + buttons
                        .filter(btn => btn.url)
                        .map(btn => `${btn.body}: ${btn.url}`)
                        .join('\n');
                }
                
                // Criar objeto Buttons
                const buttonsMessage = new Buttons(
                    buttonOptions.body,
                    buttonOptions.buttons,
                    buttonOptions.headerText,
                    buttonOptions.footer
                );
                
                console.log(`Enviando mensagem com botões para ${contato.name}:`, buttonsMessage);
                
                // Enviar mensagem com botões
                this.client.sendMessage(contato.id, buttonsMessage)
                    .then(() => console.log(`Mensagem com botões enviada para ${contato.name}`))
                    .catch(error => {
                        console.error(`Erro ao enviar mensagem com botões para ${contato.name}:`, error);
                        
                        // Fallback: enviar como texto normal com links
                        const fallbackMessage = `${message}\n\n${buttons.map(btn => `• ${btn.body}: ${btn.url || ''}`).join('\n')}`;
                        console.log(`Tentando enviar como texto normal: ${fallbackMessage}`);
                        
                        this.client.sendMessage(contato.id, fallbackMessage)
                            .then(() => console.log(`Mensagem de fallback enviada para ${contato.name}`))
                            .catch(fallbackError => console.error(`Erro ao enviar mensagem de fallback para ${contato.name}:`, fallbackError));
                    });
            });
        } catch (error) {
            console.error("Erro ao enviar mensagem com botões:", error);
            throw error;
        }
    }

    enviaMensagemComLista(listaContatos, message, title, buttonText, sections) {
        if (!listaContatos || !Array.isArray(listaContatos) || listaContatos.length === 0) {
            throw new Error("Lista de contatos inválida ou vazia");
        }

        if (!message || typeof message !== 'string' || message.trim() === '') {
            throw new Error("Mensagem inválida ou vazia");
        }

        if (!sections || !Array.isArray(sections) || sections.length === 0) {
            throw new Error("Lista de seções inválida ou vazia");
        }

        try {
            listaContatos.forEach((contato) => {
                // Criar objeto de lista no formato esperado pelo WhatsApp
                const listMessage = {
                    body: message,
                    buttonText: buttonText || 'Ver opções',
                    sections: sections,
                    title: title || 'Opções disponíveis',
                    footer: 'Enviado via WhatsApp Hermes'
                };

                this.client.sendMessage(contato.id, listMessage)
                    .then(() => console.log(`Mensagem com lista enviada para ${contato.name}`))
                    .catch(error => console.error(`Erro ao enviar mensagem com lista para ${contato.name}:`, error));
            });
        } catch (error) {
            console.error("Erro ao enviar mensagem com lista:", error);
            throw error;
        }
    }

    enviaMensagemComTemplate(listaContatos, message, buttons) {
        if (!listaContatos || !Array.isArray(listaContatos) || listaContatos.length === 0) {
            throw new Error("Lista de contatos inválida ou vazia");
        }

        if (!message || typeof message !== 'string' || message.trim() === '') {
            throw new Error("Mensagem inválida ou vazia");
        }

        if (!buttons || !Array.isArray(buttons) || buttons.length === 0) {
            throw new Error("Lista de botões inválida ou vazia");
        }

        try {
            listaContatos.forEach((contato) => {
                // Criar uma mensagem de template
                const templateMessage = {
                    to: contato.id,
                    type: 'template',
                    template: {
                        namespace: '91cb9e9a_da8f_43e3_a41d_a2a2a2a2a2a2', // Substitua pelo seu namespace
                        name: 'sample_template', // Substitua pelo nome do seu template
                        language: {
                            code: 'pt_BR',
                            policy: 'deterministic'
                        },
                        components: [
                            {
                                type: 'body',
                                parameters: [
                                    {
                                        type: 'text',
                                        text: message
                                    }
                                ]
                            },
                            {
                                type: 'button',
                                sub_type: 'url',
                                index: 0,
                                parameters: [
                                    {
                                        type: 'text',
                                        text: buttons[0].body
                                    }
                                ]
                            }
                        ]
                    }
                };

                // Tentar enviar como template
                this.client.sendMessage(contato.id, templateMessage)
                    .then(() => console.log(`Template enviado para ${contato.name}`))
                    .catch(error => {
                        console.error(`Erro ao enviar template para ${contato.name}:`, error);
                        
                        // Fallback: enviar como texto normal com links
                        const fallbackMessage = `${message}\n\n${buttons.map(btn => `• ${btn.body}: ${btn.url}`).join('\n')}`;
                        console.log(`Tentando enviar como texto normal: ${fallbackMessage}`);
                        
                        this.client.sendMessage(contato.id, fallbackMessage)
                            .then(() => console.log(`Mensagem de fallback enviada para ${contato.name}`))
                            .catch(fallbackError => console.error(`Erro ao enviar mensagem de fallback para ${contato.name}:`, fallbackError));
                    });
            });
        } catch (error) {
            console.error("Erro ao enviar mensagem com template:", error);
            throw error;
        }
    }
}

module.exports = Hermes; 

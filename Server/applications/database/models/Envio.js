const mongoose = require('mongoose');

const envioSchema = new mongoose.Schema({
    contato_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contato',
        required: true
    },
    mensagem: {
        type: String,
        required: true
    },
    tipo: {
        type: String,
        enum: ['texto', 'imagem', 'documento'],
        default: 'texto'
    },
    status: {
        type: String,
        enum: ['enviado', 'erro', 'pendente'],
        default: 'enviado'
    },
    erro: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

// Índices para performance
envioSchema.index({ contato_id: 1 });
envioSchema.index({ createdAt: -1 });
envioSchema.index({ status: 1 });

const Envio = mongoose.model('Envio', envioSchema);

module.exports = Envio;

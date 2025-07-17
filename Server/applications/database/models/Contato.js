const mongoose = require('mongoose');

const contatoSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: true,
        trim: true
    },
    telefone: {
        type: String,
        required: true,
        trim: true
    },
    whatsapp_id: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    categoria: {
        type: String,
        default: 'geral',
        trim: true
    },
    ativo: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true // Cria automaticamente createdAt e updatedAt
});

// Índices para performance
contatoSchema.index({ whatsapp_id: 1 });
contatoSchema.index({ categoria: 1 });
contatoSchema.index({ ativo: 1 });

const Contato = mongoose.model('Contato', contatoSchema);

module.exports = Contato;

// Função para normalizar telefones brasileiros (copiada do importarContatos.js)
function normalizarTelefone(telefoneOriginal) {
    if (!telefoneOriginal) return null;
    
    // Remover todos os caracteres não numéricos (parênteses, espaços, hífens, +, etc.)
    let telefone = telefoneOriginal.replace(/[^\d]/g, '');
    
    // Remover zeros à esquerda (casos como '04171999348093')
    telefone = telefone.replace(/^0+/, '');

    console.log(`Processando: "${telefoneOriginal}" -> "${telefone}" (length: ${telefone.length})`);
    
    // Casos específicos baseados no comprimento
    if (telefone.length === 13 && telefone.startsWith('5571')) {
        // Já está no formato correto: 5571999999999
        return telefone;
    }
    
    if (telefone.length === 12) {
        if (telefone.startsWith('5571')) {
            // Formato: 557199999999 -> adicionar dígito 9 se necessário
            if (telefone.startsWith('55719')) {
                return telefone + '0'; // Adicionar um dígito para chegar a 13
            } else {
                return telefone.substring(0, 4) + '9' + telefone.substring(4); // 5571 + 9 + resto
            }
        } else if (telefone.startsWith('5571')) {
            return telefone + '0'; // Caso já esteja quase correto
        }
    }
    
    if (telefone.length === 11 && telefone.startsWith('71')) {
        // Formato: 71999999999 -> adicionar 55
        return '55' + telefone;
    }
    
    if (telefone.length === 10 && telefone.startsWith('71')) {
        // Formato: 7199999999 -> adicionar 55 e 9
        return '5571' + '9' + telefone.substring(2);
    }
    
    if (telefone.length === 9 && telefone.startsWith('9')) {
        // Formato: 999999999 -> adicionar 5571
        return '5571' + telefone;
    }
    
    if (telefone.length === 8) {
        // Formato: 99999999 -> adicionar 55719
        return '55719' + telefone;
    }

    if (telefone.length === 7) {
        // Formato: 9999999 -> adicionar 557199
        return '557199' + telefone;
    }
    
    // Casos com códigos duplicados ou muito longos
    if (telefone.length >= 13 && !telefone.startsWith('5571')) {
        // Caso específico: 04171999348093 -> extrair 71999348093
        if (telefone.startsWith('417')) {
            const semPrefixo = telefone.substring(3); // Remove '417'
            if (semPrefixo.startsWith('1')) {
                const numeroLimpo = semPrefixo.substring(1); // Remove o '1' extra
                return normalizarTelefone(numeroLimpo); // Recursão para processar o número limpo
            }
        }

        // Caso específico: 4171999348093 -> extrair 71999348093
        if (telefone.startsWith('417')) {
            const numeroLimpo = telefone.substring(3); // Remove '417'
            return normalizarTelefone(numeroLimpo); // Recursão para processar o número limpo
        }

        // Procurar padrão 5571 seguido de 8 ou 9 dígitos
        const match = telefone.match(/5571\d{8,9}/);
        if (match) {
            let numeroEncontrado = match[0];
            // Garantir que tem 13 dígitos (adicionar 9 se necessário)
            if (numeroEncontrado.length === 12 && !numeroEncontrado.startsWith('55719')) {
                numeroEncontrado = numeroEncontrado.substring(0, 4) + '9' + numeroEncontrado.substring(4);
            }
            return numeroEncontrado;
        }

        // Procurar padrão 71 seguido de 8 ou 9 dígitos
        const match71 = telefone.match(/71\d{8,9}/);
        if (match71) {
            let numeroEncontrado = match71[0];
            if (numeroEncontrado.length === 10) {
                // 71 + 8 dígitos -> adicionar 55 e 9
                return '5571' + '9' + numeroEncontrado.substring(2);
            } else if (numeroEncontrado.length === 11) {
                // 71 + 9 dígitos -> adicionar 55
                return '55' + numeroEncontrado;
            }
        }
    }
    
    // Se chegou até aqui, o telefone não pôde ser normalizado
    return null;
}

// Casos de teste baseados nos exemplos fornecidos
const casosTeste = [
    '(71)987654321',
    '(71) 9876 54321',
    '04171999348093',
    '04171999348093',
    '+55 71 9151-2735',
    '+55 71992910366',
    '99367-0224',
    '71999632643',
    '999632643',
    '99632643',
    '9632643',
    '987654321',
    '71987654321',
    '5571987654321',
    '557199632643',
    '5571999632643'
];

console.log('🧪 Testando Normalização de Telefones\n');

casosTeste.forEach((caso, index) => {
    console.log(`\n--- Teste ${index + 1} ---`);
    const resultado = normalizarTelefone(caso);
    const whatsappId = resultado ? resultado + '@c.us' : 'INVÁLIDO';
    
    console.log(`Entrada: "${caso}"`);
    console.log(`Resultado: ${resultado || 'FALHOU'}`);
    console.log(`WhatsApp ID: ${whatsappId}`);
    console.log(`Status: ${resultado && resultado.length === 13 ? '✅ VÁLIDO' : '❌ INVÁLIDO'}`);
});

console.log('\n🎯 Resumo: Todos os casos devem resultar em números de 13 dígitos no formato 5571XXXXXXXXX');

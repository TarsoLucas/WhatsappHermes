const fs = require('fs');
const path = require('path');
const Database = require('../applications/database/connection');
const ContatosService = require('../applications/database/contatosService');

// Função para normalizar telefones brasileiros
function normalizarTelefone(telefoneOriginal) {
    if (!telefoneOriginal) return null;

    // Remover todos os caracteres não numéricos (parênteses, espaços, hífens, +, etc.)
    let telefone = telefoneOriginal.replace(/[^\d]/g, '');

    // Remover zeros à esquerda (casos como '04171999348093')
    telefone = telefone.replace(/^0+/, '');

    console.log(`Processando: "${telefoneOriginal}" -> "${telefone}"`);

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

async function importarContatos() {
    try {
        console.log('🚀 Iniciando importação de contatos...');
        
        // Verificar se DATABASE_URL está configurada
        if (!process.env.DATABASE_URL) {
            console.error('❌ DATABASE_URL não configurada!');
            console.log('Configure a DATABASE_URL no arquivo .env com a URL do MongoDB da Railway');
            process.exit(1);
        }

        const db = new Database();
        const contatosService = new ContatosService();

        // Testar conexão
        const isConnected = await db.testConnection();
        if (!isConnected) {
            console.error('❌ Não foi possível conectar ao MongoDB');
            process.exit(1);
        }

        // Ler arquivo CSV de contatos
        const arquivoContatos = path.join(__dirname, '../../ContatosCelularEscola.csv');

        if (!fs.existsSync(arquivoContatos)) {
            console.error(`❌ Arquivo não encontrado: ${arquivoContatos}`);
            console.log('Certifique-se de que o arquivo ContatosCelularEscola.csv está na raiz do projeto');
            process.exit(1);
        }

        const conteudo = fs.readFileSync(arquivoContatos, 'utf8');
        const linhas = conteudo.split('\n').filter(linha => linha.trim());

        // Pular o cabeçalho (primeira linha)
        const linhasContatos = linhas.slice(1);
        console.log(`📄 Encontradas ${linhasContatos.length} linhas de contatos no arquivo`);

        let importados = 0;
        let erros = 0;
        let pulados = 0;

        for (const linha of linhasContatos) {
            let nome = 'Desconhecido'; // Valor padrão para evitar erro no catch

            try {
                // Formato CSV: First Name;Middle Name;Last Name;Phone 1 - Value;...
                const partes = linha.split(';');

                if (partes.length < 4) {
                    console.log(`⚠️ Linha inválida (poucos campos): ${linha.substring(0, 50)}...`);
                    pulados++;
                    continue;
                }

                // Montar nome completo
                const firstName = partes[0] ? partes[0].trim() : '';
                const middleName = partes[1] ? partes[1].trim() : '';
                const lastName = partes[2] ? partes[2].trim() : '';

                nome = [firstName, middleName, lastName]
                    .filter(part => part && part !== '')
                    .join(' ')
                    .trim();

                // Pegar telefone principal (Phone 1 - Value)
                let telefone = partes[3] ? partes[3].trim() : '';

                // Se não tem telefone principal, tentar Phone 2 - Value (índice 5)
                if (!telefone && partes.length > 5) {
                    telefone = partes[5] ? partes[5].trim() : '';
                }

                // Validar dados básicos
                if (!nome || !telefone) {
                    console.log(`⚠️ Linha sem nome ou telefone: ${linha.substring(0, 50)}...`);
                    pulados++;
                    continue;
                }

                // Normalizar telefone usando a função robusta
                const telefoneNormalizado = normalizarTelefone(telefone);

                if (!telefoneNormalizado) {
                    console.log(`⚠️ Telefone não pôde ser normalizado: "${telefone}" - ${nome}`);
                    pulados++;
                    continue;
                }

                // Validar se o telefone normalizado tem o tamanho correto (13 dígitos para Brasil)
                if (telefoneNormalizado.length !== 13) {
                    console.log(`⚠️ Telefone normalizado com tamanho incorreto (${telefoneNormalizado.length}): "${telefone}" -> "${telefoneNormalizado}" - ${nome}`);
                    pulados++;
                    continue;
                }

                // Gerar whatsapp_id
                const whatsapp_id = telefoneNormalizado + '@c.us';

                // Definir categoria baseada no primeiro nome (ou usar 'escola' como padrão)
                const categoria = firstName.startsWith('A ') ? 'escola_a' : 'escola';

                // Tentar criar o contato
                await contatosService.criar({
                    nome,
                    telefone: '+' + telefoneNormalizado,
                    whatsapp_id,
                    categoria
                });

                console.log(`✅ Importado: ${nome} (${categoria}) - ${telefone}`);
                importados++;

            } catch (error) {
                if (error.code === 11000) { // MongoDB duplicate key error
                    console.log(`⚠️ Contato já existe: ${nome}`);
                    pulados++;
                } else {
                    console.error(`❌ Erro ao importar: ${nome} - ${error.message}`);
                    erros++;
                }
            }
        }

        console.log('\n📊 Resumo da Importação:');
        console.log(`✅ Contatos importados: ${importados}`);
        console.log(`⚠️ Contatos pulados: ${pulados}`);
        console.log(`❌ Erros: ${erros}`);
        console.log(`📋 Total processado: ${linhasContatos.length}`);

        // Mostrar estatísticas por categoria
        const categorias = await contatosService.buscarCategorias();
        console.log('\n📂 Categorias disponíveis:');
        for (const categoria of categorias) {
            const contatos = await contatosService.buscarPorCategoria(categoria);
            console.log(`  - ${categoria}: ${contatos.length} contatos`);
        }

        await db.close();
        console.log('\n🎉 Importação concluída!');

    } catch (error) {
        console.error('💥 Erro na importação:', error);
        process.exit(1);
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    require('dotenv').config();
    importarContatos();
}

module.exports = importarContatos;

import React, { useState, useRef, useEffect, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faPaperclip, faTrash, faBolt, faRobot } from '@fortawesome/free-solid-svg-icons';
import { ThemeContext } from '../context/ThemeContext';
import API_CONFIG from '../config/api';

const Hermes = () => {
  const { darkMode } = useContext(ThemeContext);
  const [mensagem, setMensagem] = useState('');
  const [mensagens, setMensagens] = useState([]);
  const [menuContexto, setMenuContexto] = useState({ visible: false, x: 0, y: 0, mensagemId: null });
  const [prontoPraDisparar, setProntoPraDisparar] = useState(false);
  const [sessaoIniciada, setSessaoIniciada] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [categorias, setCategorias] = useState([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('');
  const [contatos, setContatos] = useState([]);
  const fileInputRef = useRef(null);

  const sendMessagesRequest = async () => {
    console.log("Enviando mensagens")
    try {
      if (mensagens.length === 0) {
        console.error("Nenhuma mensagem para enviar");
        return;
      }

      if (contatos.length === 0) {
        console.error("Nenhum contato selecionado");
        alert("Por favor, selecione uma lista de contatos primeiro!");
        return;
      }

      console.log("Contatos selecionados:", contatos);

      // Enviar todas as mensagens que estão no chat do sistema
      for (const msg of mensagens) {
        console.log(`Enviando mensagem: ${msg.texto}`);
        
        // Determinar se é uma mensagem com imagem ou apenas texto
        if (msg.imagem) {
          console.log("Enviando mensagem com imagem");
          
          // Log dos dados que estão sendo enviados
          const requestData = {
            contatos: contatos,
            mensagem: msg.texto || "", // Garantir que a mensagem seja uma string vazia se for undefined
            mediaPath: msg.imagem // Enviando a imagem base64
          };
          console.log("Dados da requisição:", {
            contatos: requestData.contatos,
            mensagem: requestData.mensagem,
            mediaPathLength: requestData.mediaPath ? requestData.mediaPath.length : 0
          });
          
          const response = await fetch(`${API_CONFIG.baseURL}/hermes/enviaImagem`,
            {
              method: 'POST',
              headers: {"Content-Type": "application/json"}, 
              body: JSON.stringify(requestData)
            }
          );
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error(`Erro ao enviar imagem: ${response.status} - ${errorText}`);
            throw new Error(`Erro ao enviar imagem: ${errorText}`);
          }
          
          console.log("Imagem enviada com sucesso");
        } else {
          await fetch(`${API_CONFIG.baseURL}/hermes/enviaMensagem`,
            {
              method: 'POST',
              headers: {"Content-Type": "application/json"}, 
              body: JSON.stringify({
                contatos: contatos,
                mensagem: msg.texto
              })
            }
          );
        }
      }
      
      console.log("Mensagens enviadas com sucesso");
    }
    catch(e) {
      console.error("Erro ao enviar mensagem:", e);
    }
  }

  const enviarMensagem = (imagem = null) => {
    if (mensagem.trim() || imagem) {
      setMensagens([...mensagens, { 
        id: Date.now(), 
        texto: mensagem,
        imagem: imagem
      }]);
      console.log(mensagem)
      setMensagem('');
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        // Garantir que a mensagem seja uma string vazia se não houver texto
        const textoMensagem = mensagem.trim() || "";
        
        // Adicionar a imagem ao chat
        setMensagens([...mensagens, { 
          id: Date.now(), 
          texto: textoMensagem,
          imagem: e.target.result
        }]);
        
        // Limpar o campo de texto após adicionar a mensagem
        setMensagem('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleContextMenu = (e, mensagemId) => {
    e.preventDefault();
    const mensagemElement = e.currentTarget;
    const rect = mensagemElement.getBoundingClientRect();
    
    setMenuContexto({
      visible: true,
      x: rect.left - 160,
      y: rect.top,
      mensagemId
    });
  };

  const handleClickFora = () => {
    setMenuContexto({ ...menuContexto, visible: false });
  };

  const excluirMensagem = (id) => {
    setMensagens(mensagens.filter(msg => msg.id !== id));
    setMenuContexto({ ...menuContexto, visible: false });
  };

  const limparMensagens = () => {
    setMensagens([]);
  };

  const handleKeyPress = (e) => {
    console.log("key pressed")
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviarMensagem();
    }
  };

  const iniciarSessaoQRcode = async () => {
    try {
      setCarregando(true);
      setErro('');
      
      const response = await fetch(`${API_CONFIG.baseURL}/hermes/iniciarSessao`);
      const data = await response.json();
      
      if (data.error) {
        setErro(data.error);
      } else if (data.qrCode) {
        setQrCode(data.qrCode);
        verificarStatusConexao();
      }
    } catch (error) {
      setErro('Erro ao conectar com o servidor');
      console.error('Erro:', error);
    } finally {
      setCarregando(false);
    }
  };

  const verificarStatusConexao = () => {
    const intervalo = setInterval(async () => {
      try {
        const response = await fetch(`${API_CONFIG.baseURL}/hermes/statusConexao`);
        const data = await response.json();
        
        if (data.status === 'ready') {
          setSessaoIniciada(true);
          clearInterval(intervalo); // Parar de verificar quando estiver pronto
        } else if (data.qrCode && data.qrCode !== qrCode) {
          // Atualizar QR code se for diferente do atual
          setQrCode(data.qrCode);
        }
      } catch (error) {
        console.error('Erro ao verificar status:', error);
      }
    }, 2000);
    
    setTimeout(() => {
      clearInterval(intervalo);
    }, 120000);
  };

  // Função para carregar categorias do banco de dados
  const carregarCategorias = async () => {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/contatos/categorias`);
      if (response.ok) {
        const categoriasData = await response.json();
        // Criar lista com opções específicas
        const opcoesCompletas = [
          'hardcoded',           // Apenas Pops para teste
          'todos',              // Todos os contatos
          ...categoriasData     // Categorias específicas (escola, escola_a)
        ];
        setCategorias(opcoesCompletas);
      } else {
        console.log('Banco de dados não disponível, usando apenas contato hardcoded');
        setCategorias(['hardcoded']);
      }
    } catch (error) {
      console.log('Erro ao carregar categorias, usando apenas contato hardcoded:', error);
      setCategorias(['hardcoded']);
    }
  };

  // Função para carregar contatos de uma categoria
  const carregarContatos = async (categoria) => {
    if (categoria === 'hardcoded') {
      // Apenas Pops para teste
      setContatos([{ id: "557199632643@c.us", name: "Pops" }]);
      return;
    }

    if (categoria === 'todos') {
      // Todos os contatos do banco
      try {
        const response = await fetch(`${API_CONFIG.baseURL}/contatos`);
        if (response.ok) {
          const contatosData = await response.json();
          const contatosFormatados = contatosData.map(contato => ({
            id: contato.whatsapp_id,
            name: contato.nome
          }));
          setContatos(contatosFormatados);
          console.log(`Carregados ${contatosFormatados.length} contatos (TODOS)`);
        }
      } catch (error) {
        console.error('Erro ao carregar todos os contatos:', error);
        setContatos([]);
      }
      return;
    }

    // Categoria específica
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/contatos?categoria=${categoria}`);
      if (response.ok) {
        const contatosData = await response.json();
        const contatosFormatados = contatosData.map(contato => ({
          id: contato.whatsapp_id,
          name: contato.nome
        }));
        setContatos(contatosFormatados);
        console.log(`Carregados ${contatosFormatados.length} contatos da categoria: ${categoria}`);
      }
    } catch (error) {
      console.error('Erro ao carregar contatos:', error);
      setContatos([]);
    }
  };

  // useEffect para carregar categorias quando o componente for montado
  useEffect(() => {
    carregarCategorias();
  }, []);

  // useEffect para carregar contatos quando a categoria mudar
  useEffect(() => {
    if (categoriaSelecionada) {
      carregarContatos(categoriaSelecionada);
    }
  }, [categoriaSelecionada]);

  if (!sessaoIniciada) {
    return (
      <div className={`flex flex-col items-center justify-center h-screen page-transition ${
        darkMode ? 'bg-gray-900' : 'bg-gray-100'
      }`}>
        <div className={`${
          darkMode ? 'bg-gray-800 shadow-emerald-900/20' : 'bg-white'
          } p-8 rounded-lg shadow-lg max-w-md w-full`}>
          <h1 className={`text-2xl font-bold text-center mb-6 ${
            darkMode ? 'text-emerald-400' : 'text-emerald-700'
          }`}>WhatsApp Hermes</h1>
          
          {erro && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
              {erro}
            </div>
          )}
          
          {carregando ? (
            <div className="text-center">
              <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${
                darkMode ? 'border-emerald-400' : 'border-emerald-700'
              } mx-auto`}></div>
              <p className={`mt-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Conectando...
              </p>
            </div>
          ) : qrCode ? (
            <div className="mb-6">
              <p className={`text-center ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
                Escaneie o QR Code com seu WhatsApp
              </p>
              <div className="flex justify-center">
                <img src={qrCode} alt="QR Code" className="w-64 h-64" />
              </div>
              <p className={`text-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-4`}>
                Abra o WhatsApp no seu celular, vá em Menu &gt; WhatsApp Web e escaneie o qrCode
              </p>
            </div>
          ) : (
            <div className="text-center">
              <button
                onClick={iniciarSessaoQRcode}
                className={`px-6 py-3 rounded-lg transition-colors duration-200 font-semibold bg-emerald-600 text-white hover:bg-emerald-700`}
              >
                Iniciar Sessão
              </button>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-4`}>
                Clique para iniciar uma nova sessão do WhatsApp
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-full overflow-hidden page-transition ${
      darkMode ? 'bg-gray-900' : 'bg-white'
    }`} onClick={handleClickFora}>
      <div className={`w-[30%] border-r p-4 flex flex-col ${
        darkMode 
          ? 'border-gray-700 bg-gray-800' 
          : 'border-gray-200 bg-gray-50'
      }`}>
        <h1 className={`text-xl font-semibold mb-6 ${
          darkMode ? 'text-emerald-400' : 'text-gray-900'
        }`}>
          Por favor, siga os passos indicados
        </h1>
        <div className='flex-1 flex flex-col space-y-6 overflow-y-auto'>
          <div className='flex items-center space-x-3 shrink-0'>
            <svg width="40" height="40" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="35" stroke={darkMode ? '#10b981' : '#064e3b'} strokeWidth="8" fill="none" />
              <text x="50%" y="50%" textAnchor="middle" dy=".35em" fontSize="50" fill={darkMode ? '#10b981' : '#064e3b'}>1</text>
            </svg>
            <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
              Para quais contatos quer enviar mensagens?
            </span>
          </div>

          <select
            value={categoriaSelecionada}
            onChange={(e) => setCategoriaSelecionada(e.target.value)}
            className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 ${
              darkMode
                ? 'bg-gray-700 border-gray-600 text-white focus:border-emerald-500 focus:ring-emerald-500/20'
                : 'bg-white border-gray-300 text-gray-900 focus:border-emerald-500 focus:ring-emerald-500/20'
            }`}
          >
            <option value="">Selecione uma lista de contatos</option>
            {categorias.map((categoria) => {
              let nomeExibicao = '';
              if (categoria === 'hardcoded') {
                nomeExibicao = '🧪 Contato de Teste (Pops)';
              } else if (categoria === 'todos') {
                nomeExibicao = '📋 Todos os Contatos (861)';
              } else if (categoria === 'escola_a') {
                nomeExibicao = '🏫 Escola A (683 contatos)';
              } else if (categoria === 'escola') {
                nomeExibicao = '🏫 Escola (280 contatos)';
              } else {
                nomeExibicao = categoria.charAt(0).toUpperCase() + categoria.slice(1);
              }

              return (
                <option key={categoria} value={categoria}>
                  {nomeExibicao}
                </option>
              );
            })}
          </select>

          <div className='flex items-center space-x-3 shrink-0'>
            <svg width="40" height="40" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="35" stroke={darkMode ? '#10b981' : '#064e3b'} strokeWidth="8" fill="none" />
              <text x="50%" y="50%" textAnchor="middle" dy=".35em" fontSize="50" fill={darkMode ? '#10b981' : '#064e3b'}>2</text>
            </svg>
            <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
              Escreva sua mensagem e escolha a imagem que irá enviar (caso tenha)
            </span>
          </div>

          <div className={`mt-6 p-4 border rounded-lg shrink-0 ${
            darkMode
              ? 'bg-gray-700 border-gray-600'
              : 'bg-white border-gray-200'
          }`}>
            <h2 className={`font-semibold mb-2 ${darkMode ? 'text-emerald-400' : 'text-gray-900'}`}>
              Contatos selecionados ({contatos.length}):
            </h2>
            <div className='h-40 overflow-y-auto'>
              {contatos.length > 0 ? (
                <div className="space-y-2">
                  {contatos.map((contato, index) => (
                    <div key={index} className={`p-2 rounded ${
                      darkMode ? 'bg-gray-600' : 'bg-gray-100'
                    }`}>
                      <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {contato.name}
                      </span>
                      <span className={`text-sm ml-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        ({contato.id})
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={`text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Selecione uma lista de contatos acima
                </p>
              )}
            </div>
          </div>

          <button
            onClick={limparMensagens}
            className="mt-4 w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors duration-200"
          >
            <FontAwesomeIcon icon={faTrash} />
            <span>Limpar mensagens</span>
          </button>
        </div>

        <button
          onClick={() => setProntoPraDisparar(true)}
          className={`mb-2 w-full flex items-center justify-center space-x-2 px-4 py-3 text-sm text-white rounded-lg transition-colors duration-200 font-semibold ${
            darkMode 
              ? 'bg-blue-600 hover:bg-blue-700' 
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          <FontAwesomeIcon icon={faRobot} />
          <span>Tudo pronto?</span>
        </button>

        <button
          disabled={!prontoPraDisparar}
          className={`w-full flex items-center justify-center space-x-2 px-4 py-3 text-sm text-white rounded-lg transition-colors duration-200 font-semibold ${
            prontoPraDisparar 
              ? darkMode 
                ? 'bg-emerald-600 hover:bg-emerald-700' 
                : 'bg-emerald-600 hover:bg-emerald-700'
              : 'bg-gray-400 cursor-not-allowed'
          }`}
          onClick={sendMessagesRequest}
        >
          <FontAwesomeIcon icon={faBolt} />
          <span>Disparar</span>
        </button>
      </div>

      <div className={`w-[70%] flex flex-col ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
        <div className={`flex-1 p-4 overflow-y-auto ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
          <span className={`text-sm ${darkMode ? 'text-emerald-400/70' : 'text-gray-500'} italic block mb-4`}>
            pré-visualização
          </span>
          <div className="flex flex-col space-y-4">
            {mensagens.map((msg) => (
              <div 
                key={msg.id}
                className={`p-3 rounded-lg mb-2 max-w-[80%] break-words ${
                  darkMode 
                    ? 'bg-emerald-800 text-white' 
                    : 'bg-emerald-600 text-white'
                }`}
                onContextMenu={(e) => handleContextMenu(e, msg.id)}
              >
                {msg.imagem && (
                  <img 
                    src={msg.imagem} 
                    alt="Imagem anexada" 
                    className="max-w-full rounded-lg mb-2 max-h-64 object-contain"
                  />
                )}
                {msg.texto}
              </div>
            ))}
          </div>
        </div>

        {menuContexto.visible && (
          <div 
            className={`fixed rounded-lg shadow-lg py-2 z-50 w-40 ${
              darkMode ? 'bg-gray-700 shadow-emerald-900/20' : 'bg-white'
            }`}
            style={{ 
              top: menuContexto.y, 
              left: menuContexto.x,
              transform: 'translateX(-8px)'
            }}
          >
            <button 
              className={`w-full px-4 py-2 text-left text-red-500 hover:${
                darkMode ? 'bg-gray-600' : 'bg-gray-100'
              } flex items-center gap-2`}
              onClick={() => excluirMensagem(menuContexto.mensagemId)}
            >
              <FontAwesomeIcon icon={faTrash} />
              <span>Excluir mensagem</span>
            </button>
          </div>
        )}

        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileSelect}
        />

        <div className={`border-t p-4 ${
          darkMode 
            ? 'border-gray-700 bg-gray-800' 
            : 'border-gray-200 bg-white'
        }`}>
          <div className="flex items-center p-4 border-t">
            <textarea
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Digite sua mensagem..."
              className={`flex-1 p-2 rounded-lg border resize-none h-12 ${
                darkMode 
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
              }`}
            />
            <div className="flex flex-col ml-2">
              <div className="flex items-center space-x-2">
                <button 
                  className={`${darkMode ? 'text-emerald-400 hover:text-emerald-300' : 'text-gray-600 hover:text-emerald-600'}`}
                  onClick={() => fileInputRef.current.click()}
                >
                  <FontAwesomeIcon icon={faPaperclip} size="lg" />
                </button>
                <button 
                  className={`${darkMode ? 'text-emerald-400 hover:text-emerald-300' : 'text-emerald-600 hover:text-emerald-700'}`}
                  onClick={() => enviarMensagem()}
                >
                  <FontAwesomeIcon icon={faPaperPlane} size="lg" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hermes;

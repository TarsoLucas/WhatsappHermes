// Configuração da API
const API_CONFIG = {
  // Em desenvolvimento usa localhost, em produção usa a URL atual
  baseURL: process.env.NODE_ENV === 'production' 
    ? '' // URL relativa em produção (mesmo domínio)
    : 'http://localhost:8000' // localhost em desenvolvimento
};

export default API_CONFIG;

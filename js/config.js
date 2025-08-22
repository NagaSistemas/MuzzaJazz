// Configuração da API para produção
const API_CONFIG = {
    development: 'http://localhost:3001/api',
    production: 'https://muzzajazz-production.up.railway.app/api'
};

// Detectar ambiente baseado no domínio
const isProduction = window.location.hostname.includes('muzzajazz.com.br') || 
                   window.location.hostname.includes('railway.app') ||
                   window.location.protocol === 'https:';
const API_BASE_URL = isProduction ? API_CONFIG.production : API_CONFIG.development;

console.log('🌍 Ambiente:', isProduction ? 'PRODUÇÃO' : 'DESENVOLVIMENTO');
console.log('🔗 API Base URL:', API_BASE_URL);
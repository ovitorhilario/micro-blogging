// Funções auxiliares para chamadas à API

const API_BASE = '/api';

// Configurar header para requisições
function getAuthHeaders() {
    return {
        'Content-Type': 'application/json'
    };
}

// Fazer requisição à API
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    
    const defaultOptions = {
        headers: getAuthHeaders(),
        credentials: 'include' // Importante para enviar cookies de sessão
    };
    
    const config = { ...defaultOptions, ...options };
    
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.message || 'Erro na requisição');
    }
    
    return data;
}

// GET request
async function apiGet(endpoint) {
    return apiRequest(endpoint, { method: 'GET' });
}

// POST request
async function apiPost(endpoint, body) {
    return apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(body)
    });
}

// PUT request
async function apiPut(endpoint, body) {
    return apiRequest(endpoint, {
        method: 'PUT',
        body: JSON.stringify(body)
    });
}

// DELETE request
async function apiDelete(endpoint) {
    return apiRequest(endpoint, { method: 'DELETE' });
}

// Tornar funções globais
window.apiGet = apiGet;
window.apiPost = apiPost;
window.apiPut = apiPut;
window.apiDelete = apiDelete;

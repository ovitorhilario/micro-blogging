// Funções auxiliares para chamadas à API

const API_BASE = '/api';

// Fazer requisição à API
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    
    const defaultOptions = {
        headers: getAuthHeaders(),
        credentials: 'include' // Importante para enviar cookies de sessão
    };
    
    const config = { ...defaultOptions, ...options };
    
    try {
        const response = await fetch(url, config);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Erro na requisição');
        }
        
        return data;
    } catch (error) {
        throw error;
    }
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

// Formatar data
function formatDate(dateString) {
    if (!dateString) {
        return 'data desconhecida';
    }
    
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 7) {
        return date.toLocaleDateString('pt-BR');
    } else if (days > 0) {
        return `${days}d`;
    } else if (hours > 0) {
        return `${hours}h`;
    } else if (minutes > 0) {
        return `${minutes}m`;
    } else {
        return 'agora';
    }
}

// Processar hashtags no texto
function processHashtags(text) {
    if (!text || typeof text !== 'string') {
        return text || '';
    }
    return text.replace(/#(\w+)/g, '<a href="#" class="post-hashtag" data-hashtag="$1">#$1</a>');
}

// Mostrar mensagem de erro
function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.classList.add('show');
    }
}

// Esconder mensagem de erro
function hideError(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = '';
        element.classList.remove('show');
    }
}

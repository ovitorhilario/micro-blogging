// Gerenciamento de autenticação com sessões

const USER_DATA_KEY = 'userData';

// Salvar dados do usuário
function saveAuth(user) {
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
}

// Obter dados do usuário
function getUserData() {
    const userData = localStorage.getItem(USER_DATA_KEY);
    return userData ? JSON.parse(userData) : null;
}

// Verificar se está autenticado (via servidor)
async function isAuthenticated() {
    try {
        const response = await fetch('/api/auth/verify', {
            credentials: 'include' // Importante para enviar cookies
        });
        
        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                saveAuth(result.data.user);
                return true;
            }
        }
        
        localStorage.removeItem(USER_DATA_KEY);
        return false;
    } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        return false;
    }
}

// Fazer logout
async function logout() {
    try {
        await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include'
        });
    } catch (error) {
        console.error('Erro ao fazer logout:', error);
    }
    
    localStorage.removeItem(USER_DATA_KEY);
    window.location.href = '/login.html';
}

// Proteger páginas (redirecionar se não autenticado)
async function requireAuth() {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
        window.location.href = '/login.html';
    }
}

// Redirecionar se já autenticado
async function redirectIfAuthenticated() {
    const authenticated = await isAuthenticated();
    if (authenticated) {
        window.location.href = '/feed.html';
    }
}

// Configurar header para requisições
function getAuthHeaders() {
    return {
        'Content-Type': 'application/json'
    };
}

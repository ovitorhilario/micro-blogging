// Funções utilitárias compartilhadas

// Formatar data
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'agora';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;

    return date.toLocaleDateString('pt-BR');
}

// Processar hashtags no texto
function processHashtags(text) {
    return text.replace(/#(\w+)/g, '<span class="hashtag">#$1</span>');
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

// Tornar funções globais
window.formatDate = formatDate;
window.processHashtags = processHashtags;
window.showError = showError;
window.hideError = hideError;
// Página de Login

redirectIfAuthenticated();

const loginForm = document.getElementById('loginForm');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    
    hideError('errorMessage');
    
    if (!username || !password) {
        showError('errorMessage', 'Por favor, preencha todos os campos');
        return;
    }
    
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (data.success) {
            saveAuth(data.data.user);
            window.location.href = '/feed.html';
        } else {
            showError('errorMessage', data.message);
        }
    } catch (error) {
        showError('errorMessage', error.message);
    }
});

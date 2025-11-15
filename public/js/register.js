// Página de Registro

redirectIfAuthenticated();

const registerForm = document.getElementById('registerForm');

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const bio = document.getElementById('bio').value.trim();
    
    hideError('errorMessage');
    
    if (!username || !email || !password) {
        showError('errorMessage', 'Por favor, preencha todos os campos obrigatórios');
        return;
    }
    
    // Validar username (sem espaços)
    if (username.includes(' ')) {
        showError('errorMessage', 'O nome de usuário não pode conter espaços');
        return;
    }
    
    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showError('errorMessage', 'Por favor, digite um email válido');
        return;
    }
    
    if (password.length < 6) {
        showError('errorMessage', 'A senha deve ter pelo menos 6 caracteres');
        return;
    }
    
    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                username, 
                email, 
                password,
                bio: bio || undefined
            }),
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

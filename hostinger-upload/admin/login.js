// Login funcional sem duplicar config Tailwind

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    const errorMessage = document.getElementById('errorMessage');

    // Toggle mostrar/ocultar senha
    togglePassword.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        const icon = this.querySelector('i');
        icon.classList.toggle('fa-eye');
        icon.classList.toggle('fa-eye-slash');
    });

    // Submissão do formulário
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        
        console.log('Login attempt:', username, password);
        
        // Verificar credenciais
        if (username === 'admin' && password === 'muzza2024') {
            console.log('Credentials valid, setting session...');
            
            // Usar localStorage como fallback para domínios
            try {
                sessionStorage.setItem('muzza_admin_logged', 'true');
                sessionStorage.setItem('muzza_admin_user', username);
                localStorage.setItem('muzza_admin_logged', 'true');
                localStorage.setItem('muzza_admin_user', username);
            } catch (e) {
                console.error('Storage error:', e);
            }
            
            console.log('Session set, redirecting...');
            window.location.replace('dashboard.html');
        } else {
            console.log('Invalid credentials');
            showError('Usuário ou senha incorretos');
        }
    });

    function showError(message) {
        const errorText = document.getElementById('errorText');
        errorText.textContent = message;
        errorMessage.classList.remove('hidden');
        
        // Ocultar erro após 5 segundos
        setTimeout(() => {
            errorMessage.classList.add('hidden');
        }, 5000);
    }

    // Verificar se já está logado
    const isLoggedSession = sessionStorage.getItem('muzza_admin_logged') === 'true';
    const isLoggedLocal = localStorage.getItem('muzza_admin_logged') === 'true';
    
    if (isLoggedSession || isLoggedLocal) {
        window.location.replace('dashboard.html');
    }
});
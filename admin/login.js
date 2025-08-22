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
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        // Verificar credenciais
        if (username === 'admin' && password === 'muzza2024') {
            localStorage.setItem('muzza_admin_logged', 'true');
            localStorage.setItem('muzza_admin_user', username);
            window.location.href = 'dashboard.html';
        } else {
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
    if (localStorage.getItem('muzza_admin_logged') === 'true') {
        window.location.href = 'dashboard.html';
    }
});
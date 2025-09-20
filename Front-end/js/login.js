// Configuración de la API
const API_BASE_URL = 'http://127.0.0.1:8000/api';

// Manejo del formulario de login
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const loginBtn = document.getElementById('loginBtn');
    const loginBtnText = document.getElementById('loginBtnText');
    const loginSpinner = document.getElementById('loginSpinner');
    const loginMessages = document.getElementById('loginMessages');
    
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault(); // Prevenir envío normal del formulario
            
            // Limpiar mensajes previos
            clearLoginMessages();
            
            // Obtener datos del formulario
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value.trim();
            
            // Validar campos vacíos
            if (!email) {
                showLoginError('El correo electrónico es obligatorio');
                return;
            }
            
            if (!password) {
                showLoginError('La contraseña es obligatoria');
                return;
            }
            
            // Validar formato de email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showLoginError('El formato del correo electrónico no es válido');
                return;
            }
            
            try {
                // Mostrar indicador de carga
                setLoginLoading(true);
                
                // Realizar petición de login
                const response = await fetch(`${API_BASE_URL}/users/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                });
                
                if (response.ok) {
                    const user = await response.json();
                    
                    // Guardar datos del usuario en localStorage
                    localStorage.setItem('user', JSON.stringify(user));
                    localStorage.setItem('token', user.token || ''); // Si el backend devuelve un token
                    
                    // Mostrar mensaje de éxito
                    showLoginSuccess('¡Login exitoso! Redirigiendo...');
                    
                    // Redirigir según el estado del usuario después de 1.5 segundos
                    setTimeout(() => {
                        if (user.initial_budget && user.budget_period) {
                            // Si ya tiene presupuesto configurado, ir al dashboard
                            window.location.href = '/dashboard';
                        } else {
                            // Si no tiene presupuesto, ir a configurarlo
                            window.location.href = '/initial-budget';
                        }
                    }, 1500);
                    
                } else {
                    const error = await response.json();
                    showLoginError(error.detail || 'Credenciales incorrectas. Verifica tu email y contraseña.');
                }
                
            } catch (error) {
                console.error('Error en login:', error);
                showLoginError('Error de conexión. Verifica que el servidor esté funcionando.');
            } finally {
                setLoginLoading(false);
            }
        });
    }
});

// Función para limpiar mensajes previos
function clearLoginMessages() {
    const loginMessages = document.getElementById('loginMessages');
    if (loginMessages) {
        loginMessages.innerHTML = '';
        loginMessages.style.display = 'none';
    }
}

// Función para mostrar errores de login
function showLoginError(message) {
    const loginMessages = document.getElementById('loginMessages');
    if (loginMessages) {
        loginMessages.innerHTML = `<div class="error-message">${message}</div>`;
        loginMessages.style.display = 'block';
        
        // Auto-ocultar después de 5 segundos
        setTimeout(() => {
            clearLoginMessages();
        }, 5000);
    }
}

// Función para mostrar mensajes de éxito de login
function showLoginSuccess(message) {
    const loginMessages = document.getElementById('loginMessages');
    if (loginMessages) {
        loginMessages.innerHTML = `<div class="success-message-animated">${message}</div>`;
        loginMessages.style.display = 'block';
        
        // Auto-ocultar después de 2 segundos (antes de la redirección)
        setTimeout(() => {
            clearLoginMessages();
        }, 2000);
    }
}

// Función para mostrar/ocultar indicador de carga
function setLoginLoading(loading) {
    const loginBtn = document.getElementById('loginBtn');
    const loginBtnText = document.getElementById('loginBtnText');
    const loginSpinner = document.getElementById('loginSpinner');
    
    if (loginBtn && loginBtnText && loginSpinner) {
        if (loading) {
            loginBtn.disabled = true;
            loginBtnText.style.display = 'none';
            loginSpinner.style.display = 'block';
        } else {
            loginBtn.disabled = false;
            loginBtnText.style.display = 'inline';
            loginSpinner.style.display = 'none';
        }
    }
}

// Función para mostrar/ocultar contraseña en login
function togglePassword(fieldId) {
    const passwordField = document.getElementById(fieldId);
    const eyeIcon = document.getElementById(fieldId + '-eye');
    
    if (passwordField.type === 'password') {
        passwordField.type = 'text';
        eyeIcon.classList.add('eye-open');
    } else {
        passwordField.type = 'password';
        eyeIcon.classList.remove('eye-open');
    }
}
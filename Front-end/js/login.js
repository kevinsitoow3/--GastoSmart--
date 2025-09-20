// Manejo del formulario de login
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault(); // Prevenir envío normal del formulario
            
            // Obtener datos del formulario
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            // Validar campos
            if (!email || !password) {
                showError('Por favor, completa todos los campos');
                return;
            }
            
            try {
                // Mostrar indicador de carga
                showLoading(true);
                
                // Realizar petición de login
                const response = await fetch('http://127.0.0.1:8000/api/users/login', {
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
                    
                    // Mostrar mensaje de éxito
                    showSuccess('¡Login exitoso! Redirigiendo...');
                    
                    // Redirigir a presupuesto inicial después de 1.5 segundos
                    setTimeout(() => {
                        window.location.href = '/initial-budget';
                    }, 1500);
                    
                } else {
                    const error = await response.json();
                    showError(error.detail || 'Credenciales inválidas');
                }
                
            } catch (error) {
                console.error('Error en login:', error);
                showError('Error de conexión. Intenta de nuevo.');
            } finally {
                showLoading(false);
            }
        });
    }
});

// Función para mostrar errores
function showError(message) {
    const errorDiv = document.getElementById('error-message');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        
        // Ocultar error después de 5 segundos
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    }
}

// Función para mostrar mensajes de éxito
function showSuccess(message) {
    const successDiv = document.getElementById('success-message');
    if (successDiv) {
        successDiv.textContent = message;
        successDiv.style.display = 'block';
        
        // Ocultar mensaje después de 3 segundos
        setTimeout(() => {
            successDiv.style.display = 'none';
        }, 3000);
    }
}

// Función para mostrar/ocultar indicador de carga
function showLoading(show) {
    const submitBtn = document.querySelector('#login-form button[type="submit"]');
    if (submitBtn) {
        if (show) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Iniciando sesión...';
        } else {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Iniciar Sesión';
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
/**
 * Funcionalidad de Verificación de Código de Recuperación
 * 
 * Este archivo maneja la verificación del código de 6 dígitos
 * enviado por email para completar el proceso de recuperación de contraseña.
 * 
 * Funcionalidades:
 * - Verificación del código de 6 dígitos
 * - Validación de formato del código
 * - Manejo de respuestas del servidor
 * - Redirección al login después de verificación exitosa
 */

// Inicializar cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    // Confirmar que la página de verificación se ha inicializado
    console.log('Página de verificación de código inicializada');
    
    const API_URL = 'http://127.0.0.1:8000/api';
    const verifyForm = document.getElementById('verifyForm'); // Obtener formulario
    const codeInput = document.getElementById('verificationCode'); // Obtener campo de código
    const submitBtn = document.getElementById('submitBtn'); // Obtener botón de envío
    const formMessages = document.getElementById('formMessages'); // Obtener mensajes de estado
    const emailDisplay = document.getElementById('emailDisplay'); // Obtener elemento para mostrar email

    // Verificar si hay email guardado del paso anterior
    const resetEmail = localStorage.getItem('resetEmail');
    if (!resetEmail) {
        // Si no hay email, redirigir a recuperación de contraseña
        console.log('No hay email guardado, redirigiendo a password-reset');
        window.location.href = '/password-reset';
        return;
    }

    // Mostrar el email al usuario
    if (emailDisplay) {
        emailDisplay.textContent = resetEmail;
    }
    
    // Función para el contador de tiempo
    function startTimer() {
        let timeLeft = 10 * 60; // 10 minutos en segundos
        const timerElement = document.getElementById('codeTimer');
        
        const timer = setInterval(() => {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            
            if (timerElement) {
                timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            }
            
            if (timeLeft <= 0) {
                clearInterval(timer);
                if (timerElement) {
                    timerElement.textContent = '0:00';
                }
            }
            
            timeLeft--;
        }, 1000);
    }

    // Función para reenviar código
    function setupResendCode() {
        const resendBtn = document.getElementById('resendCodeBtn');
        const resendText = document.getElementById('resendCodeText');
        const resendTimer = document.getElementById('resendCodeTimer');
        const resendTimerSpan = document.getElementById('resendTimer');
        
        if (resendBtn) {
            resendBtn.addEventListener('click', async () => {
                const email = localStorage.getItem('resetEmail');
                
                if (!email) {
                    showError("No hay email guardado");
                    return;
                }
                
                try {
                    setLoadingState(true);
                    
                    const response = await fetch(`${API_URL}/users/send-verification-code`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            email: email,
                            purpose: 'password_recovery'
                        }),
                    });
                    
                    if (response.ok) {
                        showSuccess("Código reenviado exitosamente");
                        startResendTimer();
                    } else {
                        const data = await response.json();
                        showError(data.detail || "Error al reenviar el código");
                    }
                } catch (error) {
                    console.error('Error:', error);
                    showError("Error de conexión");
                } finally {
                    setLoadingState(false);
                }
            });
        }
    }

    // Función para el timer de reenvío
    function startResendTimer() {
        let timeLeft = 60; // 60 segundos
        const resendText = document.getElementById('resendCodeText');
        const resendTimer = document.getElementById('resendCodeTimer');
        const resendTimerSpan = document.getElementById('resendTimer');
        const resendBtn = document.getElementById('resendCodeBtn');
        
        if (resendBtn) {
            resendBtn.disabled = true;
            resendText.style.display = 'none';
            resendTimer.style.display = 'inline';
        }
        
        const timer = setInterval(() => {
            if (resendTimerSpan) {
                resendTimerSpan.textContent = timeLeft;
            }
            
            if (timeLeft <= 0) {
                clearInterval(timer);
                if (resendBtn) {
                    resendBtn.disabled = false;
                    resendText.style.display = 'inline';
                    resendTimer.style.display = 'none';
                }
            }
            
            timeLeft--;
        }, 1000);
    }

    // Llamar a las funciones cuando se carga la página
    startTimer();
    setupResendCode();


    // Auto-focus en el campo de código
    if (codeInput) {
        codeInput.focus();
        
        // Limitar a 6 caracteres
        codeInput.addEventListener('input', function(e) {
            if (e.target.value.length > 6) {
                e.target.value = e.target.value.slice(0, 6);
            }
        });
    }

    if (verifyForm) {
        // Escucha cuando el usuario envía el formulario
        verifyForm.addEventListener('submit', handleCodeVerification);
    }

    // Función para manejar la verificación del código
    async function handleCodeVerification(event) {
        event.preventDefault(); // Evita que la página se recargue

        const code = codeInput.value.trim(); // Obtener código y eliminar espacios

        // Validar formato del código
        if (!code) {
            showError("Por favor, ingresa el código de verificación");
            return;
        }

        if (code.length !== 6) {
            showError("El código debe tener exactamente 6 dígitos");
            return;
        }

        // Validar que solo contenga números
        if (!/^\d{6}$/.test(code)) {
            showError("El código debe contener solo números");
            return;
        }

        setLoadingState(true); // Cambia el estado del botón a "verificando..."

        try {
            // Realizar petición para verificar código
            const response = await fetch(`${API_URL}/users/verify-code`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: resetEmail,
                    code: code,
                    purpose: 'password_recovery'
                }),
            });

            const data = await response.json(); // Convertir la respuesta a JSON

            if (response.ok) { // Si la respuesta es exitosa
                showSuccess("¡Código verificado exitosamente! Redirigiendo al login...");

                // Limpiar email del localStorage
                localStorage.removeItem('resetEmail');

                // Redirigir al login después de 2 segundos
                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);

            } else {
                // Mostrar error específico del servidor
                const errorMessage = data.detail || data.message || "Código inválido o expirado";
                showError(errorMessage);
            }

        } catch (error) {
            console.error('Error:', error);
            showError("Error de conexión con el servidor. Verifica que el servidor esté funcionando correctamente");
        } finally {
            setLoadingState(false); // Quita el estado de "verificando..."
        }
    }

    // Función para mostrar errores
    function showError(message) {
        if (formMessages) {
            formMessages.innerHTML = `<div class="error">${message}</div>`;
            formMessages.style.display = 'block';
            
            // Ocultar error después de 5 segundos
            setTimeout(() => {
                formMessages.style.display = 'none';
            }, 5000);
        }
    }

    // Función para mostrar mensajes de éxito
    function showSuccess(message) {
        if (formMessages) {
            formMessages.innerHTML = `<div class="success">${message}</div>`;
            formMessages.style.display = 'block';
            
            // Ocultar mensaje después de 3 segundos
            setTimeout(() => {
                formMessages.style.display = 'none';
            }, 3000);
        }
    }

    // Función para mostrar/ocultar indicador de carga
    function setLoadingState(loading) {
        if (loading) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Verificando...';
        } else {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Verificar Código';
        }
    }
});
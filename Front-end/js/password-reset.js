/**
 * Funcionalidad de Restablecimiento de Contraseña
 * 
 * Este archivo maneja el proceso de recuperación de contraseña para usuarios
 * que han olvidado sus credenciales. Incluye el envío de emails de recuperación
 * y la validación de códigos de verificación.
 * 
 * Funcionalidades:
 * - Validación de email para envío de código de recuperación
 * - Envío de solicitud de restablecimiento al backend
 * - Manejo de respuestas del servidor
 * - Redirección a página de verificación de código
 * - Validación de formato de email
 */


// Inicializar cuando el DOM esté completamente cargado
// HTML se cargue antes de ejecutar el JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Confirmar que la página de restablecimiento se ha inicializado
    console.log('Página de restablecimiento de contraseña inicializada');
    
    const API_URL = 'http://127.0.0.1:8000/api';       
    const resetForm = document.getElementById('resetForm'); // Obtener formulario 
    const emailInput = document.getElementById('email'); // Obtener campo de email
    const submitBtn = document.getElementById('submitBtn'); // Obtener botón de envío
    const formMessages = document.getElementById('formMessages'); // Obtener mensajes de estado

    console.log('formMessages encontrado:', formMessages);

    if(resetForm){
        // Escucha cuando el usuario envía el formulario y ejecuta la función handlePasswordReset
        resetForm.addEventListener('submit', handlePasswordReset);
    }
    // Validación en tiempo real de contraseña
    const newPasswordField = document.getElementById('newPassword');
    if (newPasswordField) {
        newPasswordField.addEventListener('input', validatePasswordRealTime);
    }

    // Función para validación en tiempo real
    function validatePasswordRealTime() {
        const password = document.getElementById('newPassword').value;
        const requirements = {
            length: document.querySelector('[data-requirement="length"]'),
            uppercase: document.querySelector('[data-requirement="uppercase"]'),
            lowercase: document.querySelector('[data-requirement="lowercase"]'),
            number: document.querySelector('[data-requirement="number"]')
        };

        const requirementsContainer = document.getElementById('passwordRequirements');
        let allValid = true;

        // Validar longitud
        if (requirements.length) {
            if (password.length >= 8) {
                requirements.length.classList.remove('requirement-invalid');
                requirements.length.classList.add('requirement-valid');
                requirements.length.querySelector('.requirement__icon').textContent = '✓';
            } else {
                requirements.length.classList.remove('requirement-valid');
                requirements.length.classList.add('requirement-invalid');
                requirements.length.querySelector('.requirement__icon').textContent = '✗';
                allValid = false;
            }
        }

        // Validar mayúscula
        if (requirements.uppercase) {
            if (/(?=.*[A-Z])/.test(password)) {
                requirements.uppercase.classList.remove('requirement-invalid');
                requirements.uppercase.classList.add('requirement-valid');
                requirements.uppercase.querySelector('.requirement__icon').textContent = '✓';
            } else {
                requirements.uppercase.classList.remove('requirement-valid');
                requirements.uppercase.classList.add('requirement-invalid');
                requirements.uppercase.querySelector('.requirement__icon').textContent = '✗';
                allValid = false;
            }
        }

        // Validar minúscula
        if (requirements.lowercase) {
            if (/(?=.*[a-z])/.test(password)) {
                requirements.lowercase.classList.remove('requirement-invalid');
                requirements.lowercase.classList.add('requirement-valid');
                requirements.lowercase.querySelector('.requirement__icon').textContent = '✓';
            } else {
                requirements.lowercase.classList.remove('requirement-valid');
                requirements.lowercase.classList.add('requirement-invalid');
                requirements.lowercase.querySelector('.requirement__icon').textContent = '✗';
                allValid = false;
            }
        }

        // Validar número o símbolo
        if (requirements.number) {
            if (/(?=.*\d|[!@#$%^&*(),.?":{}|<>])/.test(password)) {
                requirements.number.classList.remove('requirement-invalid');
                requirements.number.classList.add('requirement-valid');
                requirements.number.querySelector('.requirement__icon').textContent = '✓';
            } else {
                requirements.number.classList.remove('requirement-valid');
                requirements.number.classList.add('requirement-invalid');
                requirements.number.querySelector('.requirement__icon').textContent = '✗';
                allValid = false;
            }
        }

        // Mostrar/ocultar el recuadro según si todos los requisitos se cumplen
        if (requirementsContainer) {
            console.log('allValid:', allValid, 'password length:', password.length);
            if (allValid && password.length > 0) {
                console.log('Agregando clase all-valid al elemento:', requirementsContainer);
                requirementsContainer.classList.add('all-valid');
            } else {
                console.log('Removiendo clase all-valid del elemento:', requirementsContainer);
                requirementsContainer.classList.remove('all-valid');
            }
        }
    }


     // async: permite manejar operaciones asíncronas: esperar a que se complete una operación que toma tiempo
     async function handlePasswordReset(event) {
        event.preventDefault();
    
        const email = emailInput.value.trim();
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
    
        // Validar email
        if (!email) {
            showError("Por favor, ingresa tu email");
            return;
        }

        // Validar que se ingrese nueva contraseña
        if (!newPassword) {
            showError("Por favor, ingresa una nueva contraseña");
            return;
        }

        // Validar que se confirme la contraseña
        if (!confirmPassword) {
            showError("Por favor, confirma tu nueva contraseña");
            return;
        }

        // Validar que las contraseñas coincidan
        if (newPassword !== confirmPassword) {
            showError("Las contraseñas no coinciden");
            return;
        }

        // Validar que la contraseña cumpla todos los requisitos
        if (newPassword.length < 8) {
            showError("La contraseña debe tener al menos 8 caracteres");
            return;
        }

        if (!/(?=.*[A-Z])/.test(newPassword)) {
            showError("La contraseña debe contener al menos una mayúscula");
            return;
        }

        if (!/(?=.*[a-z])/.test(newPassword)) {
            showError("La contraseña debe contener al menos una minúscula");
            return;
        }

        if (!/(?=.*\d|[!@#$%^&*(),.?":{}|<>])/.test(newPassword)) {
            showError("La contraseña debe contener al menos un número o símbolo");
            return;
        }
    
        setLoadingState(true);
    
        try {
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
    
            const data = await response.json();
    
            if (response.ok) {
                showSuccess("Código de verificación enviado a tu email. Revisa tu correo");
    
                localStorage.setItem('resetEmail', email);
                localStorage.setItem('newPassword', newPassword);
                setTimeout(() => {
                    window.location.href = '/verify-recovery-code';
                }, 2000);
            } else {
                showError(data.detail || "Error al enviar el código de verificación");
            }
        } catch (error) {
            console.error('Error:', error);
            showError("Error de conexión con el servidor. Verifica que el servidor esté funcionando correctamente");
        } finally {
            setLoadingState(false);
        }
    }


    function showError(message){
        console.log('showError llamado con:', message);
        console.log('formMessages:', formMessages);
        
        if(formMessages){
            console.log('Creando mensaje de error...');
            formMessages.innerHTML = `<div class="error-message">${message}</div>`;
            formMessages.style.display = 'block';
            formMessages.style.visibility = 'visible';
            formMessages.style.opacity = '1';
            
            console.log('Mensaje creado:', formMessages.innerHTML);
            
            // Ocultar el mensaje después de 5 segundos
            setTimeout(() => {
                formMessages.style.display = 'none';
                formMessages.innerHTML = '';
                console.log('Mensaje ocultado');
            }, 5000); // 5 segundos para que coincida con la animación
        } else {
            console.error('ERROR: formMessages no encontrado!');
        }
    }

    function showSuccess(message){
        if(formMessages){
            formMessages.innerHTML = `<div class="success-message-animated">${message}</div>`;
            formMessages.style.display = 'block';
            
            // Ocultar el mensaje después de 3 segundos
            setTimeout(() => {
                formMessages.style.display = 'none';
                formMessages.innerHTML = '';
            }, 3000);
        }
    }

    function setLoadingState(loading){
        if(loading){
            submitBtn.disabled = true;
            submitBtn.textContent = 'Enviando...';
        }else{
            submitBtn.disabled = false;
            submitBtn.textContent = 'Guardar Contraseña';
        }
    }

    




});

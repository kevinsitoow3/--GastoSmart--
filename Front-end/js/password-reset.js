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
    
    const API_URL = 'httpp://127.0.0.1:8000/api';       
    const resetForm = document.getElementById('resetForm'); // Obtener formulario 
    const emailInput = document.getElementById('email'); // Obtener campo de email
    const submitBtn = document.getElementById('submitBtn'); // Obtener botón de envío
    const formMessages = document.getElementById('formMessages'); // Obtener mensajes de estado

    if(resetForm){
        // Escucha cuando el usuario envía el formulario y ejecuta la función handlePasswordReset
        resetForm.addEventListener('submit', handlePasswordReset);
    }

    // async: permite manejar operaciones asíncronas: esperar a que se complete una operación que toma tiempo
    async function handlePasswordReset(event){
        event.preventDefault(); // Evita que la página se recargue

        const email = emailInput.value.trim(); // Obtener email y eliminar espacios en blanco

        // Si no hay email, sale de la función
        if(!email){
            showError("Por favor, ingresa tu email");
            return;
        }

        setLoadingState(true); // Cambia el estado del botón a "enviando..."

        try{
            
            const response = await fetch(`${API_URL}/users/send-verification-code`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({// Convertir el objeto a JSON
                    email: email, 
                    purpose: 'password_recovery' 
                }),
            });
            
            // await: pausa el codigo hasta que se complete la operación asincrona
            const data = await response.json(); // Convertir la respuesta a JSON
            
            if(response.ok){ // Si la respuesta es exitosa (200)
                showSuccess("Codigo de verificacion enviado a tu email. Revisa tu correo");

                localStorage.setItem('resetEmail', email); // Guardar el email en el navegador
                setTimeout(() => { // Esperar 2 segundos y redirigir a la página de verificación de código
                    window.location.href = 'verify-recovery-code';
                }, 2000);
            }else{
                showError(data.message || "Error al enviar el codigo de verificacion");
            }
        }catch(error){
            console.error('Error:', error);
            showError("Error de conexión con el servidor. Verifica que el servidor esté funcionando correctamente");
        }finally{
            setLoadingState(false); // Quita el estado de "enviando..."
        }
    }


    function showError(message){
        if(formMessages){
            formMessages.innerHTML = `<div class="error">${message}</div>`;
            formMessages.style.display = 'block';
        }
    }

    function showSuccess(message){
        if(formMessages){
            formMessages.innerHTML = `<div class="success">${message}</div>`;
            formMessages.style.display = 'block';
        }
    }

    function setLoadingState(loading){
        if(loading){
            submitBtn.disabled = true;
            submitBtn.textContent = 'Enviando...';
        }else{
            submitBtn.disabled = false;
            submitBtn.textContent = 'Enviar código';
        }
    }
    }
    
);

/**
 * Funcionalidad de la Página de Inicio
 * 
 * Este archivo maneja la lógica de la página principal (landing page) de GastoSmart.
 * Se encarga de la presentación inicial de la aplicación, navegación hacia
 * las páginas de autenticación y configuración inicial del usuario.
 * 
 * Funcionalidades:
 * - Presentación de características de la aplicación
 * - Navegación hacia login/registro
 * - Animaciones y efectos visuales
 * - Configuración de elementos interactivos
 * - Redirección basada en estado de autenticación
 */
const API_BASE_URL = 'http://127.0.0.1:8000/api';
// Inicializar cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    // Confirmar que la página de inicio se ha cargado correctamente
    console.log('Página de inicio cargada exitosamente');

    const signupBtn = document.getElementById('signupBtn');
    const submitBtn = document.getElementById('submitBtn'); 
    const formErrors = document.getElementById('formErrors');
    const signupForm = document.getElementById('signupForm');

    if(signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }

    async function handleSignup(event) {
        event.preventDefault();

        // Limpiar errores previos
        clearErrors();

        const formData = new FormData(signupForm);
        const userData = {
            first_name: formData.get('firstName'),
            last_name: formData.get('lastName'),
            email: formData.get('email'),
            password: formData.get('password'),
            initial_budget: 1000000,
            budget_period: 'mensual'
        }

        const termsAccepted = formData.get('terms') === 'on';
        const validation = validateForm(userData, formData.get('confirm'), termsAccepted);
        if(!validation.isValid){
            showFieldErrors(validation.errors);
            return;
        }

        setLoadingState(true);

        try {
            const response = await fetch(`${API_BASE_URL}/users/register`,{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            const data = await response.json();

            if(response.ok){
                console.log('Usuario registrado', data);
                showSuccess('¡Usuario registrado exitosamente! Redirigiendo....');
                setTimeout(() => {
                    window.location.href = '/login';
            }, 2000);
            }else{
                console.error('Error en el registro', data);
                // Manejar errores de validación de Pydantic
                if (data.detail && Array.isArray(data.detail)) {
                    const errorMessages = data.detail.map(error => error.msg || error.message || 'Error de validación');
                    showErrors(errorMessages);
                } else {
                    showErrors([data.detail || 'Error al registrar el usuario']);
                }
            }
        }catch(error){
            console.error('Error de conexión', error);
            showErrors(['Error de conexión. Verifica que el servidor esté ejecutándose']);
        }finally{
            setLoadingState(false);
        }
    }

    //-----FUNCION PARA VALIDAR EL FORMULARIO-----
    function validateForm(userData, confirmPassword, termsAccepted){
        const errors = [];

        // Validar nombre
        if(!userData.first_name || userData.first_name.trim() === ''){
            errors.push({field: 'firstName', message: 'El nombre es obligatorio'});
        } else if(userData.first_name.length < 2){
            errors.push({field: 'firstName', message: 'El nombre debe tener al menos 2 caracteres'});
        }

        // Validar apellido
        if(!userData.last_name || userData.last_name.trim() === ''){
            errors.push({field: 'lastName', message: 'El apellido es obligatorio'});
        } else if(userData.last_name.length < 2){
            errors.push({field: 'lastName', message: 'El apellido debe tener al menos 2 caracteres'});
        }

        // Validar correo electrónico
        if(!userData.email || userData.email.trim() === ''){
            errors.push({field: 'email', message: 'El correo electrónico es obligatorio'});
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if(!emailRegex.test(userData.email)){
                errors.push({field: 'email', message: 'El correo electrónico no es válido'});
            }
        }

        // Validar contraseña
        if(!userData.password || userData.password.trim() === ''){
            errors.push({field: 'password', message: 'La contraseña es obligatoria'});
        } else if(userData.password.length < 8){
            errors.push({field: 'password', message: 'La contraseña debe tener al menos 8 caracteres'});
        }

        // Validar confirmación de contraseña
        if(!confirmPassword || confirmPassword.trim() === ''){
            errors.push({field: 'confirm', message: 'Debes confirmar tu contraseña'});
        } else if(userData.password !== confirmPassword){
            errors.push({field: 'confirm', message: 'Las contraseñas no coinciden'});
        }

        // Validar términos y condiciones
        if(!termsAccepted){
            errors.push({field: 'terms', message: 'Debes aceptar los Términos y Condiciones'});
        }

        return{
            isValid: errors.length === 0,
            errors:errors
        };
    }

    //-----FUNCION PARA LIMPIAR ERRORES PREVIOS-----
    function clearErrors(){
        // Remover todos los mensajes de error individuales
        const existingErrors = document.querySelectorAll('.error-message');
        existingErrors.forEach(error => error.remove());
        
        // Limpiar el contenedor de errores globales
        if(formErrors){
            formErrors.innerHTML = '';
            formErrors.style.display = 'none';
        }
    }

    //-----FUNCION PARA MOSTRAR ERRORES POR CAMPO-----
    function showFieldErrors(errors){
        errors.forEach(error => {
            const field = document.querySelector(`[name="${error.field}"]`);
            if(field){
                // Crear contenedor de error si no existe
                let errorContainer = field.closest('.form__row').querySelector('.error-message');
                if(!errorContainer){
                    errorContainer = document.createElement('div');
                    errorContainer.className = 'error-message';
                    
                    // Para el checkbox de términos, insertar después del label
                    if(error.field === 'terms'){
                        const termsContainer = field.closest('.form__row');
                        termsContainer.appendChild(errorContainer);
                    } else {
                        // Para otros campos, insertar después del campo
                        const fieldContainer = field.closest('.field') || field.closest('span');
                        fieldContainer.parentNode.insertBefore(errorContainer, fieldContainer.nextSibling);
                    }
                }
                
                errorContainer.textContent = error.message;
                errorContainer.style.display = 'block';
                
                // Auto-remover después de 5 segundos
                setTimeout(() => {
                    if(errorContainer && errorContainer.parentNode){
                        errorContainer.remove();
                    }
                }, 5000);
            }
        });
    }

    //-----FUNCION PARA MOSTRAR ERRORES GENERALES-----
    function showErrors(errors){
        if(formErrors){
            if(Array.isArray(errors)){
                formErrors.innerHTML = errors.map(error => `<div class="error">${error}</div>`).join('');
            } else {
                formErrors.innerHTML = `<div class="error">${errors}</div>`;
            }
            formErrors.style.display = 'block';
            
            // Auto-ocultar después de 5 segundos
            setTimeout(() => {
                formErrors.style.display = 'none';
                formErrors.innerHTML = '';
            }, 5000);
        }
    }

    //-----FUNCION PARA MOSTRAR MENSAJES DE EXITO-----
    function showSuccess(message){
        if(formErrors){
            formErrors.innerHTML = `<div class="success">${message}</div>`;
            formErrors.style.display = 'block';
        }
    }

    //-----FUNCION PARA MANEJAR EL ESTADO DE CARGANDO-----
    function setLoadingState(loading){
        if(loading){
            submitBtn.disabled = true;
            submitBtn.textContent = 'Creando cuenta...';
        }else{
            submitBtn.disabled = false;
            submitBtn.textContent = 'Crear cuenta';
        }
    }



  
    //-----FUNCION PARA MOSTRAR Y OCULTAR LAS CONTRASEÑAS-----
    //-----FUNCION PARA MOSTRAR EL ESTADO DE CARGANDO-----
    // TODO: Implementar funcionalidades de la página de inicio
    // - Configurar animaciones de entrada
    // - Manejar navegación hacia páginas de autenticación
    // - Implementar efectos visuales atractivos
    // - Configurar elementos interactivos
    // - Verificar estado de autenticación del usuario
    // - Redireccionar usuarios autenticados al dashboard
});
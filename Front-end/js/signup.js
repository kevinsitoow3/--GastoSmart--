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
    const signupBtn = document.getElementById('signupBtn');
    const submitBtn = document.getElementById('submitBtn'); 
    const formErrors = document.getElementById('formErrors');
    const signupForm = document.getElementById('signupForm');
    let isSubmitting = false; // Bandera para evitar múltiples submits

    if(signupForm) {
        // Agregar múltiples protecciones contra submit
        signupForm.addEventListener('submit', handleSignup);
        
        // Protección adicional: prevenir CUALQUIER submit del form
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            return false;
        });
        
        // También proteger el botón específicamente
        if(submitBtn) {
            submitBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                // Ejecutar directamente la función de signup
                handleSignup(e);
                
                return false;
            });
        }
    }

    async function handleSignup(event) {
        event.preventDefault();
        event.stopPropagation();

        // Evitar múltiples submits
        if(isSubmitting) {
            return;
        }
        isSubmitting = true;

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
            isSubmitting = false; // Resetear bandera
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
                // Enviar código de verificación después del registro exitoso
                try {
                    const verificationResponse = await fetch(`${API_BASE_URL}/users/send-verification-code`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            email: userData.email,
                            purpose: 'registration'
                        })
                    });
                    
                    if (verificationResponse.ok) {
                        // Guardar email para la página de verificación
                        localStorage.setItem('registrationEmail', userData.email);
                        localStorage.setItem('registrationUserData', JSON.stringify(userData));
                        
                        showSuccess('¡Cuenta creada! Revisa tu email y verifica tu código para activar tu cuenta.');
                        
                        // Redirección después de 2 segundos
                        setTimeout(() => {
                            try {
                                const targetUrl = '/verify-registration-code';
                                
                                // Intentar redirección
                                window.location.replace(targetUrl);
                                
                                // Verificar después de un momento si aún estamos aquí
                                setTimeout(() => {
                                    if (window.location.pathname === '/signup') {
                                        // Método alternativo
                                        window.location.href = '/verify-registration-code';
                                    }
                                }, 1000);
                                
                            } catch (error) {
                                // Error silencioso - redirección fallida
                            }
                        }, 2000);
                    } else {
                        const verificationError = await verificationResponse.json();
                        // Aún así debe ir a verificación - la cuenta fue creada
                        localStorage.setItem('registrationEmail', userData.email);
                        localStorage.setItem('registrationUserData', JSON.stringify(userData));
                        showSuccess('¡Cuenta creada! Debes verificar tu email para activar tu cuenta. Redirigiendo...');
                        setTimeout(() => {
                            window.location.replace('/verify-registration-code');
                        }, 500);
                    }
                } catch (verificationError) {
                    // Aún así debe ir a verificación - la cuenta fue creada
                    localStorage.setItem('registrationEmail', userData.email);
                    localStorage.setItem('registrationUserData', JSON.stringify(userData));
                    showSuccess('¡Cuenta creada! Debes verificar tu email para activar tu cuenta. Redirigiendo...');
                    setTimeout(() => {
                        window.location.replace('/verify-registration-code');
                    }, 500);
                }
            }else{
                // Manejar errores de validación de Pydantic
                if (data.detail && Array.isArray(data.detail)) {
                    const errorMessages = data.detail.map(error => error.msg || error.message || 'Error de validación');
                    showErrors(errorMessages);
                } else {
                    showErrors([data.detail || 'Error al registrar el usuario']);
                }
            }
        }catch(error){
            showErrors(['Error de conexión. Verifica que el servidor esté ejecutándose']);
        }finally{
            setLoadingState(false);
            isSubmitting = false; // Resetear bandera
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
        } else {
            const passwordErrors = validatePasswordStrength(userData.password);
            if(passwordErrors.length > 0){
                errors.push({field: 'password', message: passwordErrors[0]});
            }
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

    //-----FUNCION PARA VALIDAR FORTALEZA DE CONTRASEÑA-----
    function validatePasswordStrength(password) {
        const errors = [];
        
        // Mínimo 8 caracteres
        if(password.length < 8) {
            errors.push('La contraseña debe tener al menos 8 caracteres');
        }
        
        // Al menos una mayúscula
        if(!/(?=.*[A-Z])/.test(password)) {
            errors.push('La contraseña debe contener al menos una mayúscula');
        }
        
        // Al menos una minúscula
        if(!/(?=.*[a-z])/.test(password)) {
            errors.push('La contraseña debe contener al menos una minúscula');
        }
        
        // Al menos un número
        if(!/(?=.*\d)/.test(password)) {
            errors.push('La contraseña debe contener al menos un número');
        }
        
        // Al menos un carácter especial
        if(!/(?=.*[!@#$%^&*(),.?":{}|<>])/.test(password)) {
            errors.push('La contraseña debe contener al menos un carácter especial (!@#$%^&*,etc.)');
        }
        
        return errors;
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
                const formRow = field.closest('.form__row');
                let errorContainer = formRow.querySelector('.error-message');
                if(!errorContainer){
                    errorContainer = document.createElement('div');
                    errorContainer.className = 'error-message';
                    
                    // Para el checkbox de términos, insertar después del label
                    if(error.field === 'terms'){
                        formRow.appendChild(errorContainer);
                    } else {
                        // Para otros campos, insertar después de la label
                        const label = formRow.querySelector('.label');
                        if(label){
                            label.appendChild(errorContainer);
                        } else {
                            formRow.appendChild(errorContainer);
                        }
                    }
                }
                
                errorContainer.textContent = error.message;
                errorContainer.style.display = 'block';
                errorContainer.style.opacity = '1';
                errorContainer.style.transform = 'translateY(0)';
                errorContainer.style.animation = 'none'; // Deshabilitar animación para mostrar inmediatamente
                
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
            formErrors.innerHTML = `<div class="success-message-animated">${message}</div>`;
            formErrors.style.display = 'block';
            
            // Auto-ocultar después de 3 segundos (antes de la redirección)
            setTimeout(() => {
                formErrors.style.display = 'none';
                formErrors.innerHTML = '';
            }, 3000);
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
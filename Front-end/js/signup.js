/**
 * Sistema de Registro de Usuarios - GastoSmart
 * 
 * Maneja el formulario de registro con validación completa,
 * envío de código de verificación y redirección automática.
 */

const API_BASE_URL = 'http://127.0.0.1:8000/api';

document.addEventListener('DOMContentLoaded', function() {
    const submitBtn = document.getElementById('submitBtn'); 
    const formErrors = document.getElementById('formErrors');
    const signupForm = document.getElementById('signupForm');
    let isSubmitting = false;

    if(signupForm) {
        // Prevenir envío del formulario por defecto
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleSignup(e);
        });
        
        // Manejar clic del botón
        if(submitBtn) {
            submitBtn.addEventListener('click', function(e) {
                e.preventDefault();
                handleSignup(e);
            });
        }
        
        // Limpiar errores al escribir
        const inputs = signupForm.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('input', function() {
                this.classList.remove('error');
                this.style.borderColor = '';
                
                if(formErrors && formErrors.style.display !== 'none') {
                    formErrors.style.display = 'none';
                    formErrors.innerHTML = '';
                }
            });
        });
    }

    async function handleSignup(event) {
        event.preventDefault();
        event.stopPropagation();

        if(isSubmitting) return;
        isSubmitting = true;

        clearErrors();

        const formData = new FormData(signupForm);
        const userData = {
            first_name: formData.get('firstName'),
            last_name: formData.get('lastName'),
            email: formData.get('email'),
            password: formData.get('password'),
            initial_budget: 0,  // Presupuesto temporal, será configurado después
            budget_period: 'mensual'  // Período temporal
        }

        const termsAccepted = formData.get('terms') === 'on';
        const validation = validateForm(userData, formData.get('confirm'), termsAccepted);
        
        if(!validation.isValid){
            showFieldErrors(validation.errors);
            isSubmitting = false;
            return;
        }

        setLoadingState(true);

        try {
            const response = await fetch(`${API_BASE_URL}/users/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            const data = await response.json();

            if(response.ok){
                // Enviar código de verificación
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
                    
                    // Guardar datos para verificación
                    localStorage.setItem('registrationEmail', userData.email);
                    localStorage.setItem('registrationUserData', JSON.stringify(userData));
                    
                    showSuccess('¡Cuenta creada! Revisa tu email y verifica tu código para activar tu cuenta.');
                    
                    // Redirección después de 2 segundos
                    setTimeout(() => {
                        window.location.replace('/verify-registration-code');
                    }, 2000);
                    
                } catch (verificationError) {
                    // Aún así redirigir - la cuenta fue creada
                    localStorage.setItem('registrationEmail', userData.email);
                    localStorage.setItem('registrationUserData', JSON.stringify(userData));
                    showSuccess('¡Cuenta creada! Debes verificar tu email para activar tu cuenta. Redirigiendo...');
                    setTimeout(() => {
                        window.location.replace('/verify-registration-code');
                    }, 500);
                }
            } else {
                // Manejar errores del servidor
                if (data.detail && Array.isArray(data.detail)) {
                    const errorMessages = data.detail.map(error => error.msg || error.message || 'Error de validación');
                    showErrors(errorMessages);
                } else {
                    showErrors([data.detail || 'Error al registrar el usuario']);
                }
            }
        } catch(error) {
            showErrors(['Error de conexión. Verifica que el servidor esté ejecutándose']);
        } finally {
            setLoadingState(false);
            isSubmitting = false;
        }
    }

    function validateForm(userData, confirmPassword, termsAccepted) {
        const errors = [];

        // Validar nombre
        if(!userData.first_name || userData.first_name.trim() === '') {
            errors.push({field: 'firstName', message: 'El nombre es obligatorio'});
        } else if(userData.first_name.length < 2) {
            errors.push({field: 'firstName', message: 'El nombre debe tener al menos 2 caracteres'});
        }

        // Validar apellido
        if(!userData.last_name || userData.last_name.trim() === '') {
            errors.push({field: 'lastName', message: 'El apellido es obligatorio'});
        } else if(userData.last_name.length < 2) {
            errors.push({field: 'lastName', message: 'El apellido debe tener al menos 2 caracteres'});
        }

        // Validar email
        if(!userData.email || userData.email.trim() === '') {
            errors.push({field: 'email', message: 'El correo electrónico es obligatorio'});
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if(!emailRegex.test(userData.email)) {
                errors.push({field: 'email', message: 'El correo electrónico no es válido'});
            }
        }

        // Validar contraseña
        if(!userData.password || userData.password.trim() === '') {
            errors.push({field: 'password', message: 'La contraseña es obligatoria'});
        } else {
            const passwordErrors = validatePasswordStrength(userData.password);
            if(passwordErrors.length > 0) {
                errors.push({field: 'password', message: passwordErrors[0]});
            }
        }

        // Validar confirmación de contraseña
        if(!confirmPassword || confirmPassword.trim() === '') {
            errors.push({field: 'confirm', message: 'Debes confirmar tu contraseña'});
        } else if(userData.password !== confirmPassword) {
            errors.push({field: 'confirm', message: 'Las contraseñas no coinciden'});
        }

        // Validar términos
        if(!termsAccepted) {
            errors.push({field: 'terms', message: 'Debes aceptar los Términos y Condiciones'});
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    function validatePasswordStrength(password) {
        const errors = [];
        
        if(password.length < 8) {
            errors.push('La contraseña debe tener al menos 8 caracteres');
        }
        
        if(!/(?=.*[A-Z])/.test(password)) {
            errors.push('La contraseña debe contener al menos una mayúscula');
        }
        
        if(!/(?=.*[a-z])/.test(password)) {
            errors.push('La contraseña debe contener al menos una minúscula');
        }
        
        if(!/(?=.*\d)/.test(password)) {
            errors.push('La contraseña debe contener al menos un número');
        }
        
        if(!/(?=.*[!@#$%^&*(),.?":{}|<>])/.test(password)) {
            errors.push('La contraseña debe contener al menos un carácter especial (!@#$%^&*,etc.)');
        }
        
        return errors;
    }

    function clearErrors() {
        try {
            // Limpiar contenedor de errores globales
            if(formErrors) {
                formErrors.innerHTML = '';
                formErrors.style.display = 'none';
            }
            
            // Limpiar estilos de error de los campos
            const fields = document.querySelectorAll('input, select, textarea');
            fields.forEach(field => {
                field.classList.remove('error');
                field.style.borderColor = '';
            });
        } catch (error) {
            console.warn('Error al limpiar errores:', error);
        }
    }

    function showFieldErrors(errors) {
        if(!errors || !Array.isArray(errors) || errors.length === 0) {
            return;
        }
        
        const errorMessages = [];
        
        errors.forEach(error => {
            // Formatear nombre del campo
            let fieldName = error.field;
            switch(error.field) {
                case 'firstName': fieldName = 'Nombre'; break;
                case 'lastName': fieldName = 'Apellido'; break;
                case 'email': fieldName = 'Correo electrónico'; break;
                case 'password': fieldName = 'Contraseña'; break;
                case 'confirm': fieldName = 'Confirmar contraseña'; break;
                case 'terms': fieldName = 'Términos y condiciones'; break;
            }
            
            errorMessages.push(`${fieldName}: ${error.message}`);
            
            // Marcar campo visualmente
            try {
                const fields = document.getElementsByName(error.field);
                if(fields && fields.length > 0) {
                    const field = fields[0];
                    field.classList.add('error');
                    field.style.borderColor = '#dc2626';
                    
                    // Limpiar después de 5 segundos
                    setTimeout(() => {
                        field.classList.remove('error');
                        field.style.borderColor = '';
                    }, 5000);
                }
            } catch (e) {
                // Error silencioso
            }
        });
        
        showErrors(errorMessages);
    }

    function showErrors(errors) {
        if(formErrors) {
            if(Array.isArray(errors)) {
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

    function showSuccess(message) {
        if(formErrors) {
            formErrors.innerHTML = `<div class="success-message-animated">${message}</div>`;
            formErrors.style.display = 'block';
            
            // Auto-ocultar después de 3 segundos
            setTimeout(() => {
                formErrors.style.display = 'none';
                formErrors.innerHTML = '';
            }, 3000);
        }
    }

    function setLoadingState(loading) {
        if(submitBtn) {
            if(loading) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Creando cuenta...';
            } else {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Crear cuenta';
            }
        }
    }
});
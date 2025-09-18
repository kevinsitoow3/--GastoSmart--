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

    if(signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }

    async function handleSignup(event) {
        event.preventDefault();

        const formData = new FormData(signupForm);
        const userData = {
            first_name: formData.get('firstName'),
            last_name: formData.get('lastName'),
            email: formData.get('email'),
            password: formData.get('password'),
            initial_budget: 1000000,
            budget_period: 'mensual'
        }

        const validation = validateForm(userData, formData.get('confirm'));
        if(!validation.isValid){
            showErrors(validation.errors);
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
    function validateForm(userData, confirmPassword){
        const errors = [];

        // Validar nombre
        if(!userData.first_name || userData.first_name.length < 2){
            errors.push('El nombre debe tener al menos 2 caracteres');
        }

        // Validar apellido
        if(!userData.last_name || userData.last_name.length < 2){
            errors.push('El apellido debe tener al menos 2 caracteres');
        }

        // Validar correo electrónico
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!userData.email || !emailRegex.test(userData.email)){
            errors.push('El correo electrónico no es válido');
        }

        // Validar contraseña
        if(!userData.password || userData.password.length < 8){
            errors.push('La contraseña debe tener al menos 8 caracteres');
        }

        // Validar confirmación de contraseña
        if(userData.password !== confirmPassword){
            errors.push('Las contraseñas no coinciden');
        }

        return{
            isValid: errors.length === 0,
            errors:errors
        };
    }

    //-----FUNCION PARA MOSTRAR LOS ERRORES-----
    function showErrors(errors){
        if(formErrors){
            formErrors.innerHTML = errors.map(error => `<div class="error">${error}</div>`).join('');
            formErrors.style.display = 'block';
        }
    }

    //-----FUNCION PARA MOSTRA MENSAJES DE EXITO-----
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
    //-----FUNCION PARA MOSTRAR EL ESTADO DE CARGANDO-----
    // TODO: Implementar funcionalidades de la página de inicio
    // - Configurar animaciones de entrada
    // - Manejar navegación hacia páginas de autenticación
    // - Implementar efectos visuales atractivos
    // - Configurar elementos interactivos
    // - Verificar estado de autenticación del usuario
    // - Redireccionar usuarios autenticados al dashboard
});
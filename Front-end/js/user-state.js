/**
 * Sistema de Verificación de Estado de Usuario
 * 
 * Este archivo proporciona funciones globales para verificar
 * el estado de autenticación y configuración del usuario.
 */

/**
 * Verificar si el usuario está autenticado
 * @returns {Object|null} Datos del usuario o null si no está autenticado
 */
function getCurrentUser() {
    try {
        const userData = localStorage.getItem('user');
        return userData ? JSON.parse(userData) : null;
    } catch (error) {
        console.error('Error al obtener datos del usuario:', error);
        return null;
    }
}

/**
 * Verificar si el usuario tiene presupuesto configurado
 * @param {Object} user - Datos del usuario
 * @returns {boolean} True si tiene presupuesto configurado
 */
function hasBudgetConfigured(user) {
    if (!user) return false;
    
    // Usar el campo budget_configured si está disponible
    if (user.budget_configured !== undefined) {
        return user.budget_configured === true;
    }
    
    // Fallback para usuarios existentes sin el campo budget_configured
    // Considerar configurado solo si el presupuesto es diferente al predeterminado
    const isDefaultBudget = user.initial_budget === 1000000;
    return user.initial_budget && 
           user.budget_period && 
           user.initial_budget > 0 && 
           user.budget_period.trim() !== '' &&
           !isDefaultBudget;
}

/**
 * Redirigir al usuario según su estado de autenticación y configuración
 * @param {string} currentPage - Página actual para evitar redirecciones innecesarias
 */
function redirectUserByState(currentPage = '') {
    const user = getCurrentUser();
    
    // Si no hay usuario autenticado
    if (!user) {
        if (currentPage !== 'login' && currentPage !== 'signup') {
            console.log('Usuario no autenticado, redirigiendo al login');
            window.location.href = '/login';
        }
        return;
    }
    
    // Si el usuario está autenticado pero no tiene presupuesto configurado
    if (!hasBudgetConfigured(user)) {
        if (currentPage !== 'initial-budget') {
            console.log('Usuario sin presupuesto configurado, redirigiendo a initial-budget');
            window.location.href = '/initial-budget';
        }
        return;
    }
    
    // Si el usuario está en initial-budget pero ya tiene presupuesto configurado
    if (currentPage === 'initial-budget' && hasBudgetConfigured(user)) {
        console.log('Usuario ya tiene presupuesto configurado, redirigiendo al dashboard');
        window.location.href = '/dashboard';
        return;
    }
    
    // Si el usuario está en login/signup pero ya está autenticado y configurado
    if ((currentPage === 'login' || currentPage === 'signup') && hasBudgetConfigured(user)) {
        console.log('Usuario ya autenticado y configurado, redirigiendo al dashboard');
        window.location.href = '/dashboard';
        return;
    }
}

/**
 * Verificar y redirigir automáticamente al cargar una página
 * @param {string} pageName - Nombre de la página actual
 */
function checkUserStateOnPageLoad(pageName) {
    document.addEventListener('DOMContentLoaded', function() {
        redirectUserByState(pageName);
    });
}

/**
 * Actualizar datos del usuario en localStorage
 * @param {Object} userData - Nuevos datos del usuario
 */
function updateUserData(userData) {
    try {
        localStorage.setItem('user', JSON.stringify(userData));
        console.log('Datos del usuario actualizados');
    } catch (error) {
        console.error('Error al actualizar datos del usuario:', error);
    }
}

/**
 * Limpiar datos del usuario (logout)
 */
function clearUserData() {
    try {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('registrationEmail');
        localStorage.removeItem('registrationUserData');
        console.log('Datos del usuario limpiados');
    } catch (error) {
        console.error('Error al limpiar datos del usuario:', error);
    }
}

// Exportar funciones para uso global
window.getCurrentUser = getCurrentUser;
window.hasBudgetConfigured = hasBudgetConfigured;
window.redirectUserByState = redirectUserByState;
window.checkUserStateOnPageLoad = checkUserStateOnPageLoad;
window.updateUserData = updateUserData;
window.clearUserData = clearUserData;

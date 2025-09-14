/**
 * Funcionalidad de Toggle de Visibilidad de Contraseña
 * 
 * Este archivo maneja la funcionalidad de mostrar/ocultar contraseñas en los
 * formularios de GastoSmart. Permite a los usuarios alternar la visibilidad
 * de sus contraseñas para facilitar la verificación durante el ingreso.
 * 
 * Funcionalidades:
 * - Toggle entre mostrar y ocultar contraseña
 * - Cambio dinámico del ícono del botón
 * - Soporte para múltiples campos de contraseña
 * - Accesibilidad mejorada para usuarios
 * - Indicadores visuales claros del estado
 */

// Inicializar cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    // Obtener todos los botones de toggle de contraseña en la página
    const passwordToggles = document.querySelectorAll('.password-toggle');
    
    // Configurar evento de clic para cada botón de toggle
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            // Buscar el campo de input de contraseña en el contenedor padre
            const input = this.parentElement.querySelector('input');
            
            // Verificar si el input existe antes de proceder
            if (input) {
                // Alternar entre tipo 'password' y 'text' para mostrar/ocultar
                if (input.type === 'password') {
                    // Mostrar contraseña: cambiar a texto y actualizar ícono
                    input.type = 'text';
                    this.textContent = '👁️'; // Ícono de ojo abierto
                } else {
                    // Ocultar contraseña: cambiar a password y actualizar ícono
                    input.type = 'password';
                    this.textContent = '👁️‍🗨️'; // Ícono de ojo tachado
                }
            } else {
                // Mostrar advertencia si no se encuentra el input
                console.warn('Campo de contraseña no encontrado para el toggle');
            }
        });
    });
});
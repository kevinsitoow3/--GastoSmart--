/**
 * Funcionalidad del Menú Móvil para el Dashboard
 * 
 * Este archivo maneja la funcionalidad del menú lateral móvil en el dashboard
 * de GastoSmart. Controla la apertura/cierre del menú, el overlay de fondo
 * y las clases CSS necesarias para la navegación móvil.
 * 
 * Funcionalidades:
 * - Toggle del menú lateral móvil
 * - Control del overlay de fondo
 * - Prevención del scroll del body cuando el menú está abierto
 * - Cierre automático del menú al hacer clic en el overlay
 * - Manejo de clases CSS para animaciones
 * - Accesibilidad para dispositivos táctiles
 */

// Inicializar cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    // Obtener referencias a los elementos del menú móvil
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const sidebar = document.getElementById('sidebar');
    const mobileOverlay = document.getElementById('mobileOverlay');

    // Verificar que todos los elementos necesarios existen antes de configurar eventos
    if (mobileMenuToggle && sidebar && mobileOverlay) {
        // Configurar evento de clic en el botón de toggle del menú
        mobileMenuToggle.addEventListener('click', function() {
            // Alternar la clase 'mobile-open' en el sidebar para mostrar/ocultar
            sidebar.classList.toggle('mobile-open');
            // Alternar la clase 'active' en el overlay para mostrar/ocultar fondo
            mobileOverlay.classList.toggle('active');
            // Alternar la clase 'menu-open' en el body para prevenir scroll
            document.body.classList.toggle('menu-open');
        });

        // Configurar evento de clic en el overlay para cerrar el menú
        mobileOverlay.addEventListener('click', function() {
            // Remover todas las clases activas para cerrar el menú
            sidebar.classList.remove('mobile-open');
            mobileOverlay.classList.remove('active');
            document.body.classList.remove('menu-open');
        });
    } else {
        // Mostrar advertencia si algún elemento no se encuentra
        console.warn('Elementos del menú móvil no encontrados - Verificar IDs en el HTML');
    }
});

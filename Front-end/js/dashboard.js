/**
 * Funcionalidad del Dashboard Principal
 * 
 * Este archivo contiene toda la lógica del dashboard principal de GastoSmart.
 * Se encarga de la inicialización de componentes, carga de datos del usuario,
 * actualización de estadísticas en tiempo real y manejo de la interfaz principal.
 * 
 * Funcionalidades:
 * - Carga de datos financieros del usuario
 * - Actualización de resúmenes y estadísticas
 * - Manejo de widgets interactivos
 * - Navegación entre secciones del dashboard
 * - Actualización de datos en tiempo real
 * - Manejo de notificaciones y alertas
 */

// Estado de la aplicación
let currentSection = 'panel-principal';

// Inicializar cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    // Confirmar que el dashboard se ha inicializado correctamente
    console.log('Dashboard principal inicializado exitosamente');
    
    // Verificar autenticación del usuario
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!user) {
        // Si no hay usuario logueado, redirigir al login
        window.location.href = '/login';
        return;
    }
    
    // Verificar si el usuario tiene presupuesto configurado
    if (!user.initial_budget || !user.budget_period) {
        // Si no tiene presupuesto configurado, redirigir a initial-budget
        window.location.href = '/initial-budget';
        return;
    }
    
    // Actualizar información del usuario en el header si existe
    updateUserProfile(user);
    
    // Inicializar la sección actual
    loadSection(currentSection);
    
    // TODO: Implementar funcionalidades del dashboard
    // - Cargar datos financieros del usuario desde la API
    // - Inicializar widgets y componentes interactivos
    // - Configurar actualizaciones automáticas de datos
    // - Implementar sistema de notificaciones
    // - Configurar gráficos y visualizaciones
    // - Manejar eventos de usuario en el dashboard
});

// Función para cerrar sesión
function logout() {
    // Limpiar datos del usuario
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
    // Redirigir al login
    window.location.href = '/login';
}

// Función para actualizar el perfil del usuario en el header
function updateUserProfile(user) {
    // Actualizar nombre de usuario si existe el elemento
    const userNameElement = document.querySelector('.user-name');
    if (userNameElement && user.first_name) {
        userNameElement.textContent = user.first_name;
    }
    
    // Actualizar avatar con primera letra del nombre
    const userAvatarElement = document.querySelector('.user-avatar span');
    if (userAvatarElement && user.first_name) {
        userAvatarElement.textContent = user.first_name.charAt(0).toUpperCase();
    }
    
    // Actualizar presupuesto si existe
    const budgetAmountElement = document.querySelector('.budget-amount');
    if (budgetAmountElement && user.initial_budget) {
        budgetAmountElement.textContent = `$ ${formatNumberWithThousands(user.initial_budget)}`;
    }
}

// Función para formatear números con puntos de miles
function formatNumberWithThousands(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// Función para navegar entre secciones
function navigateToSection(section) {
    // Actualizar el estado actual
    currentSection = section;
    
    // Actualizar la navegación activa
    updateActiveNavigation(section);
    
    // Cargar el contenido de la sección
    loadSection(section);
}

// Función para actualizar el elemento activo en la navegación
function updateActiveNavigation(section) {
    // Remover clase activa de todos los links
    const allNavLinks = document.querySelectorAll('.nav-link');
    allNavLinks.forEach(link => {
        link.classList.remove('nav-link--active');
    });
    
    // Agregar clase activa según la sección
    let activeSelector = '';
    switch(section) {
        case 'panel-principal':
            activeSelector = 'a[href="/dashboard"]';
            break;
        case 'ingresos-gastos':
        case 'metas':
        case 'reportes':
        case 'ajustes':
            activeSelector = `button[onclick="navigateToSection('${section}')"]`;
            break;
    }
    
    if (activeSelector) {
        const activeLink = document.querySelector(activeSelector);
        if (activeLink) {
            activeLink.classList.add('nav-link--active');
        }
    }
}

// Función para cargar el contenido de una sección
function loadSection(section) {
    const contentContainer = document.querySelector('.content-container');
    if (!contentContainer) return;
    
    // Limpiar contenido actual
    contentContainer.innerHTML = '';
    
    // Contenido según la sección
    switch(section) {
        case 'panel-principal':
            contentContainer.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; height: 300px; background: white; border-radius: 8px; border: 2px dashed #e2e8f0;">
                    <p style="color: #64748b; font-size: 1.1rem;">Panel Principal - Contenido futuro aquí</p>
                </div>
            `;
            break;
        case 'ingresos-gastos':
            contentContainer.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; height: 300px; background: white; border-radius: 8px; border: 2px dashed #e2e8f0;">
                    <p style="color: #64748b; font-size: 1.1rem;">Ingresos/Gastos - Contenido futuro aquí</p>
                </div>
            `;
            break;
        case 'metas':
            contentContainer.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; height: 300px; background: white; border-radius: 8px; border: 2px dashed #e2e8f0;">
                    <p style="color: #64748b; font-size: 1.1rem;">Metas - Contenido futuro aquí</p>
                </div>
            `;
            break;
        case 'reportes':
            contentContainer.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; height: 300px; background: white; border-radius: 8px; border: 2px dashed #e2e8f0;">
                    <p style="color: #64748b; font-size: 1.1rem;">Reportes - Contenido futuro aquí</p>
                </div>
            `;
            break;
        case 'ajustes':
            contentContainer.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; height: 300px; background: white; border-radius: 8px; border: 2px dashed #e2e8f0;">
                    <p style="color: #64748b; font-size: 1.1rem;">Ajustes - Contenido futuro aquí</p>
                </div>
            `;
            break;
        default:
            contentContainer.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; height: 300px; background: white; border-radius: 8px; border: 2px dashed #e2e8f0;">
                    <p style="color: #64748b; font-size: 1.1rem;">Sección no encontrada</p>
                </div>
            `;
    }
}

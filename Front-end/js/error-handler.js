/**
 * Sistema Global de Manejo de Errores y Notificaciones para GastoSmart
 * 
 * Este archivo proporciona un sistema centralizado para manejar errores
 * y mostrar notificaciones visuales al usuario de manera consistente
 * en toda la aplicación.
 * 
 * @author Kevin Correa - Analista de Requerimientos
 * @version 1.0
 * @date 2025-01-15
 */

class ErrorHandler {
    constructor() {
        this.notificationContainer = null;
        this.init();
    }

    /**
     * Inicializar el sistema de notificaciones
     */
    init() {
        // Crear contenedor de notificaciones si no existe
        if (!document.getElementById('notification-container')) {
            this.createNotificationContainer();
        }
        
        // Manejar errores JavaScript globales
        this.setupGlobalErrorHandling();
        
        console.log('✅ Sistema de manejo de errores inicializado');
    }

    /**
     * Crear contenedor de notificaciones
     */
    createNotificationContainer() {
        const container = document.createElement('div');
        container.id = 'notification-container';
        container.className = 'notification-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 10px;
            max-width: 400px;
            pointer-events: none;
        `;
        document.body.appendChild(container);
        this.notificationContainer = container;
    }

    /**
     * Configurar manejo global de errores
     */
    setupGlobalErrorHandling() {
        // Manejar errores JavaScript
        window.addEventListener('error', (event) => {
            console.error('❌ Error JavaScript:', event.error);
            this.showError('Error inesperado en la aplicación', event.error?.message);
        });

        // Manejar promesas rechazadas
        window.addEventListener('unhandledrejection', (event) => {
            console.error('❌ Promesa rechazada:', event.reason);
            this.showError('Error de conexión o procesamiento', event.reason?.message || 'Error desconocido');
        });
    }

    /**
     * Mostrar notificación de éxito
     */
    showSuccess(message, details = null) {
        this.showNotification(message, 'success', details);
        console.log('✅ Éxito:', message, details || '');
    }

    /**
     * Mostrar notificación de error
     */
    showError(message, details = null) {
        this.showNotification(message, 'error', details);
        console.error('❌ Error:', message, details || '');
    }

    /**
     * Mostrar notificación de advertencia
     */
    showWarning(message, details = null) {
        this.showNotification(message, 'warning', details);
        console.warn('⚠️ Advertencia:', message, details || '');
    }

    /**
     * Mostrar notificación de información
     */
    showInfo(message, details = null) {
        this.showNotification(message, 'info', details);
        console.info('ℹ️ Info:', message, details || '');
    }

    /**
     * Mostrar notificación genérica
     */
    showNotification(message, type = 'info', details = null, duration = 5000) {
        if (!this.notificationContainer) {
            this.createNotificationContainer();
        }

        const notification = document.createElement('div');
        const notificationId = 'notification-' + Date.now();
        notification.id = notificationId;
        notification.className = `notification notification-${type}`;
        
        // Estilos base
        notification.style.cssText = `
            background: ${this.getBackgroundColor(type)};
            color: ${this.getTextColor(type)};
            padding: 16px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            border-left: 4px solid ${this.getBorderColor(type)};
            font-size: 0.9rem;
            line-height: 1.4;
            max-width: 100%;
            word-wrap: break-word;
            pointer-events: auto;
            cursor: pointer;
            transform: translateX(100%);
            transition: transform 0.3s ease, opacity 0.3s ease;
            position: relative;
        `;

        // Contenido de la notificación
        const icon = this.getIcon(type);
        const detailsText = details ? `<br><small style="opacity: 0.8;">${details}</small>` : '';
        
        notification.innerHTML = `
            <div style="display: flex; align-items: flex-start; gap: 10px;">
                <span style="font-size: 1.2em; flex-shrink: 0; margin-top: 2px;">${icon}</span>
                <div style="flex: 1;">
                    <strong>${message}</strong>
                    ${detailsText}
                </div>
                <button style="
                    background: none; 
                    border: none; 
                    color: inherit; 
                    font-size: 1.2em; 
                    cursor: pointer; 
                    opacity: 0.7;
                    padding: 0;
                    margin-left: 10px;
                    line-height: 1;
                " onclick="errorHandler.removeNotification('${notificationId}')">×</button>
            </div>
        `;

        // Agregar al contenedor
        this.notificationContainer.appendChild(notification);

        // Animar entrada
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);

        // Auto-remover después del tiempo especificado
        if (duration > 0) {
            setTimeout(() => {
                this.removeNotification(notificationId);
            }, duration);
        }

        // Permitir cerrar haciendo clic
        notification.addEventListener('click', () => {
            this.removeNotification(notificationId);
        });

        return notificationId;
    }

    /**
     * Remover notificación específica
     */
    removeNotification(notificationId) {
        const notification = document.getElementById(notificationId);
        if (notification) {
            notification.style.transform = 'translateX(100%)';
            notification.style.opacity = '0';
            
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }
    }

    /**
     * Limpiar todas las notificaciones
     */
    clearAll() {
        if (this.notificationContainer) {
            const notifications = this.notificationContainer.querySelectorAll('.notification');
            notifications.forEach(notification => {
                this.removeNotification(notification.id);
            });
        }
    }

    /**
     * Obtener color de fondo según tipo
     */
    getBackgroundColor(type) {
        const colors = {
            success: '#f0fdf4',
            error: '#fef2f2',
            warning: '#fffbeb',
            info: '#f0f9ff'
        };
        return colors[type] || colors.info;
    }

    /**
     * Obtener color de texto según tipo
     */
    getTextColor(type) {
        const colors = {
            success: '#15803d',
            error: '#dc2626',
            warning: '#d97706',
            info: '#1d4ed8'
        };
        return colors[type] || colors.info;
    }

    /**
     * Obtener color de borde según tipo
     */
    getBorderColor(type) {
        const colors = {
            success: '#22c55e',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };
        return colors[type] || colors.info;
    }

    /**
     * Obtener icono según tipo
     */
    getIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    }

    /**
     * Manejar errores de API
     */
    handleApiError(error, context = 'API') {
        console.error(`❌ Error en ${context}:`, error);
        
        let message = 'Error de conexión';
        let details = null;

        if (error.response) {
            // Error de respuesta del servidor
            message = `Error del servidor (${error.response.status})`;
            details = error.response.data?.message || error.response.statusText;
        } else if (error.request) {
            // Error de red
            message = 'Error de conexión con el servidor';
            details = 'Verifica tu conexión a internet';
        } else {
            // Error en la configuración de la petición
            message = 'Error en la aplicación';
            details = error.message;
        }

        this.showError(message, details);
        return { message, details };
    }

    /**
     * Manejar errores de validación
     */
    handleValidationError(errors, context = 'Formulario') {
        console.warn('⚠️ Errores de validación:', errors);
        
        if (Array.isArray(errors)) {
            errors.forEach(error => {
                this.showWarning(`${context}: ${error.message}`, error.field);
            });
        } else if (typeof errors === 'object') {
            Object.keys(errors).forEach(field => {
                this.showWarning(`${context}: ${errors[field]}`, field);
            });
        } else {
            this.showWarning(`${context}: ${errors}`);
        }
    }

    /**
     * Mostrar estado de carga
     */
    showLoading(message = 'Cargando...') {
        return this.showNotification(message, 'info', null, 0);
    }
}

// Crear instancia global
const errorHandler = new ErrorHandler();

// Exportar para uso global
window.errorHandler = errorHandler;

// Auto-inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        errorHandler.init();
    });
} else {
    errorHandler.init();
}

console.log('🔧 Sistema de manejo de errores cargado');

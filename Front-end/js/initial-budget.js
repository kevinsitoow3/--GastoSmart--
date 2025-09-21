/**
 * SISTEMA COMPLETO DE PRESUPUESTO INICIAL
 * Maneja validaciones, metas financieras, cálculo de presupuesto y envío al backend
 * 
 * @author Kevin Correa - Analista de Requerimientos
 * @version 2.0
 * @date 2025-01-21
 */

// ===== CONFIGURACIÓN =====
const API_BASE_URL = 'http://127.0.0.1:8000/api';

// Variables globales
let currentUser = null;
let isSubmitting = false;

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inicializando sistema de presupuesto inicial...');
    
    // Verificar autenticación
    currentUser = getCurrentUser();
    if (!currentUser) {
        console.log('❌ No hay usuario autenticado, redirigiendo al login...');
        window.location.href = '/login';
        return;
    }
    
    // Verificar si ya tiene presupuesto configurado
    if (hasBudgetConfigured(currentUser)) {
        console.log('✅ Usuario ya tiene presupuesto configurado, redirigiendo al dashboard...');
        window.location.href = '/dashboard';
        return;
    }
    
    console.log('✅ Usuario autenticado y listo para configurar presupuesto');
    
    // Inicializar formulario
    initializeForm();
    initializeEventListeners();
    initializeGoalHandling();
    initializeBudgetCalculation();
});

// ===== INICIALIZACIÓN DEL FORMULARIO =====
function initializeForm() {
    const budgetForm = document.getElementById('budgetForm');
    if (!budgetForm) {
        console.error('❌ Formulario no encontrado');
        return;
    }
    
    // Configurar formateo de moneda
    setupCurrencyFormatting();
    
    // Configurar validaciones en tiempo real
    setupRealTimeValidation();
    
    // Configurar envío del formulario
    budgetForm.addEventListener('submit', handleFormSubmit);
    
    console.log('✅ Formulario inicializado correctamente');
}

// ===== CONFIGURACIÓN DE FORMATEO DE MONEDA =====
function setupCurrencyFormatting() {
    const currencyInputs = document.querySelectorAll('.currency-input');
    
    currencyInputs.forEach(input => {
        input.addEventListener('input', formatCurrencyInput);
        input.addEventListener('blur', validateCurrencyField);
        input.addEventListener('focus', clearFieldError);
    });
    
    console.log(`✅ Formateo de moneda configurado para ${currencyInputs.length} campos`);
}

// ===== CONFIGURACIÓN DE VALIDACIONES EN TIEMPO REAL =====
function setupRealTimeValidation() {
    // Validación de salario mínimo
    const incomeAmount = document.getElementById('incomeAmount');
    if (incomeAmount) {
        incomeAmount.addEventListener('blur', validateMinimumSalary);
    }
    
    // Validación de meta personalizada
    const otherGoalName = document.getElementById('otherGoalName');
    if (otherGoalName) {
        otherGoalName.addEventListener('input', validateOtherGoalName);
        otherGoalName.addEventListener('input', updateCharacterCounter);
    }
    
    // Validación de plazos personalizados
    const customTimeframe = document.getElementById('customTimeframe');
    const otherCustomTimeframe = document.getElementById('otherCustomTimeframe');
    
    if (customTimeframe) {
        customTimeframe.addEventListener('input', validateCustomTimeframe);
    }
    
    if (otherCustomTimeframe) {
        otherCustomTimeframe.addEventListener('input', validateCustomTimeframe);
    }
    
    console.log('✅ Validaciones en tiempo real configuradas');
}

// ===== CONFIGURACIÓN DE EVENT LISTENERS =====
function initializeEventListeners() {
    // Manejo de frecuencia de pago
    const payFrequency = document.getElementById('payFrequency');
    if (payFrequency) {
        payFrequency.addEventListener('change', handlePayFrequencyChange);
    }
    
    // Manejo de plazos predefinidos
    const goalTimeframe = document.getElementById('goalTimeframe');
    const otherGoalTimeframe = document.getElementById('otherGoalTimeframe');
    
    if (goalTimeframe) {
        goalTimeframe.addEventListener('change', handleTimeframeChange);
    }
    
    if (otherGoalTimeframe) {
        otherGoalTimeframe.addEventListener('change', handleTimeframeChange);
    }
    
    console.log('✅ Event listeners configurados');
}

// ===== MANEJO DE METAS FINANCIERAS =====
function initializeGoalHandling() {
    // Configurar botones de metas
    const goalCards = document.querySelectorAll('.goal-card input[type="radio"]');
    goalCards.forEach(card => {
        card.addEventListener('change', handleGoalSelection);
    });
    
    console.log('✅ Manejo de metas configurado');
}

function handleGoalSelection(event) {
    const goalType = event.target.value;
    console.log(`🎯 Meta seleccionada: ${goalType}`);
    
    // Limpiar errores previos
    clearAllErrors();
    
    // Ocultar todos los subformularios
    hideAllSubforms();
    
    if (goalType === 'other') {
        showOtherGoalSubform();
    } else {
        showGoalDetailsSubform();
    }
}

function hideAllSubforms() {
    const goalDetailsInput = document.getElementById('goalDetailsInput');
    const otherGoalInput = document.getElementById('otherGoalInput');
    
    if (goalDetailsInput) goalDetailsInput.style.display = 'none';
    if (otherGoalInput) otherGoalInput.style.display = 'none';
}

function showGoalDetailsSubform() {
    const goalDetailsInput = document.getElementById('goalDetailsInput');
    if (goalDetailsInput) {
        goalDetailsInput.style.display = 'block';
        // Limpiar campos de meta personalizada
        clearOtherGoalFields();
    }
}

function showOtherGoalSubform() {
    const otherGoalInput = document.getElementById('otherGoalInput');
    if (otherGoalInput) {
        otherGoalInput.style.display = 'block';
        // Limpiar campos de metas predefinidas
        clearGoalDetailsFields();
    }
}

function clearGoalDetailsFields() {
    const goalAmount = document.getElementById('goalAmount');
    const goalTimeframe = document.getElementById('goalTimeframe');
    const customTimeframe = document.getElementById('customTimeframe');
    const customTimeframeGroup = document.getElementById('customTimeframeGroup');
    
    if (goalAmount) goalAmount.value = '';
    if (goalTimeframe) goalTimeframe.value = '';
    if (customTimeframe) customTimeframe.value = '';
    if (customTimeframeGroup) customTimeframeGroup.style.display = 'none';
}

function clearOtherGoalFields() {
    const otherGoalName = document.getElementById('otherGoalName');
    const otherGoalAmount = document.getElementById('otherGoalAmount');
    const otherGoalTimeframe = document.getElementById('otherGoalTimeframe');
    const otherCustomTimeframe = document.getElementById('otherCustomTimeframe');
    const otherCustomTimeframeGroup = document.getElementById('otherCustomTimeframeGroup');
    
    if (otherGoalName) otherGoalName.value = '';
    if (otherGoalAmount) otherGoalAmount.value = '';
    if (otherGoalTimeframe) otherGoalTimeframe.value = '';
    if (otherCustomTimeframe) otherCustomTimeframe.value = '';
    if (otherCustomTimeframeGroup) otherCustomTimeframeGroup.style.display = 'none';
}

// ===== MANEJO DE FRECUENCIA DE PAGO =====
function handlePayFrequencyChange(event) {
    const frequency = event.target.value;
    console.log(`💰 Frecuencia de pago cambiada a: ${frequency}`);
}

// ===== MANEJO DE PLAZOS =====
function handleTimeframeChange(event) {
    const timeframe = event.target.value;
    console.log(`⏰ Plazo seleccionado: ${timeframe}`);
    
    // Mostrar/ocultar campo de plazo personalizado
    if (timeframe === 'custom') {
        showCustomTimeframeField(event.target);
    } else {
        hideCustomTimeframeField(event.target);
    }
}

function showCustomTimeframeField(selectElement) {
    const isOtherGoal = selectElement.id === 'otherGoalTimeframe';
    const customGroupId = isOtherGoal ? 'otherCustomTimeframeGroup' : 'customTimeframeGroup';
    const customGroup = document.getElementById(customGroupId);
    
    if (customGroup) {
        customGroup.style.display = 'block';
    }
}

function hideCustomTimeframeField(selectElement) {
    const isOtherGoal = selectElement.id === 'otherGoalTimeframe';
    const customGroupId = isOtherGoal ? 'otherCustomTimeframeGroup' : 'customTimeframeGroup';
    const customGroup = document.getElementById(customGroupId);
    
    if (customGroup) {
        customGroup.style.display = 'none';
    }
}

// ===== CÁLCULO Y AJUSTE DE PRESUPUESTO =====
function initializeBudgetCalculation() {
    // Configurar sliders de presupuesto
    setupBudgetSliders();
    
    console.log('✅ Sistema de cálculo de presupuesto inicializado');
}

function setupBudgetSliders() {
    const sliders = document.querySelectorAll('.category-slider');
    const percentageInputs = document.querySelectorAll('.category-percentage input');
    
    sliders.forEach(slider => {
        slider.addEventListener('input', handleSliderChange);
    });
    
    percentageInputs.forEach(input => {
        input.addEventListener('input', handlePercentageChange);
    });
}

function handleSliderChange(event) {
    const slider = event.target;
    const percentageInput = document.getElementById(slider.id.replace('Slider', 'Percentage'));
    const amountSpan = document.getElementById(slider.id.replace('Slider', 'Amount'));
    
    if (percentageInput) {
        percentageInput.value = slider.value;
    }
    
    updateBudgetAmounts();
    validateBudgetPercentages();
}

function handlePercentageChange(event) {
    const percentageInput = event.target;
    const slider = document.getElementById(percentageInput.id.replace('Percentage', 'Slider'));
    
    if (slider) {
        slider.value = percentageInput.value;
    }
    
    updateBudgetAmounts();
    validateBudgetPercentages();
}

function updateBudgetAmounts() {
    const incomeAmount = parseFormattedNumber(document.getElementById('incomeAmount').value);
    
    if (incomeAmount <= 0) return;
    
    const categories = ['necesidades', 'deseos', 'ahorros'];
    
    categories.forEach(category => {
        const percentage = parseInt(document.getElementById(`${category}Percentage`).value) || 0;
        const amount = (incomeAmount * percentage) / 100;
        const amountSpan = document.getElementById(`${category}Amount`);
        
        if (amountSpan) {
            amountSpan.textContent = formatCurrency(amount);
            }
        });
    }

function validateBudgetPercentages() {
    const totalPercentage = getTotalBudgetPercentage();
    const validationMessage = document.getElementById('validationMessage');
    const totalPercentageSpan = document.getElementById('totalPercentage');
    
    if (totalPercentageSpan) {
        totalPercentageSpan.textContent = `${totalPercentage}%`;
    }
    
    if (validationMessage) {
        if (totalPercentage === 100) {
            validationMessage.textContent = '✅ Presupuesto balanceado correctamente';
            validationMessage.className = 'validation-message success';
        } else if (totalPercentage > 100) {
            validationMessage.textContent = `⚠️ Exceso de ${totalPercentage - 100}%`;
            validationMessage.className = 'validation-message warning';
        } else {
            validationMessage.textContent = `ℹ️ Faltan ${100 - totalPercentage}% por asignar`;
            validationMessage.className = 'validation-message info';
        }
    }
}

function getTotalBudgetPercentage() {
    const categories = ['necesidades', 'deseos', 'ahorros'];
    return categories.reduce((total, category) => {
        const percentage = parseInt(document.getElementById(`${category}Percentage`).value) || 0;
        return total + percentage;
    }, 0);
}

// ===== VALIDACIONES =====
function formatCurrencyInput(event) {
    const input = event.target;
    let value = input.value.replace(/[^\d]/g, '');
    
    if (value === '') {
        input.value = '';
        return;
    }
    
    // Limitar a 12 dígitos
    if (value.length > 12) {
        value = value.substring(0, 12);
    }
    
    // Formatear con puntos de miles
    const formattedValue = formatNumberWithThousands(parseInt(value));
    input.value = formattedValue;
    
    // Limpiar errores al escribir
    clearFieldError(event);
}

function validateMinimumSalary(event) {
    const input = event.target;
    const value = parseFormattedNumber(input.value);
    
    if (value > 0 && value < 100000) {
        showFieldError(input, 'El salario mínimo debe ser mayor a $100,000 COP');
        return false;
    }
    
    return true;
}

function validateCurrencyField(event) {
    const input = event.target;
    const value = parseFormattedNumber(input.value);
    
    if (value <= 0) {
        showFieldError(input, 'Este campo es obligatorio y debe ser mayor a 0');
        return false;
    }
    
    return true;
}

function validateOtherGoalName(event) {
    const input = event.target;
    const value = input.value.trim();
    
    if (value.length < 3) {
        showFieldError(input, 'El nombre de la meta debe tener al menos 3 caracteres');
        return false;
    }
    
    if (value.length > 50) {
        showFieldError(input, 'El nombre de la meta no puede exceder 50 caracteres');
        return false;
    }
    
    return true;
}

function validateCustomTimeframe(event) {
    const input = event.target;
    const value = parseInt(input.value);
    
    if (isNaN(value) || value < 1 || value > 120) {
        showFieldError(input, 'El plazo debe estar entre 1 y 120 meses');
        return false;
    }
    
    return true;
}

function updateCharacterCounter(event) {
    const input = event.target;
    const counter = document.getElementById('nameCounter');
    const value = input.value;
    
    if (counter) {
        counter.textContent = value.length;
        
        if (value.length > 50) {
            counter.style.color = '#dc2626';
        } else if (value.length > 40) {
            counter.style.color = '#f59e0b';
        } else {
            counter.style.color = '#6b7280';
        }
    }
}

// ===== MANEJO DE ENVÍO DEL FORMULARIO =====
async function handleFormSubmit(event) {
    event.preventDefault();
    
    if (isSubmitting) {
        console.log('⏳ Ya se está enviando el formulario...');
        return;
    }
    
    console.log('📤 Iniciando envío del formulario...');
    
    // Validar formulario completo
    const validation = validateCompleteForm();
    if (!validation.isValid) {
        console.log('❌ Validación fallida:', validation.errors);
        showErrors(validation.errors);
        return;
    }
    
    isSubmitting = true;
    showLoading(true);
    
    try {
        // Obtener datos del formulario
        const formData = getFormData();
        console.log('📋 Datos del formulario:', formData);
        
        // Enviar al backend
        const response = await updateUserBudget(formData);
        
        if (response.success) {
            console.log('✅ Presupuesto actualizado exitosamente');
            
            // Actualizar datos del usuario
            updateUserData(response.user);
            
            // Mostrar éxito y redirigir
            showSuccess('¡Presupuesto configurado exitosamente! Redirigiendo al dashboard...');
            
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 2000);
            
    } else {
            throw new Error(response.error || 'Error desconocido');
        }
        
    } catch (error) {
        console.error('❌ Error al enviar formulario:', error);
        showError(error.message || 'Error al configurar el presupuesto. Intenta de nuevo.');
    } finally {
        isSubmitting = false;
        showLoading(false);
    }
}

function validateCompleteForm() {
    const errors = [];
    
    // Validar salario
    const incomeAmount = document.getElementById('incomeAmount');
    if (!incomeAmount || !validateMinimumSalary({ target: incomeAmount })) {
        errors.push('Ingresa un salario válido (mínimo $100,000 COP)');
    }
    
    // Validar frecuencia de pago
    const payFrequency = document.getElementById('payFrequency');
    if (!payFrequency || !payFrequency.value) {
        errors.push('Selecciona una frecuencia de pago');
    }
    
    // Validar meta seleccionada
    const selectedGoal = document.querySelector('input[name="goal"]:checked');
    if (!selectedGoal) {
        errors.push('Selecciona una meta financiera');
        return { isValid: false, errors };
    }
    
    // Validar detalles de la meta
    if (selectedGoal.value === 'other') {
        const otherGoalName = document.getElementById('otherGoalName');
        const otherGoalAmount = document.getElementById('otherGoalAmount');
        const otherGoalTimeframe = document.getElementById('otherGoalTimeframe');
        
        if (!otherGoalName || !otherGoalName.value.trim()) {
            errors.push('Ingresa el nombre de tu meta personalizada');
        }
        
        if (!otherGoalAmount || !validateCurrencyField({ target: otherGoalAmount })) {
            errors.push('Ingresa un monto válido para tu meta');
        }
        
        if (!otherGoalTimeframe || !otherGoalTimeframe.value) {
            errors.push('Selecciona un plazo para tu meta');
        }
        
        // Validar plazo personalizado si está activo
        const otherCustomTimeframeGroup = document.getElementById('otherCustomTimeframeGroup');
        if (otherCustomTimeframeGroup && otherCustomTimeframeGroup.style.display !== 'none') {
            const otherCustomTimeframe = document.getElementById('otherCustomTimeframe');
            if (!otherCustomTimeframe || !validateCustomTimeframe({ target: otherCustomTimeframe })) {
                errors.push('Ingresa un plazo personalizado válido (1-120 meses)');
            }
        }
        
    } else {
        const goalAmount = document.getElementById('goalAmount');
        const goalTimeframe = document.getElementById('goalTimeframe');
        
        if (!goalAmount || !validateCurrencyField({ target: goalAmount })) {
            errors.push('Ingresa un monto válido para tu meta');
        }
        
        if (!goalTimeframe || !goalTimeframe.value) {
            errors.push('Selecciona un plazo para tu meta');
        }
        
        // Validar plazo personalizado si está activo
        const customTimeframeGroup = document.getElementById('customTimeframeGroup');
        if (customTimeframeGroup && customTimeframeGroup.style.display !== 'none') {
            const customTimeframe = document.getElementById('customTimeframe');
            if (!customTimeframe || !validateCustomTimeframe({ target: customTimeframe })) {
                errors.push('Ingresa un plazo personalizado válido (1-120 meses)');
            }
        }
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

function getFormData() {
    const incomeAmount = parseFormattedNumber(document.getElementById('incomeAmount').value);
    const payFrequency = document.getElementById('payFrequency').value;
    
    // El backend solo espera initial_budget y budget_period
    // Las metas financieras se pueden guardar en localStorage por ahora
    // o implementar un endpoint separado para metas en el futuro
    
    const formData = {
        initial_budget: incomeAmount,
        budget_period: payFrequency
    };
    
    // Guardar datos de metas en localStorage para uso futuro
    const selectedGoal = document.querySelector('input[name="goal"]:checked');
    if (selectedGoal) {
        let goalData = {};
        
        if (selectedGoal.value === 'other') {
            goalData = {
                goal_type: 'other',
                goal_name: document.getElementById('otherGoalName').value.trim(),
                goal_amount: parseFormattedNumber(document.getElementById('otherGoalAmount').value),
                goal_timeframe: getSelectedTimeframe('otherGoalTimeframe', 'otherCustomTimeframe')
            };
        } else {
            goalData = {
                goal_type: selectedGoal.value,
                goal_amount: parseFormattedNumber(document.getElementById('goalAmount').value),
                goal_timeframe: getSelectedTimeframe('goalTimeframe', 'customTimeframe')
            };
        }
        
        // Guardar metas en localStorage
        localStorage.setItem('userFinancialGoal', JSON.stringify(goalData));
        console.log('💾 Meta financiera guardada en localStorage:', goalData);
    }
    
    return formData;
}

function getSelectedTimeframe(selectId, customId) {
    const select = document.getElementById(selectId);
    const customGroup = document.getElementById(customId.replace('Timeframe', 'TimeframeGroup'));
    
    if (select && select.value === 'custom' && customGroup && customGroup.style.display !== 'none') {
        const customInput = document.getElementById(customId);
        return customInput ? parseInt(customInput.value) : null;
    }
    
    return select ? parseInt(select.value) : null;
}

// ===== INTEGRACIÓN CON API =====
async function updateUserBudget(formData) {
    console.log('📤 Enviando datos al backend:');
    console.log('  - Usuario ID:', currentUser.id);
    console.log('  - Datos:', JSON.stringify(formData, null, 2));
    console.log('  - URL:', `${API_BASE_URL}/users/${currentUser.id}/budget`);
    
    const response = await fetch(`${API_BASE_URL}/users/${currentUser.id}/budget`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
    });
    
    console.log('📥 Respuesta del servidor:');
    console.log('  - Status:', response.status);
    console.log('  - Status Text:', response.statusText);
    console.log('  - Headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
        const updatedUser = await response.json();
        console.log('✅ Usuario actualizado:', updatedUser);
        return { success: true, user: updatedUser };
    } else {
        let errorMessage = 'Error al actualizar el presupuesto';
        
        try {
            const errorData = await response.json();
            console.log('❌ Error del servidor (JSON):', JSON.stringify(errorData, null, 2));
            
            if (errorData.detail) {
                errorMessage = errorData.detail;
            } else if (errorData.message) {
                errorMessage = errorData.message;
            } else if (Array.isArray(errorData)) {
                // Manejar errores de validación de Pydantic
                errorMessage = errorData.map(err => {
                    const field = err.loc ? err.loc.join('.') : 'Campo';
                    const message = err.msg || 'Error de validación';
                    return `${field}: ${message}`;
                }).join(', ');
            } else {
                errorMessage = JSON.stringify(errorData);
            }
        } catch (parseError) {
            console.log('❌ Error al parsear respuesta de error:', parseError);
            // Intentar leer como texto
            try {
                const errorText = await response.text();
                console.log('❌ Error del servidor (texto):', errorText);
                errorMessage = `Error del servidor (${response.status}): ${errorText || response.statusText}`;
            } catch (textError) {
                errorMessage = `Error del servidor (${response.status}): ${response.statusText}`;
            }
        }
        
        throw new Error(errorMessage);
    }
}

// ===== FUNCIONES UTILITARIAS =====
function formatNumberWithThousands(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function parseFormattedNumber(formattedString) {
    return parseInt(formattedString.replace(/\./g, '')) || 0;
}

function formatCurrency(amount) {
    return `$${formatNumberWithThousands(amount)}`;
}

function clearFieldError(event) {
    const input = event.target;
    const inputGroup = input.closest('.input-group');
    if (inputGroup) {
        const errorMessage = inputGroup.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    }
}

function showFieldError(field, message) {
    const inputGroup = field.closest('.input-group');
    if (!inputGroup) return;
    
    // Remover error previo
    const existingError = inputGroup.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Crear nuevo error
    const errorContainer = document.createElement('div');
    errorContainer.className = 'error-message';
    errorContainer.textContent = message;
    
    inputGroup.appendChild(errorContainer);
    
    // Auto-remover después de 5 segundos
    setTimeout(() => {
        if (errorContainer && errorContainer.parentNode) {
            errorContainer.remove();
        }
    }, 5000);
}

function clearAllErrors() {
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(msg => msg.remove());
    
    const toasts = document.querySelectorAll('.toast-message');
    toasts.forEach(toast => toast.remove());
}

function showErrors(errors) {
    if (!Array.isArray(errors) || errors.length === 0) return;
    
    const errorMessage = errors.join('\n');
    showToastMessage(errorMessage, 'error');
}

function showLoading(loading) {
    const submitBtn = document.getElementById('submitBudgetBtn');
    if (submitBtn) {
        const btnText = submitBtn.querySelector('.btn-text');
        const btnSpinner = submitBtn.querySelector('.btn-spinner');
        
        if (loading) {
            submitBtn.disabled = true;
            if (btnText) btnText.textContent = 'Configurando...';
            if (btnSpinner) btnSpinner.style.display = 'inline-block';
        } else {
            submitBtn.disabled = false;
            if (btnText) btnText.textContent = 'Enviar';
            if (btnSpinner) btnSpinner.style.display = 'none';
        }
    }
}

function showError(message) {
    showToastMessage(message, 'error');
}

function showSuccess(message) {
    showToastMessage(message, 'success');
}

function showToastMessage(message, type = 'error') {
    // Limpiar toasts previos
    const existingToasts = document.querySelectorAll('.toast-message');
    existingToasts.forEach(toast => toast.remove());
    
    // Crear contenedor de toast
    const toastContainer = document.createElement('div');
    toastContainer.className = `toast-message toast-${type}`;
    toastContainer.setAttribute('aria-live', 'polite');
    toastContainer.setAttribute('role', 'alert');
    toastContainer.textContent = message;
    
    // Añadir al body
    document.body.appendChild(toastContainer);
    
    // Auto-remover después de 5 segundos
    setTimeout(() => {
        if (toastContainer && toastContainer.parentNode) {
            toastContainer.remove();
        }
    }, 5000);
}

// ===== FUNCIONES GLOBALES (para compatibilidad con HTML) =====
window.onGoalSelected = function(goalType) {
    const radioButton = document.querySelector(`input[name="goal"][value="${goalType}"]`);
    if (radioButton) {
        radioButton.checked = true;
        handleGoalSelection({ target: radioButton });
    }
};

window.onGenerateInitialBudget = function() {
    const form = document.getElementById('budgetForm');
    if (form) {
        form.dispatchEvent(new Event('submit'));
    }
};

console.log('✅ Sistema de presupuesto inicial cargado correctamente');

// Configuración de la API
const API_BASE_URL = 'http://127.0.0.1:8000/api';

// Manejo del formulario de presupuesto inicial
document.addEventListener('DOMContentLoaded', function() {
    const budgetForm = document.getElementById('budgetForm');
    const incomeAmountField = document.getElementById('incomeAmount');
    const goalAmountField = document.getElementById('goalAmount');
    const otherGoalAmountField = document.getElementById('otherGoalAmount');
    
    // Configurar formateo de moneda en campos
    if (incomeAmountField) {
        incomeAmountField.addEventListener('input', formatCurrencyInput);
        incomeAmountField.addEventListener('blur', validateMinimumSalary);
    }
    
    if (goalAmountField) {
        goalAmountField.addEventListener('input', formatCurrencyInput);
    }
    
    if (otherGoalAmountField) {
        otherGoalAmountField.addEventListener('input', formatCurrencyInput);
    }
    
    // Verificar si hay usuario logueado
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        // Si no hay usuario, redirigir al login
        window.location.href = '/login';
        return;
    }
    
    // Pre-llenar formulario con datos del usuario
    if (user.initial_budget) {
        document.getElementById('initial-budget').value = user.initial_budget;
    }
    if (user.budget_period) {
        document.getElementById('budget-period').value = user.budget_period;
    }
    
    if (budgetForm) {
        budgetForm.addEventListener('submit', async function(e) {
            e.preventDefault(); // Prevenir envío normal del formulario
            
            // Obtener datos del formulario
            const initialBudget = parseFloat(document.getElementById('initial-budget').value);
            const budgetPeriod = document.getElementById('budget-period').value;
            
            // Validar campos
            if (!initialBudget || initialBudget <= 0) {
                showError('Por favor, ingresa un presupuesto válido');
                return;
            }
            
            if (!budgetPeriod) {
                showError('Por favor, selecciona un período de presupuesto');
                return;
            }
            
            try {
                // Mostrar indicador de carga
                showLoading(true);
                
                // Realizar petición de actualización de presupuesto
                const response = await fetch(`http://127.0.0.1:8000/api/users/${user.id}/budget`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        initial_budget: initialBudget,
                        budget_period: budgetPeriod
                    })
                });
                
                if (response.ok) {
                    const updatedUser = await response.json();
                    
                    // Actualizar datos del usuario en localStorage
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                    
                    // Mostrar mensaje de éxito
                    showSuccess('¡Presupuesto configurado exitosamente!');
                    
                    // Redirigir al dashboard después de 2 segundos
                    setTimeout(() => {
                        window.location.href = '/dashboard';
                    }, 2000);
                    
                } else {
                    const error = await response.json();
                    showError(error.detail || 'Error al actualizar el presupuesto');
                }
                
            } catch (error) {
                console.error('Error al actualizar presupuesto:', error);
                showError('Error de conexión. Intenta de nuevo.');
            } finally {
                showLoading(false);
            }
        });
    }
});

// ===== FUNCIONES UTILITARIAS PARA FORMATEO DE MONEDA =====

function formatCurrencyInput(event) {
    const input = event.target;
    let value = input.value.replace(/[^\d]/g, ''); // Solo números
    
    if (value === '') {
        input.value = '';
        return;
    }
    
    // Prevenir valores demasiado largos (máximo 12 dígitos)
    if (value.length > 12) {
        value = value.substring(0, 12);
    }
    
    // Formatear con puntos de miles
    const formattedValue = formatNumberWithThousands(parseInt(value));
    input.value = formattedValue;
}

function formatNumberWithThousands(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function parseFormattedNumber(formattedString) {
    return parseInt(formattedString.replace(/\./g, '')) || 0;
}

function validateMinimumSalary(event) {
    const input = event.target;
    const value = parseFormattedNumber(input.value);
    
    // Remover mensaje de error previo
    const existingError = input.parentNode.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    if (value > 0 && value < 100000) {
        showFieldError(input, 'El salario mínimo debe ser mayor a $100.000 COP');
    }
}

function showFieldError(field, message) {
    const errorContainer = document.createElement('div');
    errorContainer.className = 'error-message';
    errorContainer.textContent = message;
    
    const inputGroup = field.closest('.input-group');
    if (inputGroup) {
        inputGroup.appendChild(errorContainer);
        
        // Auto-remover después de 5 segundos
        setTimeout(() => {
            if (errorContainer && errorContainer.parentNode) {
                errorContainer.remove();
            }
        }, 5000);
    }
}

// ===== FUNCIONES PARA MANEJO DE METAS =====

function onGoalSelected(goalType) {
    const goalDetailsInput = document.getElementById('goalDetailsInput');
    const otherGoalInput = document.getElementById('otherGoalInput');
    
    // Limpiar mensajes de error previos
    clearAllErrorMessages();
    
    // Ocultar ambas secciones primero
    goalDetailsInput.style.display = 'none';
    otherGoalInput.style.display = 'none';
    
    if (goalType === 'other') {
        // Limpiar campos de metas predeterminadas
        document.getElementById('goalAmount').value = '';
        document.getElementById('goalTimeframe').value = '';
        
        // Mostrar formulario de meta personalizada
        otherGoalInput.style.display = 'block';
    } else {
        // Limpiar campos de meta personalizada
        document.getElementById('otherGoalName').value = '';
        document.getElementById('otherGoalAmount').value = '';
        document.getElementById('otherGoalTimeframe').value = '';
        
        // Mostrar formulario de metas predefinidas
        goalDetailsInput.style.display = 'block';
    }
}


// ===== FUNCIONES DE VALIDACIÓN Y ENVÍO =====

function onGenerateInitialBudget() {
    // Esta función será llamada cuando se envíe el formulario
    console.log('Generando presupuesto inicial...');
    
    // Validar datos
    const incomeValue = parseFormattedNumber(document.getElementById('incomeAmount').value);
    
    if (incomeValue < 100000) {
        showFieldError(document.getElementById('incomeAmount'), 'El salario debe ser mayor a $100.000 COP');
        return false;
    }
    
    const selectedGoal = document.querySelector('input[name="goal"]:checked');
    if (!selectedGoal) {
        showGeneralError('Por favor selecciona una meta financiera');
        return false;
    }
    
    // Validar campos específicos según la meta
    if (selectedGoal.value === 'other') {
        const otherGoalName = document.getElementById('otherGoalName').value.trim();
        const otherGoalAmount = parseFormattedNumber(document.getElementById('otherGoalAmount').value);
        const otherGoalTimeframe = document.getElementById('otherGoalTimeframe').value;
        
        if (!otherGoalName || !otherGoalAmount || !otherGoalTimeframe) {
            showGeneralError('Por favor completa todos los campos de tu meta personalizada');
            return false;
        }
    } else {
        const goalAmount = parseFormattedNumber(document.getElementById('goalAmount').value);
        const goalTimeframe = document.getElementById('goalTimeframe').value;
        
        if (!goalAmount || !goalTimeframe) {
            showGeneralError('Por favor completa los detalles de tu meta');
            return false;
        }
    }
    
    showGeneralSuccess('¡Configuración guardada exitosamente! Redirigiendo al dashboard...');
    
    // Simular redirección al dashboard después de 2 segundos
    setTimeout(() => {
        window.location.href = '/dashboard';
    }, 2000);
    
    return false; // Prevenir envío del formulario
}

function clearAllErrorMessages() {
    // Remover todos los mensajes de error individuales
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(msg => msg.remove());
    
    // Remover toasts
    const toasts = document.querySelectorAll('.toast-message');
    toasts.forEach(toast => toast.remove());
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
    
    // Añadir al body para posicionamiento fijo
    document.body.appendChild(toastContainer);
    
    // Auto-remover después de 5 segundos
    setTimeout(() => {
        if (toastContainer && toastContainer.parentNode) {
            toastContainer.remove();
        }
    }, 5000);
}

function showGeneralError(message) {
    showToastMessage(message, 'error');
}

function showGeneralSuccess(message) {
    showToastMessage(message, 'success');
}
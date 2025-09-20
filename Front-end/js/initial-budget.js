// Manejo del formulario de presupuesto inicial
document.addEventListener('DOMContentLoaded', function() {
    const budgetForm = document.getElementById('budget-form');
    
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

// Función para mostrar errores
function showError(message) {
    const errorDiv = document.getElementById('error-message');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        
        // Ocultar error después de 5 segundos
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    }
}

// Función para mostrar mensajes de éxito
function showSuccess(message) {
    const successDiv = document.getElementById('success-message');
    if (successDiv) {
        successDiv.textContent = message;
        successDiv.style.display = 'block';
        
        // Ocultar mensaje después de 3 segundos
        setTimeout(() => {
            successDiv.style.display = 'none';
        }, 3000);
    }
}

// Función para mostrar/ocultar indicador de carga
function showLoading(show) {
    const submitBtn = document.querySelector('#budget-form button[type="submit"]');
    if (submitBtn) {
        if (show) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Configurando presupuesto...';
        } else {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Configurar Presupuesto';
        }
    }
}
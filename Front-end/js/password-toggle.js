/**
 * Funcionalidad de Toggle de Visibilidad de Contraseña
 */
document.addEventListener('DOMContentLoaded', function() {
    const passwordToggles = document.querySelectorAll('.password-toggle');
    
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const input = this.parentElement.querySelector('input');
            
            if (input.type === 'password') {
                input.type = 'text';
                // Mostrar ojo cerrado, ocultar ojo abierto
                this.querySelector('.eye-icon').style.display = 'none';
                this.querySelector('.eye-off-icon').style.display = 'block';
            } else {
                input.type = 'password';
                // Mostrar ojo abierto, ocultar ojo cerrado
                this.querySelector('.eye-icon').style.display = 'block';
                this.querySelector('.eye-off-icon').style.display = 'none';
            }
        });
    });
});
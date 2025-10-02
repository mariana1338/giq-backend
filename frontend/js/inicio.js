// /frontend/js/inicio.js

// --- FUNCIÓN DE DECODIFICACIÓN JWT ---
function decodeJwt(token) {
    if (!token) return null;
    
    // 🔑 REFUERZO DE LIMPIEZA: Asegura que el token no tenga espacios.
    const cleanToken = String(token).trim(); 

    try {
        // Usa cleanToken para el split
        const base64Url = cleanToken.split('.')[1]; 
        if (!base64Url) return null; // Evita el error de 'undefined' si el token es inválido

        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Error al decodificar el JWT. Token inválido o corrupto:", e);
        return null;
    }
}
// --- FIN FUNCIÓN DE DECODIFICACIÓN ---


// -----------------------------------------------------
// --- LÓGICA PRINCIPAL (Animación y Autorización) ---
// -----------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    // 1. Lógica de animación de texto
    const el = document.querySelector('.welcome-text');
    if(el) {
        const text = el.textContent.trim();
        el.innerHTML = '';
        Array.from(text).forEach((ch, idx) => {
            const span = document.createElement('span');
            span.textContent = ch;
            span.style.setProperty('--i', idx);
            if (ch === ' ') {
                span.style.width = '0.45em';
                span.style.display = 'inline-block';
            }
            el.appendChild(span);
        });
    }

    // 2. Lógica de Ocultamiento del Botón (Autorización)
    const token = localStorage.getItem('jwt_token');
    const botonAlmacenes = document.getElementById('btn-panel-almacenes'); 

    if (botonAlmacenes) { 
        if (token) {
            const payload = decodeJwt(token);
            // Si payload es null (por token corrupto), userRole será null.
            const userRole = payload ? payload.rol : null; 
            
            // Convertimos el rol a minúsculas para una comparación segura
            const normalizedRole = userRole ? String(userRole).toLowerCase() : '';

            // 🔑 Lógica: Mostrar solo si es 'administrador'
            if (normalizedRole === 'administrador') {
                botonAlmacenes.style.display = 'block'; 
                console.log("Rol:", userRole, "- Botón de Almacenes VISIBLE.");
            } else {
                // Se oculta si es 'usuario', nulo o cualquier otro valor
                botonAlmacenes.style.display = 'none'; 
                console.log("Rol:", userRole, "- Botón de Almacenes OCULTO.");
            }
        } else {
            // Si no hay token (no logueado)
            botonAlmacenes.style.display = 'none';
        }
    }
    // ... otras funciones de inicio.js (si las tienes)
});
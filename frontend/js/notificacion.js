// /frontend/js/notificacion.js

const notifListContainer = document.getElementById('notifList');

// Asumimos que la función apiFetch está disponible globalmente desde otro archivo (ej. api.js).
// Ejemplo de la estructura de la función (NO la incluyas aquí si ya está en otro lado):
// async function apiFetch(url, options) { ... } 
// const CURRENT_USER_ID = 1; // Necesario para la prueba, usa el ID de un admin real.

// -----------------------------------------------------------------
// 1. LÓGICA DE RENDERIZADO
// -----------------------------------------------------------------

/**
 * Renderiza una sola notificación en el contenedor.
 * @param {object} notificacion - Objeto notificación de la API.
 */
function renderNotificacion(notificacion) {
    const item = document.createElement('div');
    const isLeida = notificacion.leida;
    // Utilizamos las clases de tu HTML de demostración (notif-card, unread)
    item.className = `notif-card ${isLeida ? '' : 'unread'}`;
    item.dataset.id = notificacion.id_notificacion; // Usar el ID de la base de datos

    const fechaMovimiento = new Date(notificacion.fecha).toLocaleDateString('es-CO', {
        year: 'numeric', month: 'short', day: 'numeric', 
        hour: '2-digit', minute: '2-digit'
    });

    const titulo = notificacion.instrumento 
        ? `Alerta: ${notificacion.instrumento.nombre}`
        : 'Notificación General';
        
    const icono = notificacion.instrumento ? '⚠️' : '🔔'; // Ejemplo de icono

    item.innerHTML = `
        <div class="notif-icon">${icono}</div>
        <div class="notif-content">
            <div class="notif-title">
                <span>${titulo}</span>
                <small class="notif-date">${fechaMovimiento}</small>
            </div>
            <div class="notif-desc">${notificacion.mensaje}</div>
        </div>
        <div class="notif-actions-ctrl">
            <button 
                class="notif-mark" 
                title="${isLeida ? 'Marcar como no leída' : 'Marcar como leída'}"
                onclick="toggleLeida(${notificacion.id_notificacion}, ${isLeida})"
                ${isLeida ? 'style="opacity: 0.5;"' : ''}
            >
                ${isLeida ? '🔁' : '✔️'}
            </button>
            <button 
                class="notif-mark" 
                title="Eliminar"
                onclick="eliminarNoti(${notificacion.id_notificacion})">
                🗑️
            </button>
        </div>
    `;

    notifListContainer.appendChild(item);
}


/**
 * Carga todas las notificaciones desde la API y las renderiza.
 */
async function cargarNotificaciones() {
    if (!notifListContainer) return;
    notifListContainer.innerHTML = '<div class="notif-empty">Cargando notificaciones...</div>';

    try {
        const url = '/notificacion';
        const respuesta = await apiFetch(url, { method: 'GET' });
        // Asumimos que la respuesta es directa o viene en una propiedad 'data'
        const notificaciones = respuesta.data || respuesta || [];

        notifListContainer.innerHTML = ''; // Limpiar
        
        if (notificaciones.length === 0) {
            notifListContainer.innerHTML = '<div class="notif-empty">No hay notificaciones.</div>';
            return;
        }

        // Mostrar las no leídas primero
        notificaciones.sort((a, b) => (a.leida === b.leida ? 0 : a.leida ? 1 : -1));

        notificaciones.forEach(renderNotificacion);

    } catch (error) {
        console.error("Error al cargar notificaciones:", error);
        notifListContainer.innerHTML = '<div class="notif-empty error-state">Error al cargar. Verifique la consola.</div>';
    }
}

// -----------------------------------------------------------------
// 2. HANDLERS DE ACCIÓN (Llamados desde el HTML)
// -----------------------------------------------------------------

/**
 * Alterna el estado 'leida' de una notificación específica.
 */
async function toggleLeida(id, estadoActual) {
    try {
        const nuevoEstado = !estadoActual;
        const url = `/notificacion/${id}`; 
        
        await apiFetch(url, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ leida: nuevoEstado }) 
        });

        // Recargar para aplicar cambios y reordenar
        cargarNotificaciones();

    } catch (error) {
        console.error(`Error al actualizar notificación ${id}:`, error);
        alert('Error al actualizar el estado de la notificación.');
    }
}

/**
 * Marcar TODAS las notificaciones como leídas.
 */
async function marcarTodasLeidas() {
    if (!confirm('¿Desea marcar todas las notificaciones como leídas?')) return;

    try {
        // 💡 Requiere el endpoint PATCH /notificacion/marcar-todas-leidas
        const url = '/notificacion/marcar-todas-leidas'; 
        await apiFetch(url, { method: 'PATCH' });

        cargarNotificaciones(); 

    } catch (error) {
        console.error("Error al marcar todas como leídas:", error);
        alert('Error al marcar todas como leídas. Asegúrese de que el endpoint existe.');
    }
}

/**
 * Eliminar TODAS las notificaciones leídas.
 */
async function borrarLeidas() {
    if (!confirm('¿Desea eliminar todas las notificaciones leídas? Esta acción es irreversible.')) return;

    try {
        // 💡 Requiere el endpoint DELETE /notificacion/eliminar-leidas
        const url = '/notificacion/eliminar-leidas'; 
        await apiFetch(url, { method: 'DELETE' });

        cargarNotificaciones(); 

    } catch (error) {
        console.error("Error al eliminar notificaciones leídas:", error);
        alert('Error al eliminar notificaciones leídas. Asegúrese de que el endpoint existe.');
    }
}

/**
 * Elimina una notificación específica.
 */
async function eliminarNoti(id) {
    if (!confirm('¿Está seguro de que desea eliminar esta notificación?')) return;

    try {
        const url = `/notificacion/${id}`;
        await apiFetch(url, { method: 'DELETE' });

        // Actualizar la lista
        cargarNotificaciones();

    } catch (error) {
        console.error(`Error al eliminar notificación ${id}:`, error);
        alert('Error al eliminar la notificación.');
    }
}

/**
 * Simula la adición de una notificación de prueba usando el endpoint POST.
 */
async function agregarNotiPrueba() {
    // ⚠️ ATENCIÓN: Reemplaza estos IDs con valores reales de tu BD para pruebas
    const TEST_USER_ID = 1; 
    const TEST_INSTRUMENTO_ID = 2; 

    try {
        const url = '/notificacion';
        const nuevaNoti = {
            mensaje: "PRUEBA MANUAL: Esta es una notificación agregada para pruebas.",
            id_usuario: TEST_USER_ID,
            id_instrumento: TEST_INSTRUMENTO_ID
        };

        await apiFetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevaNoti)
        });

        cargarNotificaciones();
        alert('Notificación de prueba agregada exitosamente.');

    } catch (error) {
        console.error("Error al agregar notificación de prueba:", error);
        alert('Error al agregar notificación de prueba. Asegúrese de que los IDs de prueba existen.');
    }
}


// -----------------------------------------------------------------
// 3. INICIALIZACIÓN
// -----------------------------------------------------------------

window.addEventListener('load', cargarNotificaciones);
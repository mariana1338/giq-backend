// /frontend/js/perfil.js

// ⚠️ Asegúrate de que apiFetch está cargado desde api.service.js antes de este script

const profileForm = document.getElementById('profileForm');
const editBtn = document.getElementById('editBtn');
const logoutBtn = document.getElementById('logoutBtn');
const passwordInput = document.getElementById('contrasena');
const togglePassBtn = document.getElementById('togglePass');

// Elementos de la tarjeta lateral y del formulario
const sideNombre = document.getElementById('sideNombre');
const sideCorreo = document.getElementById('sideCorreo');
const sideRol = document.getElementById('sideRol');
const metaUserId = document.getElementById('metaUserId');
const inputNombre = document.getElementById('nombre');
const inputCorreo = document.getElementById('correo');
const selectRol = document.getElementById('rol');

let isEditing = false; // Estado para controlar el modo edición

// -----------------------------------------------------------------
// 1. LÓGICA DE CARGA DE DATOS
// -----------------------------------------------------------------

/**
 * Rellena el formulario y la tarjeta lateral con los datos del usuario.
 * @param {object} userData - Datos del usuario (asumimos: { id_usuario, nombre, correo, rol })
 */
function fillProfile(userData) {
    if (!userData) return;

    // Rellenar tarjeta lateral
    sideNombre.textContent = userData.nombre || 'N/A';
    sideCorreo.textContent = userData.correo || 'N/A';
    sideRol.textContent = userData.rol || 'N/A';
    metaUserId.textContent = userData.id_usuario || 'N/A';
    
    // Rellenar formulario principal
    inputNombre.value = userData.nombre || '';
    inputCorreo.value = userData.correo || '';
    selectRol.value = userData.rol || '';
    
    // La contraseña siempre se muestra como oculta por seguridad
    passwordInput.value = '********';
}

/**
 * Carga los datos del usuario actual desde la API.
 */
async function loadUserData() {
    try {
        const url = '/usuarios/perfil'; 
        
        // 🔑 CORRECCIÓN: Capturamos la respuesta completa y extraemos 'data'
        const respuestaCompleta = await apiFetch(url, { method: 'GET' });
        const userData = respuestaCompleta.data || respuestaCompleta; // Fallback por si la API cambia
        
        if (!userData || !userData.id_usuario) {
             throw new Error('No se encontraron datos de usuario en la respuesta de la API.');
        }

        fillProfile(userData);
    } catch (error) {
        console.error('Error al cargar el perfil:', error);
        alert('No se pudieron cargar los datos del perfil. La sesión puede haber expirado o hay un problema con la API.');
    }
}

// -----------------------------------------------------------------
// 2. LÓGICA DE EDICIÓN Y ACTUALIZACIÓN
// -----------------------------------------------------------------

/**
 * Alterna entre el modo 'ver' y 'editar'.
 */
function toggleEditMode() {
    isEditing = !isEditing;

    // Campos a alternar (Nombre y Correo)
    inputNombre.readOnly = !isEditing;
    inputCorreo.readOnly = !isEditing;
    
    if (isEditing) {
        editBtn.textContent = '💾 Guardar Cambios';
        editBtn.classList.add('btn-primary');
        editBtn.onclick = handleUpdateProfile; // Asignar la función de guardar
    } else {
        editBtn.textContent = '✎ Editar';
        editBtn.classList.remove('btn-primary');
        editBtn.onclick = toggleEditMode; // Reasignar la función de alternar
        loadUserData(); // Recargar datos para descartar cambios no guardados
    }
}

/**
 * Maneja la actualización del perfil (Nombre y Correo)
 */
async function handleUpdateProfile() {
    // Desactivar el botón para evitar doble envío
    editBtn.disabled = true;
    editBtn.textContent = 'Guardando...'; 

    const newNombre = inputNombre.value;
    const newCorreo = inputCorreo.value;

    try {
        const payload = {
            nombre: newNombre,
            correo: newCorreo,
        };

        const respuestaCompleta = await apiFetch('/usuarios/perfil', {
            method: 'PATCH',
            body: JSON.stringify(payload),
        });
        
        // 🔑 CORRECCIÓN: Extraemos 'data' también en la respuesta de actualización
        const updatedData = respuestaCompleta.data || respuestaCompleta;

        alert('Perfil actualizado exitosamente.');
        fillProfile(updatedData); 
        toggleEditMode(); // Volver a modo visualización

    } catch (error) {
        console.error('Error al actualizar el perfil:', error);
        alert(`Error al actualizar el perfil: ${error.message || 'Verifique los datos.'}`);

    } finally {
        editBtn.disabled = false;
    }
}


/**
 * 🔑 FUNCIÓN PARA CAMBIAR LA CONTRASEÑA
 * Se recomienda implementar un modal que pida los 3 campos.
 */
function handlePasswordChange() {
    alert("Para cambiar la contraseña, usa un modal pidiendo la Contraseña Actual, Nueva Contraseña y Confirmar Nueva Contraseña. La lógica de envío debe usar la ruta: PATCH /usuarios/cambiar-password");
}


// -----------------------------------------------------------------
// 3. OTRAS ACCIONES
// -----------------------------------------------------------------

/**
 * Muestra/Oculta el texto de la contraseña si se hace clic.
 */
togglePassBtn.addEventListener('click', () => {
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        togglePassBtn.textContent = '🔒';
    } else {
        passwordInput.type = 'password';
        togglePassBtn.textContent = '👁️';
    }
});


/**
 * Maneja el cierre de sesión.
 */
logoutBtn.addEventListener('click', () => {
    if (confirm('¿Estás seguro de que quieres cerrar la sesión?')) {
        localStorage.removeItem('jwt_token');
        window.location.href = '/frontend/Vista/login.html';
    }
});


// -----------------------------------------------------------------
// 4. INICIALIZACIÓN
// -----------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    loadUserData();
    editBtn.onclick = toggleEditMode; // Inicializa el botón en modo "editar"
    
    // Asocia un evento para manejar el cambio de contraseña (ejemplo: si haces clic en el campo)
    passwordInput.addEventListener('click', handlePasswordChange);
});
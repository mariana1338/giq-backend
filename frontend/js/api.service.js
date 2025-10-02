// /frontend/js/api.service.js

const API_BASE_URL = 'http://localhost:3000';

/**
 * Función genérica para realizar peticiones autenticadas a la API de NestJS.
 * @param endpoint - Ruta de la API (ej: '/instrumentos-quirurgicos').
 * @param options - Objeto de opciones de fetch (método, body, etc.).
 * @returns La respuesta JSON del servidor.
 */
async function apiFetch(endpoint, options = {}) {
    // 1. Obtener el token JWT del localStorage
    const token = localStorage.getItem('jwt_token');

    // 2. Preparar los encabezados (headers)
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers // Permite sobrescribir o añadir otros headers si es necesario
    };

    // 3. Añadir el token de autenticación si existe
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // 4. Configuración final de la petición
    const config = {
        ...options, // Mantiene el método, body, etc.
        headers: headers,
    };

    // 5. Ejecutar la petición
    const respuesta = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // 6. Manejar la respuesta HTTP (incluyendo errores como 401 y 403)
    if (!respuesta.ok) {
        // Intenta leer el cuerpo del error si está disponible
        const errorData = await respuesta.json().catch(() => ({})); 

        // Manejo específico para deslogueo automático si el token es inválido/expirado
        if (respuesta.status === 401 || respuesta.status === 403) {
            console.error(`Error ${respuesta.status}: Autenticación/Autorización fallida.`, errorData);
            // Si el error es 401, generalmente se recomienda cerrar la sesión
            if (respuesta.status === 401) {
                localStorage.removeItem('jwt_token');
                alert("Tu sesión ha expirado o es inválida. Por favor, vuelve a iniciar sesión.");
                window.location.href = '/frontend/Vista/login.html'; // Redirige al login
            }
        }
        // Lanza un error para que la función que llama lo capture (catch)
        throw new Error(errorData.message || `Error en la petición: ${respuesta.status}`);
    }

    return respuesta.json();
}
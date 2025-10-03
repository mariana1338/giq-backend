// /frontend/js/inicio.js
// ADVERTENCIA: Se asume que la variable API_BASE_URL y la función apiFetch
// ya están definidas en /frontend/js/api.service.js.

// -----------------------------------------------------------------
// A. FUNCIONES DE SEGURIDAD Y UTILIDAD
// -----------------------------------------------------------------

/**
 * Decodifica un JWT (sin verificar la firma) para obtener el payload.
 * @param {string} token - El token JWT.
 * @returns {object|null} El payload decodificado o null si falla.
 */
function decodeJwt(token) {
    if (!token) return null;
    
    // Asegura que el token no tenga espacios
    const cleanToken = String(token).trim(); 

    try {
        const base64Url = cleanToken.split('.')[1]; 
        if (!base64Url) return null;

        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Error al decodificar el JWT. Token inválido o corrupto.", e);
        return null;
    }
}

/**
 * Formatea un número como moneda colombiana (COP).
 * @param {number} value
 * @returns {string}
 */
function formatCurrency(value) { 
    return new Intl.NumberFormat('es-CO', { 
        style: 'currency', 
        currency: 'COP',
        minimumFractionDigits: 0
    }).format(value); 
}

// -----------------------------------------------------------------
// B. LÓGICA DE INVENTARIO (TABLA Y BÚSQUEDA)
// -----------------------------------------------------------------

/**
 * Crea una fila (<tr>) para un instrumento en la tabla de inventario.
 * @param {object} instrumento - El objeto de instrumento de la API.
 * @returns {HTMLTableRowElement}
 */
function createTableRow(instrumento) {
    const row = document.createElement('tr');
    
    // Clase para resaltar si el stock es crítico
    if (instrumento.cantidadStock <= instrumento.cantidadStockMinima) {
        row.classList.add('low-stock-row');
    }

    row.innerHTML = `
        <td>${instrumento.nombre}</td>
        <td>${instrumento.cantidadStock}</td>
        <td>${instrumento.cantidadStockMinima}</td>
        <td>${formatCurrency(instrumento.precioUnitario)}</td>
        <td>${formatCurrency(instrumento.precioVenta)}</td>
    `;
    return row;
}

// -----------------------------------------------------------------
// C. LÓGICA DE ESTADO Y ESTADÍSTICAS
// -----------------------------------------------------------------

/**
 * Actualiza la hora de la última actualización y el conteo de stock bajo
 * en la barra superior.
 * @param {number} lowStockCount - El número de productos con stock bajo.
 */
function updateSystemStatus(lowStockCount) {
    // 1. Actualizar Hora de Última Actualización
    const clockPill = document.querySelector('.inventory-topbar .pill.muted span:nth-child(2) strong');
    if (clockPill) {
        // Formatear la hora actual (ej. Hoy, 23:45)
        const now = new Date();
        const timeString = new Intl.DateTimeFormat('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit' 
        }).format(now);
        
        clockPill.textContent = `Hoy, ${timeString}`; // Actualiza el texto
    }

    // 2. Actualizar Conteo de Stock Bajo
    const warningPill = document.querySelector('.inventory-topbar .pill.warning strong');
    if (warningPill) {
        warningPill.textContent = lowStockCount; // Actualiza el número de stock bajo
    }
    
    // 3. (Opcional) Asegurar el estado "Sistema Activo"
    const activePill = document.querySelector('.inventory-topbar .pill.success');
    if (activePill) {
        activePill.style.display = 'flex'; // Asegura que se vea (si tu CSS lo oculta inicialmente)
    }
}

/**
 * Actualiza el estado de la píldora "Sistema Activo".
 * @param {boolean} isActive - true si está activo, false si hay error.
 */
function setSystemActiveState(isActive) {
    const activePill = document.querySelector('.inventory-topbar .pill.success');
    if (!activePill) return;

    const statusText = activePill.querySelector('span:last-child');
    
    // Cambiar clases y texto
    if (isActive) {
        activePill.classList.remove('error');
        activePill.classList.add('success');
        if (statusText) statusText.textContent = 'Sistema Activo';
    } else {
        activePult.classList.remove('success');
        activePill.classList.add('error');
        if (statusText) statusText.textContent = 'Error de Conexión';
    }
}

/**
 * Carga y renderiza los instrumentos, aplicando el filtro de búsqueda 
 * o mostrando solo los de stock bajo por defecto, y actualiza el estado.
 * @param {string} [nombreFiltro=''] - El nombre a buscar (opcional).
 */
async function loadInventory(nombreFiltro = '') {
    const tableBody = document.querySelector('.inventory-table tbody');
    if (!tableBody) {
        setSystemActiveState(false);
        return;
    }

    tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Cargando inventario...</td></tr>';
    
    let lowStockCount = 0; 
    const isSearchActive = !!nombreFiltro;
    
    // URL para la búsqueda (si aplica)
    const searchUrl = '/instrumentos-quirurgicos' + (isSearchActive ? `?nombre=${encodeURIComponent(nombreFiltro)}` : '');
    
    try {
        // 1. 🔑 LLAMADA ASÍNCRONA PARA EL CONTEO TOTAL DE STOCK BAJO (sin filtro)
        const [totalInventoryResponse, tableDataResponse] = await Promise.all([
            apiFetch('/instrumentos-quirurgicos', { method: 'GET' }), // Siempre llama a la lista completa
            apiFetch(searchUrl, { method: 'GET' }),                  // Llama con el filtro (o sin él) para la tabla
        ]);

        const allItems = totalInventoryResponse.data || [];
        const instrumentos = tableDataResponse.data || [];
        
        // Calcular el conteo de stock bajo con TODO el inventario
        lowStockCount = allItems.filter(item => 
            item.cantidadStock <= item.cantidadStockMinima
        ).length;

        // --- ÉXITO: Marcar como ACTIVO ---
        setSystemActiveState(true); 
        tableBody.innerHTML = ''; // Limpiar el mensaje de carga

        // 2. Determinar qué ITEMS RENDERIZAR en la tabla
        let itemsToRender = [];

        if (instrumentos.length > 0) {
            
            if (isSearchActive) {
                // Si hay un filtro, mostramos todos los resultados de la búsqueda.
                itemsToRender = instrumentos;
            } else {
                // Si NO hay filtro (vista por defecto), mostramos solo los que tienen stock bajo.
                itemsToRender = instrumentos.filter(item => 
                    item.cantidadStock <= item.cantidadStockMinima
                );
            }
            
            // 3. Renderizar los resultados
            if (itemsToRender.length > 0) {
                // Limitar a 10 elementos como buena práctica de UX
                itemsToRender.slice(0, 10).forEach(item => { 
                    tableBody.appendChild(createTableRow(item));
                });
            } else {
                // Mensaje cuando la lista de renderizado está vacía
                tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center;">
                    ${isSearchActive 
                        ? `❌ No se encontraron instrumentos llamados "${nombreFiltro}".`
                        : '✅ ¡Todo el inventario está en niveles óptimos!'}
                </td></tr>`;
            }

        } else {
            // No hay instrumentos en la base de datos (o la búsqueda fue vacía en DB vacía)
            tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center;">No hay instrumentos registrados.</td></tr>`;
        }

    } catch (error) {
        console.error("Error al cargar inventario para el dashboard. API inaccesible.", error);
        tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #dc3545;">
            ❌ Error al cargar datos. Comprueba la conexión.
        </td></tr>`;
        lowStockCount = 0; 
        setSystemActiveState(false); 
    }
    
    // 4. Actualizar estado y conteo de stock bajo (SIEMPRE con el conteo REAL)
    updateSystemStatus(lowStockCount);
}


// -----------------------------------------------------------------
// D. CARGA DE ESTADÍSTICAS (PLACEHOLDER)
// -----------------------------------------------------------------

/**
 * Función para cargar datos en las tarjetas de resumen.
 * Requiere un endpoint /dashboard/summary en NestJS.
 */
function loadSummaryStats() {
    console.log("Cargando estadísticas de resumen (valores estáticos del HTML).");
    // Lógica para llamar a la API y actualizar las tarjetas (pendiente de endpoint real).
}


// -----------------------------------------------------
// --- LÓGICA PRINCIPAL (INICIO) ---
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

    // 2. Lógica de Ocultamiento del Botón (Autorización por rol)
    const token = localStorage.getItem('jwt_token');
    const botonAlmacenes = document.getElementById('btn-panel-almacenes'); 

    if (botonAlmacenes) { 
        if (token) {
            const payload = decodeJwt(token);
            const userRole = payload ? payload.rol : null; 
            const normalizedRole = userRole ? String(userRole).toLowerCase() : '';

            // Mostrar solo si es 'administrador'
            if (normalizedRole === 'administrador') {
                botonAlmacenes.style.display = 'inline-block';
            } else {
                botonAlmacenes.style.display = 'none'; 
            }
        } else {
            // Si no hay token
            botonAlmacenes.style.display = 'none';
        }
    }

    // 3. Inicialización de la Búsqueda
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-btn');

    if (searchButton && searchInput) {
        // Ejecutar búsqueda al hacer click
        searchButton.addEventListener('click', () => {
            const nombre = searchInput.value.trim();
            loadInventory(nombre);
        });

        // Opcional: Ejecutar búsqueda al presionar ENTER
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const nombre = searchInput.value.trim();
                loadInventory(nombre);
            }
        });
    }


    // 4. Carga de datos dinámicos
    loadSummaryStats(); 
    // Carga inicial del inventario (mostrará solo stock bajo)
    loadInventory(); 
});
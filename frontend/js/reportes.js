// /frontend/js/reportes.js

// -----------------------------------------------------------------
// 1. CONSTANTES DOM
// -----------------------------------------------------------------
const tablaBody = document.getElementById('tablaHistorialBody'); 
const inputFechaDesde = document.getElementById('inputFechaDesde');
const inputFechaHasta = document.getElementById('inputFechaHasta');
const selectTipoMovimiento = document.getElementById('selectTipoMovimiento');
const inputProducto = document.getElementById('inputProducto');
const btnAplicarFiltros = document.getElementById('btnAplicarFiltros');
const btnLimpiarFiltros = document.getElementById('btnLimpiarFiltros');

// -----------------------------------------------------------------
// 2. FUNCIONES DE UTILIDAD
// -----------------------------------------------------------------

function formatCurrency(value) { 
    if (value === null || value === undefined) return '$ 0';
    return new Intl.NumberFormat('es-CO', { 
        style: 'currency', 
        currency: 'COP',
        minimumFractionDigits: 0
    }).format(value); 
}

// -----------------------------------------------------------------
// 3. LÓGICA DE CARGA Y RENDERIZADO
// -----------------------------------------------------------------

/**
 * Llama a la API con los filtros y renderiza la tabla.
 * @param {object} filtros - Objeto con los filtros a aplicar.
 */
async function cargarHistorial(filtros) {
    if (!tablaBody) return;
    tablaBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Cargando historial...</td></tr>';
    
    // Construir la URL con los filtros
    let url = '/movimientos-inventario';
    const params = new URLSearchParams();

    // Añadir filtros solo si tienen valor. Los nombres deben coincidir exactamente con el backend.
    if (filtros.nombreFiltro) params.append('nombreFiltro', filtros.nombreFiltro);
    if (filtros.fechaDesde) params.append('fechaDesde', filtros.fechaDesde);
    if (filtros.fechaHasta) params.append('fechaHasta', filtros.fechaHasta);
    if (filtros.tipoMovimiento && filtros.tipoMovimiento.toLowerCase() !== 'todos') {
        params.append('tipoMovimiento', filtros.tipoMovimiento);
    }

    if (params.toString()) {
        url += `?${params.toString()}`;
    }
    
    // 💡 PUNTO CLAVE DE DEPURACIÓN
    console.log("URL de Movimientos con Filtros:", url); 
    
    let movimientos = [];
    try {
        // Asegúrate de que apiFetch está definido globalmente (en tu api.service.js)
        const respuesta = await apiFetch(url, { method: 'GET' });
        // Usamos .data?.data para manejar el doble anidamiento
        movimientos = respuesta?.data?.data || []; 
        
    } catch (error) {
        console.error("Error al cargar movimientos:", error);
    }

    // --- Renderizado ---
    tablaBody.innerHTML = '';
    
    if (movimientos.length === 0) {
        tablaBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No se encontraron movimientos con los filtros aplicados.</td></tr>';
        return;
    }

    movimientos.forEach(mov => {
        const fila = document.createElement('tr');
        
        const tipoLimpio = String(mov.tipo_movimiento || '').toLowerCase();
        const esEntrada = tipoLimpio === 'entrada';
        
        // Asignación de clases y prefijos para estilo
        const tipoClase = esEntrada ? 'tipo-entrada' : 'tipo-salida';
        const cantidadPrefijo = esEntrada ? '+' : '-';
        const valorClase = esEntrada ? 'valor-positivo' : 'valor-negativo';
        
        // El valor total es cantidad * precio unitario (o de costo/venta)
        const valorTotal = (parseFloat(mov.precio || 0) * mov.cantidad);
        
        const fechaMovimiento = new Date(mov.fecha).toLocaleDateString();
        const productoNombre = mov.instrumento?.nombre || 'Producto Desconocido';
        
        fila.innerHTML = `
            <td>${fechaMovimiento}</td>
            <td>${productoNombre}</td>
            <td><span class="${tipoClase}">${mov.tipo_movimiento}</span></td>
            <td>${cantidadPrefijo}${mov.cantidad}</td>
            <td class="${valorClase}">${formatCurrency(valorTotal)}</td>
        `;
        
        tablaBody.appendChild(fila);
    });
}

// -----------------------------------------------------------------
// 4. LÓGICA DE FILTROS
// -----------------------------------------------------------------

function obtenerFiltrosActuales() {
    return {
        fechaDesde: inputFechaDesde ? inputFechaDesde.value.trim() : '',
        fechaHasta: inputFechaHasta ? inputFechaHasta.value.trim() : '',
        tipoMovimiento: selectTipoMovimiento ? selectTipoMovimiento.value.trim() : 'todos',
        nombreFiltro: inputProducto ? inputProducto.value.trim() : ''
    };
}

function aplicarFiltros() {
    cargarHistorial(obtenerFiltrosActuales());
}

function limpiarFiltros() {
    inputFechaDesde.value = '';
    inputFechaHasta.value = '';
    selectTipoMovimiento.value = 'todos'; 
    inputProducto.value = '';
    aplicarFiltros(); // Recarga sin filtros
}


// -----------------------------------------------------------------
// 5. INICIALIZACIÓN Y EVENT LISTENERS
// -----------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    
    // Conectar botones de filtro
    btnAplicarFiltros?.addEventListener('click', aplicarFiltros);
    btnLimpiarFiltros?.addEventListener('click', limpiarFiltros);
    
    // Carga inicial al iniciar la página (sin filtros)
    aplicarFiltros(); 
});

// /frontend/js/reportes.js

// ... (todo tu código anterior: constantes, funciones, lógica de filtros) ...

// -----------------------------------------------------------------
// 6. LÓGICA DE EXPORTACIÓN A PDF (Frontend)
// -----------------------------------------------------------------

const btnExportarPDF = document.getElementById('btnExportarPDF');
const reporteContainer = document.getElementById('reporteContainer'); // Contenedor que tiene los bloques 'filters' y 'history'

function exportarAPDF() {
    if (!reporteContainer) {
        console.error("No se encontró el contenedor del reporte.");
        return;
    }

    // 1. Opciones de html2pdf.js
    const options = {
        margin: 10,
        filename: 'reporte_inventario_' + new Date().toISOString().slice(0, 10) + '.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
            scale: 2, 
            logging: false, 
            useCORS: true 
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // 2. Ocultar elementos que NO deben salir en el PDF (filtros, botones, topbar)
    // El CSS @media print también ayuda, pero esto es más seguro.
    const filtersBlock = document.querySelector('.block.filters');
    const exportBlock = document.querySelector('.block.export');
    const topbar = document.querySelector('.topbar');
    
    // Ocultamos
    if (filtersBlock) filtersBlock.style.display = 'none';
    if (exportBlock) exportBlock.style.display = 'none';
    if (topbar) topbar.style.display = 'none';

    // 3. Generar y descargar el PDF
    // Usamos el 'reporteContainer' para capturar el contenido.
    html2pdf().set(options).from(reporteContainer).save()
        .then(() => {
            // 4. Restaurar la visibilidad de los elementos después de la generación
            if (filtersBlock) filtersBlock.style.display = '';
            if (exportBlock) exportBlock.style.display = '';
            if (topbar) topbar.style.display = '';
            console.log("PDF generado y elementos restaurados.");
        })
        .catch(error => {
            console.error("Error al generar el PDF:", error);
            // Asegurarse de restaurar aunque haya error
            if (filtersBlock) filtersBlock.style.display = '';
            if (exportBlock) exportBlock.style.display = '';
            if (topbar) topbar.style.display = '';
        });
}

// -----------------------------------------------------------------
// 7. CONEXIÓN DE EVENTOS
// -----------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    // ... (Conexión de filtros) ...
    btnAplicarFiltros?.addEventListener('click', aplicarFiltros);
    btnLimpiarFiltros?.addEventListener('click', limpiarFiltros);
    
    // Conectar botón de PDF
    btnExportarPDF?.addEventListener('click', exportarAPDF); // <-- ¡Aquí se conecta!
    
    // Carga inicial
    aplicarFiltros(); 
});
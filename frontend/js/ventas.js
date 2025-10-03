// /frontend/js/ventas.js

// -----------------------------------------------------------------
// 1. DECLARACIÓN DE CONSTANTES DOM
// -----------------------------------------------------------------
const btnCrear = document.getElementById("btnCrear");
const modal = document.getElementById("modal");
const closeModalBtn = document.getElementById("closeModal");
const cancelar = document.getElementById("cancelar");
const ventaForm = document.getElementById("ventaForm");
const tablaBody = document.getElementById("tablaBody"); 
const btnBack = document.getElementById("btnBack");

// Selectores del formulario
const selectProducto = document.getElementById('producto');
const inputCantidad = document.getElementById('cantidad');

// 🔑 CONSTANTES PARA EL BUSCADOR
const inputBuscar = document.getElementById('buscar');
const btnBuscar = document.querySelector('.search-bar .btn'); 


// -----------------------------------------------------------------
// 2. FUNCIONES DE UTILIDAD
// -----------------------------------------------------------------
function openModal() { modal.style.display = "flex"; }
function closeModal() { modal.style.display = "none"; }

function formatCurrency(value) { 
    return new Intl.NumberFormat('es-CO', { 
        style: 'currency', 
        currency: 'COP',
        minimumFractionDigits: 0
    }).format(value); 
}

// -----------------------------------------------------------------
// 3. CARGA DE DATOS RELACIONADOS (Productos disponibles)
// -----------------------------------------------------------------

async function cargarProductos() {
    try {
        const res = await apiFetch('/instrumentos-quirurgicos', { method: 'GET' });
        
        // Asumiendo que /instrumentos-quirurgicos no tiene la doble anidación.
        let productos = res?.data; 

        selectProducto.innerHTML = '<option value="" disabled selected>Selecciona un producto</option>';

        if (!Array.isArray(productos)) {
             console.error("La respuesta de /instrumentos-quirurgicos no es un array.", res);
             return; 
        }

        productos.forEach(p => {
            const option = document.createElement('option');
            option.value = p.id_instrumento; 
            option.textContent = `${p.nombre} (Stock: ${p.cantidadStock})`;
            option.dataset.precio = p.precioVenta; 
            selectProducto.appendChild(option);
        });

    } catch (error) {
        console.error("Error al cargar productos:", error.message);
    }
}

// -----------------------------------------------------------------
// 4. MANEJO DE ENVÍO DEL FORMULARIO (POST a movimientos)
// -----------------------------------------------------------------

async function handleRegistrarVenta(e) {
    e.preventDefault();

    const productoIdString = selectProducto.value; 
    const cantidad = parseInt(inputCantidad.value); 
    
    const selectedOption = selectProducto.options[selectProducto.selectedIndex];
    const precioUnitarioVenta = parseFloat(selectedOption?.dataset.precio || 0); 
    
    // Validación
    if (!productoIdString || isNaN(cantidad) || cantidad <= 0) {
        alert("Por favor, selecciona un producto y especifica una cantidad válida mayor a cero.");
        return;
    }
    const instrumentoIdNum = parseInt(productoIdString, 10); 

    const movimientoData = {
        instrumentoId: instrumentoIdNum, 
        cantidad: cantidad,
        tipo_movimiento: 'salida', 
        precio: precioUnitarioVenta, 
        usuarioId: 1, 
    };
    
    try {
        await apiFetch('/movimientos-inventario', {
            method: 'POST',
            body: JSON.stringify(movimientoData)
        });

        alert(`✅ Venta de ${cantidad} unidades registrada y stock descontado con éxito.`);
        closeModal();
        ventaForm.reset();
        
        // RECARGA DE DATOS
        cargarProductos(); 
        // 🔑 Recarga la tabla con el filtro actual (si existe)
        cargarMovimientos(inputBuscar.value.trim()); 
        
    } catch (error) {
        console.error("Error al registrar venta:", error);
        const errorMsg = error.response?.message?.join(', ') || error.message;
        alert(`❌ Error al registrar venta: ${errorMsg}.`);
    }
}


// -----------------------------------------------------------------
// 5. CARGA Y RENDERIZADO DE VENTAS (READ)
// -----------------------------------------------------------------

async function cargarMovimientos(nombreFiltro = '') { // 🔑 Usa 'nombreFiltro'
    
    if (!tablaBody) {
        console.error("Error FATAL: tablaBody no encontrado en el DOM.");
        return;
    }
    
    tablaBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Cargando historial de ventas...</td></tr>';
    
    let url = '/movimientos-inventario';
    if (nombreFiltro) { // 🔑 Envía el filtro si existe
        url += `?nombre=${encodeURIComponent(nombreFiltro)}`; 
    }
    
    let ventas = []; 
    
    try {
        const respuesta = await apiFetch(url, { method: 'GET' });
        
        // 🔑 CORRECCIÓN CLAVE MANTENIDA: Doble anidamiento
        ventas = respuesta?.data?.data; 
        
    } catch (error) {
        console.error("Error al cargar ventas (API):", error.message);
    }
    
    // --- Lógica de Renderizado ---
    tablaBody.innerHTML = ''; 
    let filasRenderizadas = 0;

    if (Array.isArray(ventas) && ventas.length > 0) {
        ventas.forEach(mov => {
            
            const productoNombre = mov.instrumento?.nombre || 'N/A';
            const precioTransaccion = parseFloat(mov.precio || 0);
            
            // 🔑 Lógica de filtro/renderizado robusta:
            const tipoMovimientoLimpio = String(mov.tipo_movimiento || '').trim().toLowerCase();
            
            if (precioTransaccion > 0 && tipoMovimientoLimpio === 'salida') { 
                
                const fila = document.createElement('tr');
                const total = mov.cantidad * precioTransaccion;
                const fechaVenta = new Date(mov.fecha).toLocaleDateString();
                
                fila.innerHTML = `
                    <td>${productoNombre}</td>
                    <td class="out">${mov.cantidad || 0}</td>
                    <td>${formatCurrency(precioTransaccion)}</td>
                    <td>${formatCurrency(total)}</td>
                    <td>${fechaVenta}</td>
                `;
                
                tablaBody.appendChild(fila);
                filasRenderizadas++;
            }
        });
        
        if (filasRenderizadas === 0) {
             tablaBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No hay ventas válidas que coincidan con el filtro.</td></tr>';
        }
        
    } else {
        tablaBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No hay movimientos de salida registrados.</td></tr>';
    }
}

// -----------------------------------------------------------------
// 6. EVENTOS INICIALES Y MANEJO DE UI
// -----------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    // Eventos del Modal
    btnCrear?.addEventListener('click', () => {
        ventaForm.reset();
        openModal();
    });
    closeModalBtn?.addEventListener('click', closeModal);
    cancelar?.addEventListener('click', closeModal);
    
    // Conexión del Formulario
    ventaForm.addEventListener('submit', handleRegistrarVenta);
    
    // Manejo del botón de retroceso
    btnBack.addEventListener("click", () => {
        window.history.back();
    });
    
    // 🔑 LÓGICA DEL BUSCADOR
    const aplicarFiltro = () => {
        const filtro = inputBuscar.value.trim();
        cargarMovimientos(filtro); 
    };
    
    // Evento 1: Clic en el botón "Buscar"
    btnBuscar.addEventListener('click', aplicarFiltro);
    
    // Evento 2: Presionar Enter en el campo de búsqueda
    inputBuscar.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            aplicarFiltro();
        }
        // Opcional: Si se borra el filtro, recarga automáticamente
        if (inputBuscar.value.trim() === '' && e.key !== 'Enter') {
             aplicarFiltro();
        }
    });
    
    // Inicialización de datos
    cargarProductos(); 
    cargarMovimientos();
});
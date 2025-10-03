// /frontend/js/inventario.js
// Asume que apiFetch (de api.service.js) ya está cargado en el HTML.

// -----------------------------------------------------------------
// 1. DECLARACIÓN DE CONSTANTES (Mapeo de Elementos HTML)
// -----------------------------------------------------------------
const cardsContainer = document.querySelector('.cards-container');

// Modal de Creación/Edición
const modalCrear = document.getElementById('modalCrear');
const formProducto = document.getElementById('formProducto');
const selectCategoria = document.getElementById('categoria');
const selectProveedor = document.getElementById('proveedor');
const selectUbicacion = document.getElementById('ubicacion'); 
const btnCrearProducto = document.getElementById('btnCrear');
const btnCerrarModal = document.getElementById('cerrarModal');
const btnCancelarModal = document.getElementById('cancelarModal');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-btn');

// Modal de Detalles (Nuevos elementos)
const modalDetalles = document.getElementById('modalDetalles');
const detallesContainer = document.getElementById('detallesContainer');
const btnCerrarDetalles = document.getElementById('cerrarDetalles');
const btnEditarDesdeDetalles = document.getElementById('btnEditarDesdeDetalles');

// Campo oculto para guardar el ID del producto que se está editando
const hiddenProductId = document.createElement('input');
hiddenProductId.type = 'hidden';
hiddenProductId.id = 'editProductId';
formProducto.prepend(hiddenProductId);


// -----------------------------------------------------------------
// A. FUNCIONES DE UTILIDAD
// -----------------------------------------------------------------

function openModal(modal) { modal.style.display = "flex"; }
function closeModal(modal) { modal.style.display = "none"; }
function formatCurrency(value) { 
    return new Intl.NumberFormat('es-CO', { 
        style: 'currency', 
        currency: 'COP',
        minimumFractionDigits: 0
    }).format(value); 
}
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    // Muestra solo la fecha si tiene formato ISO, si no, lo pasa directamente
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-CO');
    } catch (e) {
        return dateString;
    }
}


// -----------------------------------------------------------------
// B. CARGA DE DATOS RELACIONADOS (SELECTS)
// -----------------------------------------------------------------

async function cargarDatosRelacionados() {
    // ... (Esta función permanece igual) ...
    try {
        const [catRes, provRes, ubiRes] = await Promise.all([
            apiFetch('/categoria-instrumento', { method: 'GET' }), 
            apiFetch('/proveedor', { method: 'GET' }),
            apiFetch('/ubicacion-almacen', { method: 'GET' })
        ]);

        [
            { select: selectCategoria, data: catRes.data },
            { select: selectProveedor, data: provRes.data },
            { select: selectUbicacion, data: ubiRes.data }
        ].forEach(({ select, data }) => {
            select.innerHTML = select.querySelector('option') ? select.querySelector('option').outerHTML : '';
            data.forEach(item => {
                const option = document.createElement('option');
                option.value = item.id;
                option.textContent = item.nombre;
                select.appendChild(option);
            });
        });

    } catch (error) {
        console.error("Error al cargar datos de Categorías/Proveedores/Ubicaciones:", error.message);
    }
}


// -----------------------------------------------------------------
// C. FUNCIÓN PARA CREAR TARJETA (RENDERIZADO)
// -----------------------------------------------------------------

function createProductCard(data) {
    const stockStatus = data.cantidadStock > data.cantidadStockMinima ? 'ok' : 'danger';
    const warningIcon = data.cantidadStock <= data.cantidadStockMinima ? '<span class="warning-icon">⚠️</span>' : '';
    const costPriceDiff = data.precioVenta - data.precioUnitario; 
    const profitPercent = data.precioUnitario > 0 ? (costPriceDiff / data.precioUnitario) * 100 : 0;
    
    const productId = data.id_instrumento || data.id;

    const card = document.createElement('div');
    card.className = `card ${stockStatus === 'danger' ? 'low-stock' : ''}`;
    card.dataset.id = productId; 
    // 🔑 ALMACENA LOS DATOS COMPLETOS
    card.dataset.producto = JSON.stringify(data); 

    // Lectura de la categoría
    let categoriaNombre = 'N/A';
    if (data.categoria && data.categoria.nombre) {
        categoriaNombre = data.categoria.nombre;
    } else if (data.categoriaId) {
        categoriaNombre = `ID: ${data.categoriaId}`; 
    }
    
    card.innerHTML = `
        <h2 class="product-title">${data.nombre} ${warningIcon}</h2>
        <p class="code">${data.codigo || 'N/A'}</p>
        <span class="tag">${categoriaNombre}</span>
        <div class="item-info">
            <p>Stock:</p> <span class="stock ${stockStatus}">${data.cantidadStock}</span>
        </div>
        <div class="item-info">
            <p>Min:</p> <span>${data.cantidadStockMinima}</span>
        </div>
        <div class="price-info">
            <p>Precio:</p> <span>${formatCurrency(data.precioVenta)}</span>
        </div>
        <div class="cost-info">
            <p>Costo: ${formatCurrency(data.precioUnitario)}</p> 
            <span class="percent">+${profitPercent.toFixed(1)}%</span>
        </div>
        <div class="actions">
            <button class="edit" data-id="${productId}">✏️</button>
            <button class="delete" data-id="${productId}">🗑️</button>
        </div>
    `;

    // 🔑 EVENTO DE CLIC EN LA TARJETA (para mostrar detalles)
    card.addEventListener('click', handleCardClick);

    // Conectar eventos de la API
    const deleteBtn = card.querySelector('.delete');
    const editBtn = card.querySelector('.edit');
    
    // 🔑 Detenemos la propagación para que al hacer clic en el botón, NO se abra el modal de detalles.
    deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        handleEliminarProducto(e);
    });
    editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        handleEditarProducto(e);
    }); 
    
    cardsContainer.appendChild(card);
}


// -----------------------------------------------------------------
// D. CARGA INICIAL DE INSTRUMENTOS (READ)
// -----------------------------------------------------------------

/**
 * Carga y renderiza los instrumentos, aplicando un filtro de búsqueda opcional.
 * @param {string} [nombreFiltro=''] - El nombre a buscar.
 */
async function cargarInstrumentos(nombreFiltro = '') { 
    // Muestra el mensaje de carga inmediatamente
    cardsContainer.innerHTML = '<div style="text-align: center; width: 100%;">Cargando inventario...</div>';
    
    let url = '/instrumentos-quirurgicos';

    // 1. Construir la URL con el filtro si existe
    if (nombreFiltro) {
        url += `?nombre=${encodeURIComponent(nombreFiltro)}`;
    }
    
    try {
        // 2. Intentar la llamada a la API
        const respuesta = await apiFetch(url, { method: 'GET' });
        const instrumentos = respuesta.data;
        
        // 3. Limpiar el contenedor
        cardsContainer.innerHTML = ''; 

        // 4. Verificar datos y renderizar
        if (Array.isArray(instrumentos) && instrumentos.length > 0) { 
            instrumentos.forEach(createProductCard); 
        } else {
            cardsContainer.innerHTML = `<div style="text-align: center; width: 100%;">
                ${nombreFiltro 
                    ? 'No se encontraron instrumentos que coincidan con la búsqueda.' 
                    : 'No hay instrumentos registrados. Crea el primero.'}
            </div>`;
        }

    } catch (error) {
        // 5. Manejo de errores de conexión/API
        console.error("Error fatal al cargar instrumentos:", error.message, error); 
        
        const errorMsg = error.response?.message?.join(', ') || error.message || 'Verifica la conexión del backend.';

        cardsContainer.innerHTML = `<div style="color: #dc3545; text-align: center; width: 100%; padding: 20px; border: 1px solid #dc3545; background-color: #f8d7da; border-radius: 5px;">
            ❌ **ERROR AL CARGAR INVENTARIO** ❌<br>
            Asegúrate de que tu backend (NestJS) esté corriendo y que estés logueado.<br>
            Detalle: <strong>${errorMsg}</strong>
        </div>`;
    }
}


// -----------------------------------------------------------------
// E. MANEJO DE EDICIÓN Y CREACIÓN (PATCH, POST)
// -----------------------------------------------------------------

function handleEditarProducto(e) {
    const cardElement = e.currentTarget.closest('.card') || document.querySelector(`.card[data-id="${e.currentTarget.dataset.id}"]`);
    const data = JSON.parse(cardElement.dataset.producto);
    
    // 1. Llenar campos del formulario
    document.getElementById('nombre').value = data.nombre;
    document.getElementById('codigo').value = data.codigo || ''; 
    document.getElementById('descripcion').value = data.descripcion || ''; 
    document.getElementById('cantidad').value = data.cantidadStock;
    document.getElementById('minimo').value = data.cantidadStockMinima;
    document.getElementById('precioEntrada').value = data.precioUnitario;
    document.getElementById('precioVenta').value = data.precioVenta;
    
    if (data.fechaAdquisicion) {
         document.getElementById('fechaAdquisicion').value = data.fechaAdquisicion.substring(0, 10); 
    } else {
         document.getElementById('fechaAdquisicion').value = '';
    }

    // 2. Seleccionar los IDs
    selectCategoria.value = data.categoriaId || data.categoria?.id || '';
    selectProveedor.value = data.proveedorId || data.proveedor?.id || '';
    selectUbicacion.value = data.ubicacionId || data.ubicacion?.id || ''; 

    // 3. Establecer el ID del producto en el campo oculto
    hiddenProductId.value = data.id_instrumento || data.id;

    // 4. Configurar modal para edición
    modalCrear.querySelector('h2').textContent = "Editar Producto";
    formProducto.querySelector('button[type="submit"]').textContent = "Guardar Cambios";

    closeModal(modalDetalles); // Asegura que el modal de detalles se cierre si se accede desde allí
    openModal(modalCrear); 
}

async function handleGuardarProducto(e) {
    // ... (Esta función permanece igual) ...
    e.preventDefault();

    const id = hiddenProductId.value; 
    const isEditing = !!id;
    
    const USUARIO_ACTIVO_ID = 1; 

    const productoData = {
        nombre: document.getElementById('nombre').value.trim(),
        codigo: document.getElementById('codigo').value.trim(), 
        descripcion: document.getElementById('descripcion').value.trim(),
        
        cantidadStock: parseInt(document.getElementById('cantidad').value),
        cantidadStockMinima: parseInt(document.getElementById('minimo').value),
        precioUnitario: parseFloat(document.getElementById('precioEntrada').value),
        precioVenta: parseFloat(document.getElementById('precioVenta').value),
        fechaAdquisicion: document.getElementById('fechaAdquisicion').value || null,
        
        categoriaId: document.getElementById('categoria').value, 
        proveedorId: document.getElementById('proveedor').value, 
        ubicacionId: document.getElementById('ubicacion').value,
        
        id_usuario: USUARIO_ACTIVO_ID 
    };
    
    if (productoData.descripcion === "") { delete productoData.descripcion; }
    if (productoData.fechaAdquisicion === "") { productoData.fechaAdquisicion = null; }
    
    try {
        let method = isEditing ? 'PATCH' : 'POST';
        let url = isEditing ? `/instrumentos-quirurgicos/${id}` : '/instrumentos-quirurgicos';

        await apiFetch(url, {
            method: method,
            body: JSON.stringify(productoData)
        });

        const mensaje = `✅ Instrumento '${productoData.nombre}' ${isEditing ? 'actualizado' : 'creado'} con éxito.`;

        alert(mensaje);
        closeModal(modalCrear);
        formProducto.reset();
        
        document.getElementById('editProductId').value = ''; 
        modalCrear.querySelector('h2').textContent = "Crear Nuevo Producto";
        formProducto.querySelector('button[type="submit"]').textContent = "Crear";

        cargarInstrumentos(); 

    } catch (error) {
        console.error(`Error al ${isEditing ? 'editar' : 'crear'} instrumento:`, error);
        const errorMsg = error.response?.message?.join(', ') || error.message;
        alert(`❌ Error al ${isEditing ? 'guardar cambios' : 'crear producto'}: ${errorMsg}`);
    }
}


// Handler para ELIMINAR PRODUCTO (DELETE)
async function handleEliminarProducto(e) {
    // ... (Esta función permanece igual) ...
    const id = e.currentTarget.dataset.id;
    const cardElement = e.currentTarget.closest('.card'); 

    if (!confirm(`¿Estás seguro de que quieres eliminar el producto ${id}?`)) return;

    try {
        await apiFetch(`/instrumentos-quirurgicos/${id}`, { method: 'DELETE' });
        if (cardElement) {
            cardElement.remove(); 
        }
        closeModal(modalDetalles); // Cierra el modal de detalles si estaba abierto
        alert(`✅ Instrumento eliminado con éxito.`);
        
    } catch (error) {
        console.error("Error al eliminar instrumento:", error.message);
        alert(`Error al eliminar instrumento: ${error.message}`);
    }
}


// -----------------------------------------------------------------
// F. NUEVO: MANEJO DE DETALLES DEL PRODUCTO
// -----------------------------------------------------------------

function showProductDetails(data) {
    document.getElementById('detail-nombre').textContent = data.nombre;
    document.getElementById('detail-codigo').textContent = data.codigo || 'N/A';
    document.getElementById('detail-descripcion').textContent = data.descripcion || 'Sin descripción';
    
    // Acceder a las propiedades de la relación (ya cargadas por el backend)
    document.getElementById('detail-categoria').textContent = data.categoria?.nombre || 'N/A';
    document.getElementById('detail-proveedor').textContent = data.proveedor?.nombre || 'N/A';
    document.getElementById('detail-ubicacion').textContent = data.ubicacion?.nombre || 'N/A';

    document.getElementById('detail-stock').textContent = data.cantidadStock;
    document.getElementById('detail-minimo').textContent = data.cantidadStockMinima;
    document.getElementById('detail-costo').textContent = formatCurrency(data.precioUnitario);
    document.getElementById('detail-venta').textContent = formatCurrency(data.precioVenta);
    document.getElementById('detail-fecha').textContent = formatDate(data.fechaAdquisicion);

    // Guardar el ID en el botón de edición del modal de detalles
    btnEditarDesdeDetalles.dataset.id = data.id_instrumento || data.id;

    openModal(modalDetalles);
}

function handleCardClick(e) {
    // 🔑 Obtener el elemento card y los datos JSON almacenados
    const cardElement = e.currentTarget;
    const data = JSON.parse(cardElement.dataset.producto);
    showProductDetails(data);
}


// -----------------------------------------------------------------
// G. EVENTOS INICIALES (DOM)
// -----------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    // Evento para abrir modal de creación
    btnCrearProducto?.addEventListener('click', () => {
        formProducto.reset();
        hiddenProductId.value = '';
        modalCrear.querySelector('h2').textContent = "Crear Nuevo Producto";
        formProducto.querySelector('button[type="submit"]').textContent = "Crear";
        openModal(modalCrear);
    });
    
    // Eventos de cerrar/cancelar modal de CREACIÓN
    btnCerrarModal?.addEventListener('click', () => closeModal(modalCrear));
    btnCancelarModal?.addEventListener('click', () => closeModal(modalCrear));

    // Eventos de cerrar/editar modal de DETALLES
    btnCerrarDetalles?.addEventListener('click', () => closeModal(modalDetalles));
    btnEditarDesdeDetalles?.addEventListener('click', (e) => {
        // Ejecutar la lógica de edición al hacer clic en el botón del modal de detalles
        handleEditarProducto(e);
    });


    // Conectar el handler unificado de Creación/Edición
    formProducto?.addEventListener('submit', handleGuardarProducto);

    // -----------------------------------------------------------------
    // NUEVOS EVENTOS: BÚSQUEDA
    // -----------------------------------------------------------------
    if (searchButton && searchInput) {
        // Al hacer click en el botón de búsqueda
        searchButton.addEventListener('click', () => {
            const nombre = searchInput.value.trim();
            // Llama a la función modificada con el filtro
            cargarInstrumentos(nombre); 
        });

        // Al presionar ENTER en el campo de texto
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault(); 
                const nombre = searchInput.value.trim();
                // Llama a la función modificada con el filtro
                cargarInstrumentos(nombre); 
            }
        });
    }
    // Iniciar la carga de datos
    cargarDatosRelacionados(); 
    cargarInstrumentos();      
});
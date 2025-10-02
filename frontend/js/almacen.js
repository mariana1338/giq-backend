// /frontend/js/almacen.js

// Nota: Este archivo asume que apiFetch está definido en api.service.js y cargado primero.

// Función para abrir modal
function openModal(id) {
    document.getElementById(id).style.display = "block";
}

// Función para cerrar modal
function closeModal(id) {
    document.getElementById(id).style.display = "none";
}

// -----------------------------------------------------------------
// FUNCIÓN PARA CREAR TARJETAS EN EL DOM (AÑADIMOS data.id)
// -----------------------------------------------------------------

function addCard(type, data) {
    const container = document.getElementById("cardContainer");
    const card = document.createElement("div");
    card.className = "card";
    // 🔑 AÑADIMOS EL ID DEL REGISTRO DE LA BASE DE DATOS
    card.dataset.id = data.id; 
    card.dataset.type = type;

    let content = "";
    if (type === "proveedor") {
        content = `<h3>Proveedor</h3>
            <p><strong>Nombre:</strong> <span class="nombre">${data.nombre}</span></p>
            <p><strong>Contacto:</strong> <span class="contacto">${data.contacto}</span></p>
            <p><strong>Dirección:</strong> <span class="direccion">${data.direccion}</span></p>`;
    }
    if (type === "categoria") {
        content = `<h3>Categoría</h3>
            <p><strong>Nombre:</strong> <span class="nombre">${data.nombre}</span></p>`;
    }
    if (type === "almacen") {
        content = `<h3>Almacén</h3>
            <p><strong>Nombre:</strong> <span class="nombre">${data.nombre}</span></p>
            <p><strong>Ubicación:</strong> <span class="ubicacion">${data.ubicacion}</span></p>`;
    }

    // Botones de acción
    const buttons = `
        <div class="card-buttons">
            <button class="edit">Editar</button>
            <button class="delete">Eliminar</button>
        </div>
    `;

    card.innerHTML = content + buttons;

    // Evento eliminar (AHORA DEBE LLAMAR A LA API)
    card.querySelector(".delete").onclick = () => {
        handleEliminar(type, data.id, card);
    };

    // Evento editar (PREPARA EL MODAL)
    card.querySelector(".edit").onclick = () => {
        prepareEditModal(type, card);
    };

    container.appendChild(card);
}

// -----------------------------------------------------------------
// FUNCIÓN GENERAL PARA CARGAR TODOS LOS DATOS
// -----------------------------------------------------------------

async function cargarTodasLasTarjetas() {
    const container = document.getElementById("cardContainer");
    container.innerHTML = 'Cargando datos...';

    try {
        // Peticiones concurrentes para cargar todos los datos de administración
        const [provRes, catRes, almRes] = await Promise.all([
            apiFetch('/proveedor', { method: 'GET' }),
            apiFetch('/categoria-instrumento', { method: 'GET' }),
            apiFetch('/ubicacion-almacen', { method: 'GET' })
        ]);

        container.innerHTML = ''; // Limpiar el mensaje de carga

        // Mostrar Proveedores
        provRes.data.forEach(data => addCard('proveedor', data));
        
        // Mostrar Categorías
        catRes.data.forEach(data => addCard('categoria', data));

        // Mostrar Almacenes
        almRes.data.forEach(data => addCard('almacen', data));

        if (provRes.data.length + catRes.data.length + almRes.data.length === 0) {
            container.innerHTML = 'No hay datos registrados en el sistema.';
        }

    } catch (error) {
        console.error("Error al cargar datos del panel de administración:", error.message);
        // Mostrar mensaje de error (ej: si el usuario no es admin)
        container.innerHTML = `<p style="color: red;">Error: ${error.message}. Asegúrate de estar logueado como administrador.</p>`;
    }
}


// -----------------------------------------------------------------
// HANDLERS DE CREACIÓN (INTEGRACIÓN CON API)
// -----------------------------------------------------------------

document.getElementById("formProveedor").onsubmit = async e => {
    e.preventDefault();
    const proveedorData = {
        nombre: document.getElementById("provNombre").value.trim(),
        contacto: document.getElementById("provContacto").value.trim(),
        direccion: document.getElementById("provDireccion").value.trim()
    };
    try {
        const nuevoProveedor = await apiFetch('/proveedor', { method: 'POST', body: JSON.stringify(proveedorData) });
        addCard("proveedor", nuevoProveedor.data); // Añadir la tarjeta con el ID retornado
        closeModal("modalProveedor");
        e.target.reset();
    } catch (error) {
        alert(`❌ Error al crear proveedor: ${error.message}`);
    }
};

document.getElementById("formCategoria").onsubmit = async e => {
    e.preventDefault();
    const categoriaData = { nombre: document.getElementById("catNombre").value.trim() };
    try {
        const nuevaCategoria = await apiFetch('/categoria-instrumento', { method: 'POST', body: JSON.stringify(categoriaData) });
        addCard("categoria", nuevaCategoria.data);
        closeModal("modalCategoria");
        e.target.reset();
    } catch (error) {
        alert(`❌ Error al crear categoría: ${error.message}`);
    }
};

document.getElementById("formAlmacen").onsubmit = async e => {
    e.preventDefault();
    const almacenData = {
        nombre: document.getElementById("almNombre").value.trim(),
        ubicacion: document.getElementById("almUbicacion").value.trim()
    };
    try {
        const nuevoAlmacen = await apiFetch('/ubicacion-almacen', { method: 'POST', body: JSON.stringify(almacenData) });
        addCard("almacen", nuevoAlmacen.data);
        closeModal("modalAlmacen");
        e.target.reset();
    } catch (error) {
        alert(`❌ Error al crear almacén: ${error.message}`);
    }
};


// -----------------------------------------------------------------
// FUNCIÓN DE ELIMINACIÓN (INTEGRACIÓN CON API)
// -----------------------------------------------------------------

async function handleEliminar(type, id, cardElement) {
    if (!confirm(`¿Estás seguro de que quieres eliminar este ${type}?`)) return;

    let endpoint = '';
    if (type === 'proveedor') endpoint = `/proveedor/${id}`;
    else if (type === 'categoria') endpoint = `/categoria-instrumento/${id}`;
    else if (type === 'almacen') endpoint = `/ubicacion-almacen/${id}`;
    else return;

    try {
        await apiFetch(endpoint, { method: 'DELETE' });
        cardElement.remove(); // Eliminar del DOM solo si la API tuvo éxito
        alert(`✅ ${type} eliminado con éxito.`);
    } catch (error) {
        alert(`❌ Error al eliminar ${type}: ${error.message}`);
    }
}


// -----------------------------------------------------------------
// HANDLER DE EDICIÓN (INTEGRACIÓN CON API)
// -----------------------------------------------------------------

// Guardar cambios en edición (Modificado para usar PATCH)
document.getElementById("formEditar").onsubmit = async e => {
    e.preventDefault();
    const cardElement = e.target.dataset.card;
    const type = document.getElementById("editType").value;
    const id = cardElement.dataset.id;
    
    let endpoint = '';
    let updateData = {};

    // 1. Recolectar datos y definir endpoint
    if (type === "proveedor") {
        endpoint = `/proveedor/${id}`;
        updateData = {
            nombre: document.getElementById("editNombre").value,
            contacto: document.getElementById("editContacto").value,
            direccion: document.getElementById("editDireccion").value
        };
    } else if (type === "categoria") {
        endpoint = `/categoria-instrumento/${id}`;
        updateData = { nombre: document.getElementById("editNombre").value };
    } else if (type === "almacen") {
        endpoint = `/ubicacion-almacen/${id}`;
        updateData = {
            nombre: document.getElementById("editNombre").value,
            ubicacion: document.getElementById("editUbicacion").value
        };
    } else {
        return; // Tipo desconocido
    }

    try {
        // 2. Enviar petición PATCH
        const respuesta = await apiFetch(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(updateData)
        });

        // 3. Actualizar el DOM solo si la API tuvo éxito
        const data = respuesta.data;
        if (type === "proveedor") {
            cardElement.querySelector(".nombre").textContent = data.nombre;
            cardElement.querySelector(".contacto").textContent = data.contacto;
            cardElement.querySelector(".direccion").textContent = data.direccion;
        } else if (type === "categoria") {
            cardElement.querySelector(".nombre").textContent = data.nombre;
        } else if (type === "almacen") {
            cardElement.querySelector(".nombre").textContent = data.nombre;
            cardElement.querySelector(".ubicacion").textContent = data.ubicacion;
        }

        closeModal("modalEditar");
        alert(`✅ ${type} actualizado con éxito.`);

    } catch (error) {
        console.error(`Error al editar ${type}:`, error.message);
        alert(`❌ Error al guardar cambios: ${error.message}`);
    }
};

// -----------------------------------------------------------------
// PREPARAR MODAL DE EDICIÓN (CÓDIGO EXISTENTE, LIGERAMENTE MODIFICADO)
// -----------------------------------------------------------------

function prepareEditModal(type, card) {
    const modal = document.getElementById("modalEditar");
    const form = document.getElementById("formEditar");
    const extraFields = document.getElementById("extraFields");

    document.getElementById("editType").value = type;
    extraFields.innerHTML = "";

    // 🔑 Importante: Guardar la referencia del elemento DOM
    form.dataset.card = card; 

    if (type === "proveedor") {
        document.getElementById("editNombre").value = card.querySelector(".nombre").textContent;
        extraFields.innerHTML = `
            <label>Contacto</label>
            <input type="text" id="editContacto" value="${card.querySelector(".contacto").textContent}" required>
            <label>Dirección</label>
            <input type="text" id="editDireccion" value="${card.querySelector(".direccion").textContent}" required>
        `;
    }
    if (type === "categoria") {
        document.getElementById("editNombre").value = card.querySelector(".nombre").textContent;
    }
    if (type === "almacen") {
        document.getElementById("editNombre").value = card.querySelector(".nombre").textContent;
        extraFields.innerHTML = `
            <label>Ubicación</label>
            <input type="text" id="editUbicacion" value="${card.querySelector(".ubicacion").textContent}" required>
        `;
    }

    openModal("modalEditar");
}


// -----------------------------------------------------------------
// EVENTOS INICIALES (Conexión de Apertura/Cierre y Carga de Datos)
// -----------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    // Eventos de apertura
    document.getElementById("btnCrearProveedor")?.addEventListener('click', () => openModal("modalProveedor"));
    document.getElementById("btnCrearCategoria")?.addEventListener('click', () => openModal("modalCategoria"));
    document.getElementById("btnCrearAlmacen")?.addEventListener('click', () => openModal("modalAlmacen"));

    // Eventos de cierre
    document.querySelectorAll(".close, .cancel").forEach(el => {
        el.addEventListener("click", (e) => {
            const modalId = e.target.getAttribute('data-modal') || e.target.parentElement.parentElement.id;
            closeModal(modalId);
        });
    });
    
    // Iniciar la carga de datos al cargar la página
    cargarTodasLasTarjetas();
});
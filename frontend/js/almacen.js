// /frontend/js/almacen.js
// Requiere que apiFetch exista en /frontend/js/api.service.js

/* ========= Utilidades modal ========= */
function openModal(id) {
  document.getElementById(id).style.display = "block";
}
function closeModal(id) {
  document.getElementById(id).style.display = "none";
}

/* ========= Mapeo de columnas por tipo ========= */
const TYPE_TO_COLUMN_ID = {
  proveedor: "colProveedores",
  categoria: "colCategorias",
  almacen: "colAlmacenes",
};
function getColumnContainer(type) {
  return document.getElementById(TYPE_TO_COLUMN_ID[type]);
}

/* ========= Crear tarjeta ========= */
function addCard(type, data) {
  const column = getColumnContainer(type);
  if (!column) return;

  const card = document.createElement("div");
  card.className = "card";
  card.dataset.id = data.id;   // id de DB
  card.dataset.type = type;

  let content = "";
  if (type === "proveedor") {
    content = `
      <h3>Proveedor</h3>
      <p><strong>Nombre:</strong> <span class="nombre">${data.nombre}</span></p>
      <p><strong>Contacto:</strong> <span class="contacto">${data.contacto}</span></p>
      <p><strong>Dirección:</strong> <span class="direccion">${data.direccion}</span></p>
    `;
  } else if (type === "categoria") {
    content = `
      <h3>Categoría</h3>
      <p><strong>Nombre:</strong> <span class="nombre">${data.nombre}</span></p>
    `;
  } else if (type === "almacen") {
    content = `
      <h3>Almacén</h3>
      <p><strong>Nombre:</strong> <span class="nombre">${data.nombre}</span></p>
      <p><strong>Ubicación:</strong> <span class="ubicacion">${data.ubicacion}</span></p>
    `;
  }

  const buttons = `
    <div class="card-buttons">
      <button class="edit">Editar</button>
      <button class="delete">Eliminar</button>
    </div>
  `;

  card.innerHTML = content + buttons;

  // Eliminar
  card.querySelector(".delete").onclick = () => handleEliminar(type, data.id, card);

  // Editar
  card.querySelector(".edit").onclick = () => prepareEditModal(type, card);

  // Apilar en su columna
  column.appendChild(card);
}

/* ========= Cargar todos los datos ========= */
async function cargarTodasLasTarjetas() {
  // Mensajes de estado por columna
  const cols = {
    proveedor: getColumnContainer("proveedor"),
    categoria: getColumnContainer("categoria"),
    almacen: getColumnContainer("almacen"),
  };
  Object.values(cols).forEach(col => col && (col.innerHTML = '<p>Cargando...</p>'));

  try {
    const [provRes, catRes, almRes] = await Promise.all([
      apiFetch('/proveedor', { method: 'GET' }),
      apiFetch('/categoria-instrumento', { method: 'GET' }),
      apiFetch('/ubicacion-almacen', { method: 'GET' })
    ]);

    // Limpiar columnas
    Object.values(cols).forEach(col => col && (col.innerHTML = ''));

    // Render
    provRes.data.forEach(d => addCard('proveedor', d));
    catRes.data.forEach(d => addCard('categoria', d));
    almRes.data.forEach(d => addCard('almacen', d));

    if (!provRes.data.length) cols.proveedor.innerHTML = '<p style="opacity:.6;">Sin proveedores.</p>';
    if (!catRes.data.length)  cols.categoria.innerHTML  = '<p style="opacity:.6;">Sin categorías.</p>';
    if (!almRes.data.length)  cols.almacen.innerHTML    = '<p style="opacity:.6;">Sin almacenes.</p>';

  } catch (error) {
    console.error("Error al cargar:", error.message);
    Object.values(cols).forEach(col => {
      if (col) col.innerHTML = `<p style="color:red;">Error: ${error.message}</p>`;
    });
  }
}

/* ========= Crear (API) ========= */
document.getElementById("formProveedor").onsubmit = async (e) => {
  e.preventDefault();
  const body = {
    nombre: document.getElementById("provNombre").value.trim(),
    contacto: document.getElementById("provContacto").value.trim(),
    direccion: document.getElementById("provDireccion").value.trim(),
  };
  try {
    const res = await apiFetch('/proveedor', { method: 'POST', body: JSON.stringify(body) });
    addCard("proveedor", res.data);
    closeModal("modalProveedor");
    e.target.reset();
  } catch (err) {
    alert(`❌ Error al crear proveedor: ${err.message}`);
  }
};

document.getElementById("formCategoria").onsubmit = async (e) => {
  e.preventDefault();
  const body = { nombre: document.getElementById("catNombre").value.trim() };
  try {
    const res = await apiFetch('/categoria-instrumento', { method: 'POST', body: JSON.stringify(body) });
    addCard("categoria", res.data);
    closeModal("modalCategoria");
    e.target.reset();
  } catch (err) {
    alert(`❌ Error al crear categoría: ${err.message}`);
  }
};

document.getElementById("formAlmacen").onsubmit = async (e) => {
  e.preventDefault();
  const body = {
    nombre: document.getElementById("almNombre").value.trim(),
    ubicacion: document.getElementById("almUbicacion").value.trim(),
  };
  try {
    const res = await apiFetch('/ubicacion-almacen', { method: 'POST', body: JSON.stringify(body) });
    addCard("almacen", res.data);
    closeModal("modalAlmacen");
    e.target.reset();
  } catch (err) {
    alert(`❌ Error al crear almacén: ${err.message}`);
  }
};

/* ========= Eliminar (API) ========= */
async function handleEliminar(type, id, cardEl) {
  if (!confirm(`¿Eliminar este ${type}?`)) return;

  let endpoint = '';
  if (type === 'proveedor') endpoint = `/proveedor/${id}`;
  else if (type === 'categoria') endpoint = `/categoria-instrumento/${id}`;
  else if (type === 'almacen') endpoint = `/ubicacion-almacen/${id}`;
  else return;

  try {
    await apiFetch(endpoint, { method: 'DELETE' });
    cardEl.remove();
    alert(`✅ ${type} eliminado.`);
  } catch (err) {
    alert(`❌ Error al eliminar ${type}: ${err.message}`);
  }
}

/* ========= Editar ========= */
function prepareEditModal(type, card) {
  const form = document.getElementById("formEditar");
  const extraFields = document.getElementById("extraFields");

  document.getElementById("editType").value = type;
  document.getElementById("editNombre").value = card.querySelector(".nombre")?.textContent || "";
  extraFields.innerHTML = "";

  if (type === "proveedor") {
    extraFields.innerHTML = `
      <label>Contacto</label>
      <input type="text" id="editContacto" value="${card.querySelector(".contacto").textContent}" required>
      <label>Dirección</label>
      <input type="text" id="editDireccion" value="${card.querySelector(".direccion").textContent}" required>
    `;
  } else if (type === "almacen") {
    extraFields.innerHTML = `
      <label>Ubicación</label>
      <input type="text" id="editUbicacion" value="${card.querySelector(".ubicacion").textContent}" required>
    `;
  }

  // Guardar referencia directa al nodo (no dataset)
  form.editingCard = card;

  openModal("modalEditar");
}

document.getElementById("formEditar").onsubmit = async (e) => {
  e.preventDefault();
  const form = e.target;
  const card = form.editingCard;
  if (!card) return;

  const type = document.getElementById("editType").value;
  const id = card.dataset.id;

  let endpoint = '';
  let updateData = {};

  if (type === "proveedor") {
    endpoint = `/proveedor/${id}`;
    updateData = {
      nombre: document.getElementById("editNombre").value.trim(),
      contacto: document.getElementById("editContacto").value.trim(),
      direccion: document.getElementById("editDireccion").value.trim(),
    };
  } else if (type === "categoria") {
    endpoint = `/categoria-instrumento/${id}`;
    updateData = { nombre: document.getElementById("editNombre").value.trim() };
  } else if (type === "almacen") {
    endpoint = `/ubicacion-almacen/${id}`;
    updateData = {
      nombre: document.getElementById("editNombre").value.trim(),
      ubicacion: document.getElementById("editUbicacion").value.trim(),
    };
  } else {
    return;
  }

  try {
    const resp = await apiFetch(endpoint, { method: 'PATCH', body: JSON.stringify(updateData) });
    const data = resp.data;

    // Actualizar DOM
    card.querySelector(".nombre").textContent = data.nombre;
    if (type === "proveedor") {
      card.querySelector(".contacto").textContent = data.contacto;
      card.querySelector(".direccion").textContent = data.direccion;
    }
    if (type === "almacen") {
      card.querySelector(".ubicacion").textContent = data.ubicacion;
    }

    closeModal("modalEditar");
    alert(`✅ ${type} actualizado.`);

  } catch (err) {
    console.error(`Error al editar ${type}:`, err.message);
    alert(`❌ Error al guardar cambios: ${err.message}`);
  }
};

/* ========= Eventos iniciales ========= */
document.addEventListener('DOMContentLoaded', () => {
  // Apertura
  document.getElementById("btnCrearProveedor")?.addEventListener('click', () => openModal("modalProveedor"));
  document.getElementById("btnCrearCategoria")?.addEventListener('click', () => openModal("modalCategoria"));
  document.getElementById("btnCrearAlmacen")?.addEventListener('click', () => openModal("modalAlmacen"));

  // Cierre
  document.querySelectorAll(".close, .cancel").forEach(el => {
    el.addEventListener("click", (e) => {
      const modalId = e.target.getAttribute('data-modal') || e.target.closest('.modal')?.id;
      if (modalId) closeModal(modalId);
    });
  });

  // Cargar datos
  cargarTodasLasTarjetas();
});

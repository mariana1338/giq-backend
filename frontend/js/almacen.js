// Función para abrir modal
function openModal(id) {
  document.getElementById(id).style.display = "block";
}

// Función para cerrar modal
function closeModal(id) {
  document.getElementById(id).style.display = "none";
}

// Eventos de apertura
document.getElementById("btnCrearProveedor").onclick = () => openModal("modalProveedor");
document.getElementById("btnCrearCategoria").onclick = () => openModal("modalCategoria");
document.getElementById("btnCrearAlmacen").onclick = () => openModal("modalAlmacen");

// Eventos de cierre
document.querySelectorAll(".close, .cancel").forEach(el => {
  el.addEventListener("click", () => {
    closeModal(el.dataset.modal);
  });
});

// Función para crear tarjetas
function addCard(type, data) {
  const container = document.getElementById("cardContainer");
  const card = document.createElement("div");
  card.className = "card";

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

  // Evento eliminar
  card.querySelector(".delete").onclick = () => {
    card.remove();
  };

  // Evento editar
  card.querySelector(".edit").onclick = () => {
    prepareEditModal(type, card);
  };

  container.appendChild(card);
}

// Preparar modal de edición
function prepareEditModal(type, card) {
  const modal = document.getElementById("modalEditar");
  const form = document.getElementById("formEditar");
  const extraFields = document.getElementById("extraFields");

  document.getElementById("editType").value = type;
  document.getElementById("formEditar").dataset.cardId = card; // referencia al card
  extraFields.innerHTML = "";

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

  // Guardar referencia de la tarjeta en edición
  form.dataset.card = card;
  openModal("modalEditar");
}

// Guardar cambios en edición
document.getElementById("formEditar").onsubmit = e => {
  e.preventDefault();
  const type = document.getElementById("editType").value;
  const card = e.target.dataset.card;

  if (type === "proveedor") {
    card.querySelector(".nombre").textContent = document.getElementById("editNombre").value;
    card.querySelector(".contacto").textContent = document.getElementById("editContacto").value;
    card.querySelector(".direccion").textContent = document.getElementById("editDireccion").value;
  }
  if (type === "categoria") {
    card.querySelector(".nombre").textContent = document.getElementById("editNombre").value;
  }
  if (type === "almacen") {
    card.querySelector(".nombre").textContent = document.getElementById("editNombre").value;
    card.querySelector(".ubicacion").textContent = document.getElementById("editUbicacion").value;
  }

  closeModal("modalEditar");
};



// Formularios
document.getElementById("formProveedor").onsubmit = e => {
  e.preventDefault();
  addCard("proveedor", {
    nombre: document.getElementById("provNombre").value,
    contacto: document.getElementById("provContacto").value,
    direccion: document.getElementById("provDireccion").value
  });
  closeModal("modalProveedor");
  e.target.reset();
};

document.getElementById("formCategoria").onsubmit = e => {
  e.preventDefault();
  addCard("categoria", {
    nombre: document.getElementById("catNombre").value
  });
  closeModal("modalCategoria");
  e.target.reset();
};

document.getElementById("formAlmacen").onsubmit = e => {
  e.preventDefault();
  addCard("almacen", {
    nombre: document.getElementById("almNombre").value,
    ubicacion: document.getElementById("almUbicacion").value
  });
  closeModal("modalAlmacen");
  e.target.reset();
};

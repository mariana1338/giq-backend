// Elementos
const btnCrear = document.getElementById("btnCrear");
const modal = document.getElementById("modal");
const closeModal = document.getElementById("closeModal");
const cancelar = document.getElementById("cancelar");
const ventaForm = document.getElementById("ventaForm");
const tablaBody = document.getElementById("tablaBody");
const btnBack = document.getElementById("btnBack"); // <-- flecha

// Abrir modal
btnCrear.addEventListener("click", () => {
  modal.style.display = "flex";
});

// Cerrar modal
closeModal.addEventListener("click", () => {
  modal.style.display = "none";
});
cancelar.addEventListener("click", () => {
  modal.style.display = "none";
});

// Agregar producto a la tabla
ventaForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const productoSelect = document.getElementById("producto");
  const producto = productoSelect.value;
  const precioUnitario = productoSelect.options[productoSelect.selectedIndex].dataset.precio;
  const cantidad = parseInt(document.getElementById("cantidad").value);

  if (!producto || !cantidad) return;

  const total = cantidad * precioUnitario;

  const fila = `
    <tr>
      <td>${producto}</td>
      <td>${cantidad}</td>
      <td>$${parseInt(precioUnitario).toLocaleString()}</td>
      <td>$${total.toLocaleString()}</td>
    </tr>
  `;

  tablaBody.insertAdjacentHTML("beforeend", fila);

  // Reset form y cerrar modal
  ventaForm.reset();
  modal.style.display = "none";
});

// 🔹 Acción del botón flecha
btnBack.addEventListener("click", () => {
  // Vuelve atrás en el historial
  window.history.back();

  // O si prefieres que siempre vaya a una página fija, descomenta esto:
  // window.location.href = "index.html";
});

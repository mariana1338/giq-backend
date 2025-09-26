     document.addEventListener("DOMContentLoaded", () => {
            const btnCrear = document.getElementById("btnCrear");
            const modal = document.getElementById("modalCrear");
            const cerrarModal = document.getElementById("cerrarModal");
            const cancelarModal = document.getElementById("cancelarModal");
            const formProducto = document.getElementById("formProducto");
            const contenedor = document.querySelector(".cards-container");

            // Abrir modal
            btnCrear.addEventListener("click", () => {
                modal.style.display = "flex";
            });

            // Cerrar modal
            cerrarModal.addEventListener("click", () => {
                modal.style.display = "none";
            });
            cancelarModal.addEventListener("click", () => {
                modal.style.display = "none";
            });


            formProducto.addEventListener("submit", (e) => {
                e.preventDefault();

                const nombre = document.getElementById("nombre").value;
                const codigo = document.getElementById("codigo").value;
                const cantidad = document.getElementById("cantidad").value;
                const minimo = document.getElementById("minimo").value;
                const precioVenta = document.getElementById("precioVenta").value;
                const precioEntrada = document.getElementById("precioEntrada").value;
                const categoria = document.getElementById("categoria").value;

                const nuevaCard = document.createElement("div");
                nuevaCard.classList.add("card");
                nuevaCard.innerHTML = `5
                    <h2 class="product-title">${nombre}</h2>
                    <p class="code">${codigo}</p>
                    <span class="tag">${categoria}</span>
                    <div class="item-info">
                        <p>Stock:</p> <span class="stock ok">${cantidad}</span>
                    </div>
                    <div class="item-info">
                        <p>Min:</p> <span>${minimo}</span>
                    </div>
                    <div class="price-info">
                        <p>Precio:</p> <span>$${precioVenta}</span>
                    </div>
                    <div class="cost-info">
                        <p>Costo: $${precioEntrada}</p>
                    </div>
                    <div class="actions">
                        <button class="edit">✏️</button>
                        <button class="delete">🗑️</button>
                    </div>
                `;

                // Botón eliminar
                nuevaCard.querySelector(".delete").addEventListener("click", () => {
                    nuevaCard.remove();
                });

                // Botón editar
                nuevaCard.querySelector(".edit").addEventListener("click", () => {
                    modal.style.display = "flex";
                });

                contenedor.appendChild(nuevaCard);
                formProducto.reset();
                modal.style.display = "none";
            });
        });
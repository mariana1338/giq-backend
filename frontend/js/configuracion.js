document.getElementById('configForm').addEventListener('submit', function(e) {
    e.preventDefault();

    // Obtén los valores de los campos
    const config = {
        stockBajo: document.getElementById('stockBajo').checked,
        nuevosPedidos: document.getElementById('nuevosPedidos').checked,
        notiEmail: document.getElementById('notiEmail').checked,
    };

    // Aquí puedes guardar la configuración en localStorage, enviarla a un backend, etc.
    // Por ahora solo mostramos un mensaje:
    alert("¡Configuraciones guardadas correctamente!");
    // console.log(config);
});
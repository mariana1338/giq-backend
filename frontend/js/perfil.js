
(function(){
    const editBtn = document.getElementById('editBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const form = document.getElementById('profileForm');
    const inputs = form.querySelectorAll('input');

    function setReadOnly(readonly){
        inputs.forEach(i => {
            if(readonly) i.setAttribute('readonly','');
            else i.removeAttribute('readonly');
        });
    }

    editBtn.addEventListener('click', () => {
        const isReadOnly = inputs[0].hasAttribute('readonly');
        if(isReadOnly){
            // activar edición
            setReadOnly(false);
            editBtn.textContent = '💾 Guardar';
            inputs[0].focus();
        } else {
            // guardar cambios (simulado)
            setReadOnly(true);
            editBtn.textContent = '✎ Editar';
            // aquí podrías enviar los datos con fetch a tu backend
            alert('Datos guardados correctamente');
        }
    });

    // evitar submit por Enter innecesario, manejar guardado con el botón Editar
    form.addEventListener('submit', function(e){
        e.preventDefault();
        // si los campos están en modo edición, guardar
        const isReadOnly = inputs[0].hasAttribute('readonly');
        if(!isReadOnly){
            setReadOnly(true);
            editBtn.textContent = '✎ Editar';
            alert('Datos guardados correctamente');
        }
    });

    logoutBtn.addEventListener('click', () => {
        window.location.href = '/'; 
    });
})();

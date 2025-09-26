function togglePassword() {
        const pwd = document.getElementById('password');
        pwd.type = pwd.type === 'password' ? 'text' : 'password';
}

    document.querySelector('.login-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const usuario = document.getElementById('usuario').value.trim();
        const password = document.getElementById('password').value.trim();

        if (usuario === "" || password === "") {
            alert("Por favor, ingresa usuario y contraseña.");
            return;
        }

        
        window.location.href = "/Vista/page.html";
    });




function togglePassword() {
    const pwd = document.getElementById('password');
    pwd.type = pwd.type === 'password' ? 'text' : 'password';
}

function goToLogin(e) {
    e.preventDefault();
 
    alert("Ya tienes cuenta, por favor inicia sesión.");
}

document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const nombre = document.getElementById('nombre').value.trim();
    const correo = document.getElementById('correo').value.trim();
    const documento = document.getElementById('documento').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!nombre || !correo || !documento || !password) {
        alert("Por favor, completa todos los campos.");
        return;
    }

  
    if (correo === "existe@correo.com") {
        alert("Ya tienes cuenta, por favor inicia sesión.");
        return;
    }

    alert("¡Cuenta creada exitosamente!");  
    
    window.location.href = "../Vista/login.html"; 
});
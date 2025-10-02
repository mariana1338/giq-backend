// /frontend/js/login.js

// URL base de tu API de NestJS
const API_BASE_URL = 'http://localhost:3000'; 

// Función para mostrar/ocultar contraseña (la mantenemos)
function togglePassword() {
    const pwd = document.getElementById('password');
    pwd.type = pwd.type === 'password' ? 'text' : 'password';
}

// Función principal para manejar el envío al backend
async function handleLogin(event) {
    event.preventDefault(); // Detiene el envío tradicional del formulario

    // 1. Obtener los valores de los inputs
    const userInput = document.getElementById('usuario').value.trim(); 
    const password = document.getElementById('password').value.trim();
    
    // Validación básica de campos vacíos
    if (!userInput || !password) {
        alert("Por favor, ingresa el usuario/correo y la contraseña.");
        return;
    }

    // El objeto a enviar debe coincidir con el LoginDto (email y password)
    const loginData = { 
        email: userInput, // Mapeamos el campo 'usuario' del HTML a 'email' para el DTO
        password: password
    };
    
    // 2. Realizar la petición POST a NestJS
    try {
        const respuesta = await fetch(`${API_BASE_URL}/usuarios/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(loginData),
        });

        const data = await respuesta.json();

        if (respuesta.ok) {
            // Login exitoso (Status 200 OK)
            
            // 🔑 PASO CRÍTICO: Guardar el token de autenticación (JWT)
            if (data.data && data.data.access_token) {
                // 🔑 CORRECCIÓN: Limpiar el token antes de guardarlo en localStorage
                const cleanToken = String(data.data.access_token).trim();
                localStorage.setItem('jwt_token', cleanToken);
                
                // Redirigir al dashboard principal del inventario
                window.location.href = '/frontend/Vista/page.html'; 
            } else {
                alert('Login exitoso, pero el servidor no devolvió el token.');
            }

        } else {
            // Error de credenciales o del servidor (ej: 401 Unauthorized)
            const errorMessage = data.message 
                ? Array.isArray(data.message) ? data.message.join(', ') : data.message
                : 'Email o contraseña incorrectos.';

            alert(`Error de inicio de sesión: ${errorMessage}`);
            console.error('Error de autenticación:', data);
        }
    } catch (error) {
        // Error de red (servidor NestJS apagado o CORS mal configurado)
        console.error('Error de conexión:', error);
        alert('🚨 Error de conexión. Asegúrate de que el servidor NestJS esté corriendo en http://localhost:3000.');
    }
}

// Conectar la nueva función al evento submit del formulario
document.querySelector('.login-form').addEventListener('submit', handleLogin);
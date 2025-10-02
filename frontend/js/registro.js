// /frontend/js/registro.js

const API_BASE_URL = 'http://localhost:3000'; 

function togglePassword() {
    const pwd = document.getElementById('password');
    pwd.type = pwd.type === 'password' ? 'text' : 'password';
}

async function handleRegistro(event) {
    event.preventDefault();

    const nombre = document.getElementById('nombre').value.trim();
    const correo = document.getElementById('correo').value.trim();
    const rol = document.getElementById('rol').value;
    const password = document.getElementById('password').value.trim();
    
    if (!nombre || !correo || !rol || !password) {
        alert("Por favor, completa todos los campos.");
        return;
    }

    // ⬅️ El objeto final solo tiene los campos que el backend necesita y espera.
    const userData = { 
        nombre: nombre,
        correo: correo,
        rol: rol, 
        password: password
    };
    
    try {
        const respuesta = await fetch(`${API_BASE_URL}/usuarios`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        const data = await respuesta.json();

        if (respuesta.ok) {
            alert('✅ Cuenta creada exitosamente! Ahora puedes iniciar sesión.');
            window.location.href = '../Vista/login.html'; 
        } else {
            const errorMessage = data.message 
                ? Array.isArray(data.message) ? data.message.join(', ') : data.message
                : 'Error desconocido al registrar.';
            
            alert(`❌ Fallo en el registro: ${errorMessage}`);
            console.error('Error del servidor:', data);
        }
    } catch (error) {
        console.error('Error de conexión:', error);
        alert('🚨 Error de conexión. Asegúrate de que tu servidor NestJS esté corriendo.');
    }
}

document.getElementById('registerForm').addEventListener('submit', handleRegistro);
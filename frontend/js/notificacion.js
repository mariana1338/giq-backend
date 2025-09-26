// ...existing code...
const notificacionesDemo = [
    { id: 1, titulo: "Stock bajo", descripcion: "Guantes de látex por debajo del umbral.", fecha: "2025-08-25 09:30", leida: false, icono: "🩺" },
    { id: 2, titulo: "Nuevo pedido", descripcion: "Pedido recibido: Bisturí Quirúrgico.", fecha: "2025-08-24 16:10", leida: false, icono: "📦" },
    { id: 3, titulo: "Sesión expirada", descripcion: "Tu sesión ha expirado por inactividad.", fecha: "2025-08-23 12:00", leida: true, icono: "⏰" }
];

let notificaciones = JSON.parse(localStorage.getItem('notificacionesDemo')) || notificacionesDemo.slice();

function saveStore(){ localStorage.setItem('notificacionesDemo', JSON.stringify(notificaciones)); }

function renderNotificaciones(){
    const list = document.getElementById('notifList');
    if(!list) return;
    list.innerHTML = '';
    if(notificaciones.length === 0){
        list.innerHTML = '<div class="notif-empty">No hay notificaciones.</div>';
        return;
    }
    notificaciones.forEach(n => {
        const card = document.createElement('div');
        card.className = 'notif-card' + (n.leida ? '' : ' unread');
        card.innerHTML = `
            <div class="notif-icon">${n.icono}</div>
            <div class="notif-content">
                <div class="notif-title">
                    <span>${escapeHtml(n.titulo)}</span>
                    <small class="notif-date">${escapeHtml(n.fecha)}</small>
                </div>
                <div class="notif-desc">${escapeHtml(n.descripcion)}</div>
            </div>
            <div class="notif-actions-ctrl">
                <button class="notif-mark" title="${n.leida ? 'Marcar como no leída' : 'Marcar como leída'}" onclick="toggleLeida(${n.id})">
                    ${n.leida ? '🔁' : '✔️'}
                </button>
                <button class="notif-mark" title="Eliminar" onclick="eliminarNoti(${n.id})">🗑️</button>
            </div>
        `;
        list.appendChild(card);
    });
}

function toggleLeida(id){
    const it = notificaciones.find(n=>n.id===id);
    if(it) it.leida = !it.leida;
    saveStore();
    renderNotificaciones();
}

function marcarTodasLeidas(){
    notificaciones.forEach(n=>n.leida = true);
    saveStore();
    renderNotificaciones();
}

function borrarLeidas(){
    notificaciones = notificaciones.filter(n=>!n.leida);
    saveStore();
    renderNotificaciones();
}

function eliminarNoti(id){
    notificaciones = notificaciones.filter(n=>n.id !== id);
    saveStore();
    renderNotificaciones();
}

function agregarNotiPrueba(){
    const id = Date.now();
    const nuevo = {
        id,
        titulo: "Notificación de prueba",
        descripcion: "Esta es una notificación agregada para pruebas.",
        fecha: new Date().toLocaleString(),
        leida: false,
        icono: "🔔"
    };
    notificaciones.unshift(nuevo);
    saveStore();
    renderNotificaciones();
}

function escapeHtml(str){
    return String(str).replace(/[&<>"'`]/g, s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','`':'&#96;'}[s]));
}

window.addEventListener('load', renderNotificaciones);
document.addEventListener('DOMContentLoaded', () => {
    const el = document.querySelector('.welcome-text');
    if(!el) return;
    const text = el.textContent.trim();
    el.innerHTML = '';
    Array.from(text).forEach((ch, idx) => {
        const span = document.createElement('span');
        span.textContent = ch;
        span.style.setProperty('--i', idx);
        if (ch === ' ') {
            span.style.width = '0.45em';
            span.style.display = 'inline-block';
        }
        el.appendChild(span);
    });

    InventarioBtn.addEventListener('click', () => {
        window.location.href = '/Vista/Inventario.html'; 
    });
});


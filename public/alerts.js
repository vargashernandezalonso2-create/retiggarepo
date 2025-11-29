// aaa sistema de alertas visuales -bynd
// q chidoteee para mostrar notificaciones bonitas -bynd

window.showAlert = function(message, type = 'info') {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        z-index: 10000;
        padding: 1rem 1.5rem;
        border-radius: var(--radius);
        box-shadow: var(--shadow-lg);
        display: flex;
        align-items: center;
        gap: 0.75rem;
        font-weight: 600;
        animation: slideInRight 0.3s ease-out;
        max-width: 400px;
    `;

    // chintrolas colores según tipo -bynd
    const styles = {
        success: {
            bg: 'linear-gradient(135deg, #10b981, #059669)',
            color: 'white',
            icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>`
        },
        danger: {
            bg: '#ef4444',
            color: 'white',
            icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>`
        },
        warning: {
            bg: '#f59e0b',
            color: 'white',
            icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>`
        },
        info: {
            bg: '#3b82f6',
            color: 'white',
            icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>`
        }
    };

    const style = styles[type] || styles.info;
    alert.style.background = style.bg;
    alert.style.color = style.color;

    alert.innerHTML = `
        ${style.icon}
        <span>${message}</span>
    `;

    document.body.appendChild(alert);

    // ey remover después de 3 segundos -bynd
    setTimeout(() => {
        alert.style.animation = 'slideOutRight 0.3s ease-out forwards';
        setTimeout(() => alert.remove(), 300);
    }, 3000);
};

// vavavava efectos visuales al agregar al carrito -bynd
window.handleAddToCartSuccessEffects = function() {
    // chintrolas confetti -bynd
    if (typeof confetti === 'function') {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    }

    // q chidoteee animar icono del carrito -bynd
    const cartButton = document.getElementById('btn-show-cart');
    if (cartButton) {
        cartButton.style.animation = 'bounce 0.6s ease-in-out';
        setTimeout(() => {
            cartButton.style.animation = '';
        }, 600);
    }
};

// fokeis animaciones CSS -bynd
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }

    @keyframes bounce {
        0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
        }
        40% {
            transform: translateY(-10px);
        }
        60% {
            transform: translateY(-5px);
        }
    }
`;
document.head.appendChild(style);

console.log('✅ Sistema de alertas cargado');

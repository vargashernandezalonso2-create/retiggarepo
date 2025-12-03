// aaa sistema de alertas mejorado -bynd
// q chidoteee notificaciones bonitas con animaciones -bynd

console.log('🔔 Sistema de alertas cargado');

// ey función principal para mostrar alertas -bynd
window.showAlert = function(message, type = 'info') {
    const alertIcons = {
        success: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
        danger: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
        warning: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
        info: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`
    };

    // chintrolas crear elemento de alerta -bynd
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        z-index: 10000;
        min-width: 300px;
        max-width: 500px;
        padding: 1rem 1.25rem;
        background: white;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
        display: flex;
        align-items: center;
        gap: 0.75rem;
        animation: slideInRight 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        border-left: 4px solid;
    `;

    // vavavava colores según tipo -bynd
    const colors = {
        success: '#10b981',
        danger: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6'
    };
    
    alert.style.borderLeftColor = colors[type] || colors.info;
    
    // q chidoteee contenido de la alerta -bynd
    alert.innerHTML = `
        <div style="color: ${colors[type]}; flex-shrink: 0;">
            ${alertIcons[type]}
        </div>
        <span style="flex: 1; color: #1f2937; font-weight: 500; font-size: 0.95rem;">${message}</span>
        <button onclick="this.parentElement.remove()" style="background: none; border: none; color: #9ca3af; cursor: pointer; font-size: 1.25rem; line-height: 1; padding: 0; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center;">&times;</button>
    `;
    
    // ey agregar al DOM -bynd
    document.body.appendChild(alert);
    
    // fokeis auto-eliminar después de 4 segundos -bynd
    setTimeout(() => {
        alert.style.animation = 'slideOutRight 0.3s ease-out forwards';
        setTimeout(() => alert.remove(), 300);
    }, 4000);
};

// aaa agregar animaciones CSS si no existen -bynd
if (!document.getElementById('alert-animations')) {
    const style = document.createElement('style');
    style.id = 'alert-animations';
    style.textContent = `
        @keyframes slideInRight {
            from {
                opacity: 0;
                transform: translateX(100%);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        
        @keyframes slideOutRight {
            from {
                opacity: 1;
                transform: translateX(0);
            }
            to {
                opacity: 0;
                transform: translateX(100%);
            }
        }
    `;
    document.head.appendChild(style);
}

console.log('✅ Sistema de alertas listo');

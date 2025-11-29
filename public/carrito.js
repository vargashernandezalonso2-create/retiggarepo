// aaa sistema completo del carrito -bynd
// q chidoteee funciona con el servidor y gestiona todo el carrito -bynd

console.log('🛒 Cargando sistema de carrito...');

// vavavava función principal para agregar al carrito -bynd
window.addToCart = async function(productId, quantity) {
    console.log('🛒 Agregando al carrito:', { productId, quantity });
    
    // chintrolas verificar autenticación -bynd
    if (!window.isUserAuthenticated) {
        console.log('⚠️ Usuario no autenticado');
        if (window.requestLogin) {
            window.requestLogin('Debes iniciar sesión para agregar productos al carrito');
        } else if (typeof showAlert === 'function') {
            showAlert('Debes iniciar sesión para agregar productos al carrito', 'warning');
        }
        return;
    }

    try {
        const response = await fetch('/api/cliente/carrito/agregar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                producto_id: productId,
                cantidad: quantity
            })
        });

        if (response.status === 401) {
            window.isUserAuthenticated = false;
            if (window.requestLogin) {
                window.requestLogin('Tu sesión expiró. Inicia sesión nuevamente');
            }
            throw new Error('No autorizado');
        }

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Error al agregar al carrito');
        }

        console.log('✅ Producto agregado:', data);

        // ey efectos visuales -bynd
        if (typeof handleAddToCartSuccessEffects === 'function') {
            handleAddToCartSuccessEffects();
        }

        // fokeis recargar carrito -bynd
        if (window.loadCart) {
            await window.loadCart();
        }

        // chintrolas mostrar alerta -bynd
        if (typeof showAlert === 'function') {
            showAlert('¡Producto agregado al carrito!', 'success');
        }

        // vavavava abrir carrito automáticamente -bynd
        setTimeout(() => {
            const cartOverlay = document.getElementById('side-cart-overlay');
            if (cartOverlay) {
                cartOverlay.style.display = 'block';
                setTimeout(() => cartOverlay.classList.add('active'), 10);
                document.body.style.overflow = 'hidden';
            }
        }, 300);

        return data;

    } catch (error) {
        console.error('❌ Error agregando al carrito:', error);
        if (typeof showAlert === 'function') {
            showAlert(error.message, 'danger');
        } else {
            alert(error.message);
        }
        throw error;
    }
};

// q chidoteee función para cargar el carrito -bynd
window.loadCart = async function() {
    const cartBody = document.getElementById('cart-body');
    const cartFooter = document.getElementById('cart-footer');
    const cartSubtotal = document.getElementById('cart-subtotal');
    const cartCountBubble = document.getElementById('cart-count-bubble');

    if (!cartBody) {
        console.warn('⚠️ Elemento cart-body no encontrado');
        return;
    }

    try {
        const response = await fetch('/api/cliente/carrito', {
            headers: {
                'Cache-Control': 'no-cache'
            }
        });

        if (!response.ok) {
            throw new Error('Error al cargar carrito');
        }

        const data = await response.json();
        console.log('📦 Carrito cargado:', data);

        // aaa si el carrito está vacío -bynd
        if (!data.carrito || data.carrito.length === 0) {
            cartBody.innerHTML = '<p class="cart-empty">Tu carrito está vacío.</p>';
            if (cartFooter) cartFooter.style.display = 'none';
            if (cartCountBubble) {
                cartCountBubble.style.display = 'none';
                cartCountBubble.textContent = '0';
            }
            return;
        }

        // chintrolas renderizar items del carrito -bynd
        cartBody.innerHTML = '';
        let total = 0;
        let itemCount = 0;

        data.carrito.forEach(item => {
            const nombre = item.nombre || 'Producto';
            const imagen = item.imagen_url || 'https://placehold.co/60x60/0056b3/FFFFFF/png?text=Producto';
            const cantidad = item.cantidad || 1;
            const precio = parseFloat(item.precio || 0);
            const subtotal = precio * cantidad;

            total += subtotal;
            itemCount += cantidad;

            const itemEl = document.createElement('div');
            itemEl.className = 'cart-item';
            itemEl.style.cssText = `
                display: flex;
                gap: 1rem;
                padding: 1rem;
                background: white;
                border-radius: var(--radius);
                margin-bottom: 0.75rem;
                border: 2px solid var(--border-color);
                transition: all var(--transition-base);
            `;
            
            itemEl.innerHTML = `
                <img src="${imagen}" alt="${nombre}" style="width: 60px; height: 60px; object-fit: cover; border-radius: var(--radius-sm); flex-shrink: 0;" onerror="this.src='https://placehold.co/60x60/0056b3/FFFFFF/png?text=${encodeURIComponent(nombre)}'">
                <div style="flex: 1; min-width: 0;">
                    <h4 style="margin: 0 0 0.25rem 0; font-size: 0.95rem; font-weight: 700; color: var(--text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${nombre}</h4>
                    <p style="margin: 0 0 0.5rem 0; font-size: 1rem; font-weight: 700; color: var(--primary-color);">$${precio.toFixed(2)}</p>
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <div style="display: flex; align-items: center; gap: 0.5rem; background: var(--bg-secondary); padding: 0.25rem 0.5rem; border-radius: var(--radius-sm);">
                            <button class="btn-qty btn-qty-decrease" data-item-id="${item.id}" style="width: 24px; height: 24px; padding: 0; background: var(--primary-color); color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 700; font-size: 0.9rem; display: flex; align-items: center; justify-content: center; transition: all var(--transition-fast);">−</button>
                            <span style="font-size: 0.95rem; font-weight: 700; min-width: 25px; text-align: center;">${cantidad}</span>
                            <button class="btn-qty btn-qty-increase" data-item-id="${item.id}" style="width: 24px; height: 24px; padding: 0; background: var(--primary-color); color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 700; font-size: 0.9rem; display: flex; align-items: center; justify-content: center; transition: all var(--transition-fast);">+</button>
                        </div>
                        <button class="btn-cart-remove" data-item-id="${item.id}" style="padding: 0.25rem 0.5rem; background: var(--danger-color); color: white; border: none; border-radius: var(--radius-sm); cursor: pointer; font-size: 0.85rem; font-weight: 600; transition: all var(--transition-base);">
                            🗑️ Eliminar
                        </button>
                    </div>
                </div>
            `;
            cartBody.appendChild(itemEl);
        });

        // ey actualizar totales -bynd
        if (cartSubtotal) cartSubtotal.textContent = `$${total.toFixed(2)}`;
        if (cartFooter) cartFooter.style.display = 'block';

        if (cartCountBubble) {
            cartCountBubble.textContent = itemCount;
            cartCountBubble.style.display = itemCount > 0 ? 'flex' : 'none';
        }

        // vavavava agregar eventos a los botones -bynd
        attachCartItemEvents();

    } catch (error) {
        console.error('❌ Error cargando carrito:', error);
        cartBody.innerHTML = '<p class="cart-empty" style="color: var(--danger-color);">Error al cargar el carrito.</p>';
        if (cartFooter) cartFooter.style.display = 'none';
    }
};

// fokeis función para actualizar cantidad de un item -bynd
async function updateCartItemQuantity(itemId, newQuantity) {
    try {
        const response = await fetch(`/api/cliente/carrito/actualizar/${itemId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cantidad: newQuantity })
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Error al actualizar cantidad');
        }

        await window.loadCart();
        
    } catch (error) {
        console.error('Error:', error);
        if (typeof showAlert === 'function') {
            showAlert(error.message, 'danger');
        }
    }
}

// chintrolas función para eliminar item del carrito -bynd
async function removeCartItem(itemId) {
    try {
        const response = await fetch(`/api/cliente/carrito/${itemId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Error al eliminar del carrito');
        }

        await window.loadCart();
        
        if (typeof showAlert === 'function') {
            showAlert('Producto eliminado del carrito', 'info');
        }
        
    } catch (error) {
        console.error('Error:', error);
        if (typeof showAlert === 'function') {
            showAlert(error.message, 'danger');
        }
    }
}

// q chidoteee agregar eventos a items del carrito -bynd
function attachCartItemEvents() {
    // aaa botones de incrementar -bynd
    document.querySelectorAll('.btn-qty-increase').forEach(btn => {
        btn.onmouseover = () => btn.style.transform = 'scale(1.1)';
        btn.onmouseout = () => btn.style.transform = 'scale(1)';
        
        btn.onclick = async (e) => {
            e.preventDefault();
            const itemId = e.currentTarget.dataset.itemId;
            const qtySpan = e.currentTarget.previousElementSibling;
            const currentQty = parseInt(qtySpan.textContent);
            
            await updateCartItemQuantity(itemId, currentQty + 1);
        };
    });

    // ey botones de decrementar -bynd
    document.querySelectorAll('.btn-qty-decrease').forEach(btn => {
        btn.onmouseover = () => btn.style.transform = 'scale(1.1)';
        btn.onmouseout = () => btn.style.transform = 'scale(1)';
        
        btn.onclick = async (e) => {
            e.preventDefault();
            const itemId = e.currentTarget.dataset.itemId;
            const qtySpan = e.currentTarget.nextElementSibling;
            const currentQty = parseInt(qtySpan.textContent);

            if (currentQty <= 1) {
                // chintrolas si es 1, eliminar -bynd
                await removeCartItem(itemId);
            } else {
                await updateCartItemQuantity(itemId, currentQty - 1);
            }
        };
    });

    // fokeis botones de eliminar -bynd
    document.querySelectorAll('.btn-cart-remove').forEach(btn => {
        btn.onmouseover = () => btn.style.transform = 'translateY(-2px)';
        btn.onmouseout = () => btn.style.transform = 'translateY(0)';
        
        btn.onclick = async (e) => {
            e.preventDefault();
            const itemId = e.currentTarget.dataset.itemId;
            await removeCartItem(itemId);
        };
    });
}

// vavavava eventos del carrito overlay -bynd
document.addEventListener('DOMContentLoaded', () => {
    const cartOverlay = document.getElementById('side-cart-overlay');
    const btnShowCart = document.getElementById('btn-show-cart');
    const btnCloseCart = document.getElementById('btn-close-cart');

    // q chidoteee abrir carrito -bynd
    if (btnShowCart) {
        btnShowCart.addEventListener('click', () => {
            if (window.loadCart) {
                window.loadCart();
            }
            if (cartOverlay) {
                cartOverlay.style.display = 'block';
                setTimeout(() => cartOverlay.classList.add('active'), 10);
                document.body.style.overflow = 'hidden';
            }
        });
    }

    // aaa cerrar carrito -bynd
    if (btnCloseCart) {
        btnCloseCart.addEventListener('click', () => {
            if (cartOverlay) {
                cartOverlay.classList.remove('active');
                setTimeout(() => {
                    cartOverlay.style.display = 'none';
                    document.body.style.overflow = '';
                }, 300);
            }
        });
    }

    // ey cerrar al hacer click fuera -bynd
    if (cartOverlay) {
        cartOverlay.addEventListener('click', (e) => {
            if (e.target === cartOverlay) {
                cartOverlay.classList.remove('active');
                setTimeout(() => {
                    cartOverlay.style.display = 'none';
                    document.body.style.overflow = '';
                }, 300);
            }
        });
    }

    // chintrolas manejar checkout -bynd
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const direccion = document.getElementById('direccionEnvio').value;
            const metodoPago = document.querySelector('input[name="metodoPago"]:checked').value;
            const btnCheckout = document.getElementById('btn-checkout');
            const errorDiv = document.getElementById('checkout-error');

            if (errorDiv) errorDiv.textContent = '';
            
            btnCheckout.disabled = true;
            btnCheckout.innerHTML = '<span>Procesando...</span>';

            try {
                const response = await fetch('/api/cliente/pedidos', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        direccion_envio: direccion,
                        metodo_pago: metodoPago
                    })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Error al procesar el pedido');
                }

                console.log('✅ Pedido creado:', data);

                // fokeis confetti de celebración -bynd
                if (typeof confetti === 'function') {
                    confetti({
                        particleCount: 200,
                        spread: 100,
                        origin: { y: 0.6 }
                    });
                }

                // vavavava mostrar alerta de éxito -bynd
                if (typeof showAlert === 'function') {
                    showAlert('¡Pedido confirmado! Gracias por tu compra', 'success');
                }

                // q chidoteee cerrar carrito y recargar -bynd
                if (cartOverlay) {
                    cartOverlay.classList.remove('active');
                    setTimeout(() => {
                        cartOverlay.style.display = 'none';
                        document.body.style.overflow = '';
                    }, 300);
                }

                if (window.loadCart) {
                    setTimeout(() => window.loadCart(), 500);
                }

                checkoutForm.reset();

            } catch (error) {
                console.error('❌ Error en checkout:', error);
                if (errorDiv) {
                    errorDiv.textContent = error.message;
                    errorDiv.style.display = 'block';
                }
                if (typeof showAlert === 'function') {
                    showAlert(error.message, 'danger');
                }
            } finally {
                btnCheckout.disabled = false;
                btnCheckout.innerHTML = '<span>Confirmar Pedido</span>';
            }
        });
    }

    // aaa cargar carrito al inicio si el usuario está autenticado -bynd
    if (window.isUserAuthenticated && window.loadCart) {
        window.loadCart();
    }
});

console.log('✅ Sistema de carrito cargado completamente');

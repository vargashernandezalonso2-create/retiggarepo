// Estado global
window.isUserAuthenticated = false;

document.addEventListener('DOMContentLoaded', () => {

    const log = {
        warn: (msg) => console.warn(`⚠️ ${msg}`),
        error: (msg) => console.error(`❌ ${msg}`),
        info: (msg) => console.log(`ℹ️ ${msg}`)
    };

    const productList = document.getElementById('lista-productos');
    const loginModal = document.getElementById('login-modal');
    const registerModal = document.getElementById('register-modal');
    const cartOverlay = document.getElementById('side-cart-overlay');
    const cartElement = document.getElementById('side-cart');
    const cartCountBubble = document.getElementById('cart-count-bubble');
    // Aseguramos que el elemento del contador tenga la clase 'cart-count' para la animación
    if (cartCountBubble) {
        cartCountBubble.classList.add('cart-count');
    }
    const navAuth = document.getElementById('nav-auth');
    const userInfo = document.getElementById('user-info');
    const userName = document.getElementById('user-name');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const checkoutForm = document.getElementById('checkout-form');
    const loginError = document.getElementById('login-error');
    const registerError = document.getElementById('register-error');
    const checkoutError = document.getElementById('checkout-error');

    // ==========================================
    // LÓGICA DE SELECCIÓN DE ROL
    // ==========================================
    const roleModal = document.getElementById('role-modal');
    const roleStep1 = document.getElementById('role-step-1');
    const roleStepAdmin = document.getElementById('role-step-admin');
    const btnRoleAdmin = document.getElementById('btn-role-admin');
    const btnRoleClient = document.getElementById('btn-role-client');
    const btnVerifyAdmin = document.getElementById('btn-verify-admin');
    const btnBackRole = document.getElementById('btn-back-role');
    const adminInput = document.getElementById('admin-key-input');
    const adminError = document.getElementById('admin-error');

    // 1. Si elige CLIENTE
    if(btnRoleClient) {
        btnRoleClient.addEventListener('click', () => {
            // 1. Cerramos el modal de selección de rol
            closeModal(roleModal);
            
            // 2. Abrimos inmediatamente el modal de Iniciar Sesión (Email/Pass)
            const loginModal = document.getElementById('login-modal');
            if (loginModal) {
                setTimeout(() => {
                    openModal(loginModal);
                }, 300); // Pequeño retraso para una transición suave
            }

            // 3. Ajustes visuales de rol (opcional)
            document.body.classList.add('role-client');
            document.body.classList.remove('role-admin');
        });
    }

    // 2. Si elige ADMINISTRADOR
    if(btnRoleAdmin) {
        btnRoleAdmin.addEventListener('click', () => {
            roleStep1.style.display = 'none';
            roleStepAdmin.style.display = 'block';
            adminInput.value = '';
            adminInput.focus();
        });
    }

    // Volver atrás
    if(btnBackRole) {
        btnBackRole.addEventListener('click', () => {
            roleStepAdmin.style.display = 'none';
            roleStep1.style.display = 'block';
            adminError.style.display = 'none';
        });
    }

    // Verificar contraseña de ADMIN
    if(btnVerifyAdmin) {
        btnVerifyAdmin.addEventListener('click', verifyAdmin);
    }
    
    // Permitir Enter en el input
    if(adminInput) {
        adminInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') verifyAdmin();
        });
    }

    function verifyAdmin() {
        const key = adminInput.value;
        
        // --- AQUÍ DEFINES TU CONTRASEÑA DE ADMIN ---
        // En un sistema real, esto debería ser una llamada a fetch('/api/admin/login')
        const PASSWORD_CORRECTO = "admin123"; 

        if (key === PASSWORD_CORRECTO) {
            alert('Acceso de Administrador concedido');
            closeModal(roleModal);
            document.body.classList.add('role-admin');
            document.body.classList.remove('role-client');
            
            // Aquí podrías mostrar botones ocultos de gestión
            console.log('Funciones avanzadas habilitadas');
        } else {
            adminError.style.display = 'block';
            adminError.textContent = 'Contraseña incorrecta. Intenta nuevamente.';
            
            // Efecto de vibración en el input
            adminInput.classList.add('error');
            setTimeout(() => adminInput.classList.remove('error'), 500);
        }
    }
    // ==========================================
    // FIN LÓGICA ROL
    // ==========================================

    // aaa función helper para mapear productos de PostgreSQL -bynd
    function mapearProducto(prod) {
        return {
            id: prod.id_producto || prod.id,
            nombre: prod.name_prod || prod.nombre,
            precio: prod.costo_uni || prod.precio,
            stock: prod.cantidad || prod.stock,
            imagen_url: prod.imagen_url
        };
    }

    function showAlert(message, type = 'info') {
        const alertIcons = {
            success: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
            danger: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
            warning: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
            info: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`
        };

        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            z-index: 10000;
            min-width: 300px;
            max-width: 500px;
        `;
        alert.innerHTML = `
            ${alertIcons[type]}
            <span>${message}</span>
        `;
        
        document.body.appendChild(alert);
        
        setTimeout(() => {
            alert.style.animation = 'slideOutRight 0.3s ease-out forwards';
            setTimeout(() => alert.remove(), 300);
        }, 4000);
    }

    async function fetchAPI(url, options = {}) {
        try {
            const response = await fetch(url, options);
            if (response.status === 401 && options.method !== 'GET' && !url.includes('/api/auth/check')) {
                showAlert('Debes iniciar sesión para realizar esta acción.', 'warning');
                openModal(loginModal);
                throw new Error('No autorizado');
            }
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || response.statusText);
            }
            return data;
        } catch (error) {
            console.error('Error en fetchAPI:', error.message);
            throw error;
        }
    }

    function openModal(modal) {
        if (!modal) return;
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('active'), 10);
        document.body.style.overflow = 'hidden';
    }

    function closeModal(modal) {
        if (!modal) return;
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
            if (!cartOverlay.classList.contains('active')) {
                document.body.style.overflow = 'auto';
            }
        }, 300);
    }
    
    function updateAuthUI(data) {
        if (data.autenticado) {
            navAuth.style.display = 'none';
            userInfo.style.display = 'flex';
            userName.textContent = `Hola, ${data.usuario.nombre}`;
        } else {
            navAuth.style.display = 'flex';
            userInfo.style.display = 'none';
            userName.textContent = '';
        }
    }

    (async function checkAuthStatus() {
        try {
            const data = await fetchAPI('/api/auth/check');
            // Actualizar flag global para que otras funciones lo consulten
            window.isUserAuthenticated = !!data.autenticado;
            updateAuthUI(data);
            if (data.autenticado) {
                loadCart();
            }
        } catch (error) {
            console.log('Usuario no autenticado.');
            window.isUserAuthenticated = false;
            updateAuthUI({ autenticado: false });
        }
    })();
    
    // chintrolas validar elementos antes de agregar listeners -bynd
    const btnShowLogin = document.getElementById('btn-show-login');
    const btnCloseLogin = document.getElementById('btn-close-login');
    const switchToRegister = document.getElementById('switch-to-register');
    const btnShowRegister = document.getElementById('btn-show-register');
    const btnCloseRegister = document.getElementById('btn-close-register');
    const switchToLogin = document.getElementById('switch-to-login');
    const btnLogout = document.getElementById('btn-logout');
    
    // Función para pedir login (con o sin mensaje de advertencia)
    window.requestLogin = function(mensajeAdvertencia = null) {
        const modal = document.getElementById('role-modal');
        const alertBox = document.getElementById('purchase-alert');
        
        if (modal) {
            // Si hay mensaje (intento de compra), mostramos la alerta amarilla
            if (mensajeAdvertencia && alertBox) {
                alertBox.style.display = 'block';
                alertBox.textContent = mensajeAdvertencia;
            } else if (alertBox) {
                // Si es login normal (clic en botón), ocultamos la alerta
                alertBox.style.display = 'none';
            }
    
            // Mostrar el modal
            modal.style.display = 'flex';
            setTimeout(() => modal.classList.add('active'), 10);
            document.body.style.overflow = 'hidden';
        }
    };

    if (btnShowLogin) { // O el ID que estés usando para el botón del header
        btnShowLogin.addEventListener('click', () => window.requestLogin(null));
    }
    if (btnCloseLogin) btnCloseLogin.addEventListener('click', () => closeModal(loginModal));
    if (switchToRegister) {
        switchToRegister.addEventListener('click', () => { 
            closeModal(loginModal); 
            openModal(registerModal); 
        });
    }
    if (btnShowRegister) btnShowRegister.addEventListener('click', () => openModal(registerModal));
    if (btnCloseRegister) btnCloseRegister.addEventListener('click', () => closeModal(registerModal));
    if (switchToLogin) {
        switchToLogin.addEventListener('click', () => { 
            closeModal(registerModal); 
            openModal(loginModal); 
        });
    }
    if (loginModal) loginModal.addEventListener('click', (e) => e.target === loginModal && closeModal(loginModal));
    if (registerModal) registerModal.addEventListener('click', (e) => e.target === registerModal && closeModal(registerModal));

    // ey validar formularios antes de agregar listeners -bynd
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (loginError) loginError.style.display = 'none';
            
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Iniciando sesión...';
            }
            
            try {
                const emailInput = document.getElementById('login-email');
                const passwordInput = document.getElementById('login-password');
                
                if (!emailInput || !passwordInput) {
                    throw new Error('Campos de formulario no encontrados');
                }
                
                const data = await fetchAPI('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        email: emailInput.value, 
                        password: passwordInput.value 
                    })
                });
                showAlert(`¡Bienvenido, ${data.usuario.nombre}!`, 'success');
                setTimeout(() => window.location.reload(), 1000);
            } catch (error) {
                if (loginError) {
                    loginError.textContent = error.message;
                    loginError.style.display = 'block';
                }
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Iniciar Sesión';
                }
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (registerError) registerError.style.display = 'none';
            
            const submitBtn = registerForm.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Creando cuenta...';
            }
            
            try {
                const nombreInput = document.getElementById('register-nombre');
                const emailInput = document.getElementById('register-email');
                const passwordInput = document.getElementById('register-password');
                
                if (!nombreInput || !emailInput || !passwordInput) {
                    throw new Error('Campos de formulario no encontrados');
                }
                
                const data = await fetchAPI('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        nombre: nombreInput.value,
                        email: emailInput.value,
                        password: passwordInput.value
                    })
                });
                showAlert(`¡Registro exitoso, ${data.usuario.nombre}!`, 'success');
                setTimeout(() => window.location.reload(), 1000);
            } catch (error) {
                if (registerError) {
                    registerError.textContent = error.message;
                    registerError.style.display = 'block';
                }
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Crear Cuenta';
                }
            }
        });
    }

    if (btnLogout) {
        btnLogout.addEventListener('click', async () => {
            try {
                await fetchAPI('/api/auth/logout', { method: 'POST' });
                showAlert('Sesión cerrada.', 'info');
                setTimeout(() => window.location.reload(), 1000);
            } catch (error) { 
                showAlert(`Error: ${error.message}`, 'danger'); 
            }
        });
    }

    function openCart() {
        cartOverlay.style.display = 'block';
        setTimeout(() => cartOverlay.classList.add('active'), 10);
        document.body.style.overflow = 'hidden';
    }

    function closeCart() {
        cartOverlay.classList.remove('active');
        setTimeout(() => {
            cartOverlay.style.display = 'none';
            document.body.style.overflow = 'auto';
        }, 300);
    }

    // aaa validar que los elementos existan antes de agregar listeners -bynd
    const btnCart = document.getElementById('btn-show-cart');
    const btnCloseCart = document.getElementById('btn-close-cart');
    
    if (btnCart) {
        btnCart.addEventListener('click', openCart);
    } else {
        log.warn('Botón #btn-cart no encontrado');
    }
    
    if (btnCloseCart) {
        btnCloseCart.addEventListener('click', closeCart);
    }
    
    if (cartOverlay) {
        cartOverlay.addEventListener('click', (e) => {
            if (e.target === cartOverlay) closeCart();
        });
    }

    async function loadCart() {
        // Obtenemos los elementos aquí dentro para asegurar que existen
        const cartBody = document.getElementById('cart-body');
        const cartFooter = document.getElementById('cart-footer');
        const cartSubtotal = document.getElementById('cart-subtotal');
        const cartCountBubble = document.getElementById('cart-count-bubble');

        if (!cartBody) return; // Protección si no existe el carrito en el HTML

        try {
            // Agregamos un timestamp (?t=...) para evitar que el navegador guarde caché
            const data = await fetchAPI(`/api/cliente/carrito?t=${Date.now()}`, {
                headers: { 'Cache-Control': 'no-cache' }
            });
            
            console.log('📦 Datos del carrito recibidos:', data); // Para depurar

            if (!data.items || data.items.length === 0) {
                cartBody.innerHTML = '<p class="cart-empty">Tu carrito está vacío.</p>';
                if(cartFooter) cartFooter.style.display = 'none';
                if(cartCountBubble) cartCountBubble.style.display = 'none';
                return;
            }

            cartBody.innerHTML = '';
            let total = 0;
            let itemCount = 0;

            data.items.forEach(item => {
                // Mapear producto asegurando que existan los datos
                const prod = item.producto || item; 
                const nombre = prod.name_prod || prod.nombre || 'Producto';
                const img = prod.imagen_url || 'https://via.placeholder.com/60';
                const cantidad = item.cantidad || 1;
                const precioUnitario = parseFloat(prod.costo_uni || prod.precio || 0);
                const subtotal = precioUnitario * cantidad;
                
                total += subtotal;
                itemCount += cantidad;

                const itemEl = document.createElement('div');
                itemEl.className = 'cart-item';
                itemEl.innerHTML = `
                    <img src="${img}" alt="${nombre}" class="cart-item-img">
                    <div class="cart-item-details">
                        <h4>${nombre}</h4>
                        <p class="cart-item-price">$${precioUnitario.toFixed(2)}</p>
                        <div class="cart-item-actions">
                            <div class="qty-control small">
                                <button class="btn-qty btn-qty-decrease" data-item-id="${item.id}">-</button>
                                <span class="qty-input">${cantidad}</span>
                                <button class="btn-qty btn-qty-increase" data-item-id="${item.id}" data-producto-id="${prod.id || prod.id_producto}">+</button>
                            </div>
                            <button class="btn-remove btn-cart-remove" data-item-id="${item.id}">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                            </button>
                        </div>
                    </div>
                `;
                cartBody.appendChild(itemEl);
            });

            if (cartSubtotal) cartSubtotal.textContent = `$${total.toFixed(2)}`;
            if (cartFooter) cartFooter.style.display = 'block';
            
            if (cartCountBubble) {
                cartCountBubble.textContent = itemCount;
                cartCountBubble.style.display = 'flex';
            }

            // Reasignar eventos a los nuevos botones generados
            attachCartEvents(); 

        } catch (error) {
            console.error('Error al cargar carrito:', error);
            cartBody.innerHTML = '<p class="cart-empty">Error al cargar el carrito.</p>';
            if(cartFooter) cartFooter.style.display = 'none';
        }
    }

    // Función auxiliar para reasignar eventos (ponla justo debajo de loadCart)
    function attachCartEvents() {
        document.querySelectorAll('.btn-qty-increase').forEach(btn => {
            btn.onclick = async (e) => {
                e.preventDefault(); 
                const productoId = e.currentTarget.dataset.productoId;
                try {
                    await fetchAPI('/api/cliente/carrito/agregar', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ producto_id: productoId, cantidad: 1 })
                    });
                    loadCart(); 
                } catch (err) { console.error(err); }
            };
        });

        document.querySelectorAll('.btn-qty-decrease').forEach(btn => {
            btn.onclick = async (e) => {
                e.preventDefault();
                const itemId = e.currentTarget.dataset.itemId;
                try {
                    await fetchAPI(`/api/cliente/carrito/${itemId}/decrementar`, { method: 'PUT' });
                    loadCart();
                } catch (err) { console.error(err); }
            };
        });

        document.querySelectorAll('.btn-cart-remove').forEach(btn => {
            btn.onclick = async (e) => {
                e.preventDefault();
                const itemId = e.currentTarget.dataset.itemId;
                try {
                    await fetchAPI(`/api/cliente/carrito/${itemId}`, { method: 'DELETE' });
                    loadCart();
                } catch (err) { console.error(err); }
            };
        });
    }

    window.loadCart = loadCart;

    // ==========================================
    // LÓGICA DE PAGO (CHECKOUT)
    // ==========================================
    // NOTA: La variable checkoutForm ya está declarada al inicio del script.

    if (checkoutForm) {
        // Reemplazamos el submit normal para hacerlo más bonito con SweetAlert
        checkoutForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Validar campos básicos
            const direccionInput = document.getElementById('direccionEnvio');
            const direccion = direccionInput ? direccionInput.value.trim() : '';

            // 1. Verificar si el carrito está vacío (usando el contador del carrito)
            // Assuming cartCountBubble holds the number of items
            if (cartCountBubble && parseInt(cartCountBubble.textContent) === 0) {
                await Swal.fire({
                    title: 'Tu carrito está vacío',
                    text: 'Agrega algunos productos antes de pagar.',
                    icon: 'info',
                    confirmButtonColor: '#3498db'
                });
                return;
            }

            if(!direccion) {
                await Swal.fire('Falta información', 'Por favor ingresa una dirección de envío', 'warning');
                return;
            }

            // Simulación de proceso
            const btnSubmit = checkoutForm.querySelector('button[type="submit"]');
            const textoOriginal = btnSubmit.innerHTML; // Usar innerHTML para mantener iconos
            
            btnSubmit.disabled = true;
            btnSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...'; // SweetAlert2 often requires Font Awesome for spinner

            // Esperar 2 segundos simulando conexión con banco
            await new Promise(r => setTimeout(r, 2000));

            // Simular llamada a la API de pedido real
            try {
                const metodoPagoInput = document.querySelector('input[name="metodoPago"]:checked');
                const metodoPago = metodoPagoInput ? metodoPagoInput.value : 'tarjeta'; // Default to tarjeta

                const resultado = await fetchAPI('/api/cliente/pedido', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        metodoPago: metodoPago,
                        direccionEnvio: direccion
                    })
                });

                // ¡Éxito!
                closeCart(); // Cerrar carrito (using existing closeCart function)
                
                // Lluvia masiva de confeti
                var duration = 3 * 1000;
                var animationEnd = Date.now() + duration;
                var defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

                function randomInRange(min, max) { return Math.random() * (max - min) + min; }

                var interval = setInterval(function() {
                    var timeLeft = animationEnd - Date.now();
                    if (timeLeft <= 0) {
                        return clearInterval(interval);
                    }
                    var particleCount = 50 * (timeLeft / duration);
                    // since particles fall down, skew to the right to have them make a nice arc
                    confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
                    confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
                }, 250);

                await Swal.fire({
                    title: '¡Pedido Exitoso!',
                    text: `Gracias por tu compra. Tu pedido #${resultado.pedido.id} llegará a: ${direccion}`,
                    icon: 'success',
                    confirmButtonColor: '#0056b3',
                    confirmButtonText: 'Genial',
                    backdrop: `
                        rgba(0,0,123,0.4)
                        url("https://media.giphy.com/media/26tOZ42Mg6pbTUPVS/giphy.gif")
                        left top
                        no-repeat
                    `
                });

                // Recargar para limpiar (o llamar a tu función de limpiar carrito)
                window.location.href = 'index.html'; // This will reload the page and thus clear the cart and reset UI.

            } catch (error) {
                // Manejo de errores de la API
                Swal.fire({
                    title: 'Error en el Pedido',
                    text: error.message || 'Hubo un problema al procesar tu pedido. Intenta nuevamente.',
                    icon: 'error',
                    confirmButtonColor: '#d33'
                });
                if (checkoutError) {
                    checkoutError.textContent = error.message;
                    checkoutError.style.display = 'block';
                }
            } finally {
                btnSubmit.disabled = false;
                btnSubmit.innerHTML = textoOriginal;
            }
        });
    }

    // q chidoteee cargar productos con mapeo de PostgreSQL -bynd
    (async function loadProducts() {
        if (!productList) return;
        
        try {
            const productos = await fetchAPI('/api/cliente/productos');
            
            if (productos.length === 0) {
                productList.innerHTML = '<p class="loading">No se encontraron productos.</p>';
                return;
            }
            
            productList.innerHTML = '';
            
            productos.forEach((prodRaw, index) => {
                // aaa mapear producto de PostgreSQL -bynd
                const prod = mapearProducto(prodRaw);
                
                const card = document.createElement('div');
                card.className = 'product-card animate-fadeInUp';
                card.style.animationDelay = `${index * 0.05}s`;
                
                const badgeHTML = Math.random() > 0.7 ? '<span class="badge badge-danger">-20%</span>' : '';
                
                // chintrolas convertir precio a número para evitar NaN -bynd
                const precioNumerico = parseFloat(prod.precio || 0);
                const precioFormateado = isNaN(precioNumerico) ? '0.00' : precioNumerico.toFixed(2);
                
                card.innerHTML = `
                    ${badgeHTML}
                    <img src="${prod.imagen_url || 'https://via.placeholder.com/250'}" alt="${prod.nombre}" class="product-card-image">
                    <h3>${prod.nombre}</h3>
                    <div class="price">$${precioFormateado}</div>
                    <div style="display:flex; gap:0.5rem; justify-content:center; margin-top:0.75rem;">
                        <a href="producto.html?id=${prod.id}" class="btn btn-secondary">
                            <span>Ver detalles</span>
                            <svg style="width: 16px; height: 16px;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M5 12h14M12 5l7 7-7 7"/>
                            </svg>
                        </a>
                        <button class="btn btn-primary btn-add-to-cart" data-product-id="${prod.id}">
                            <span>Agregar</span>
                        </button>
                    </div>
                `;
                productList.appendChild(card);

                // Agregar protección al botón "Agregar" para requerir autenticación
                const addBtn = card.querySelector('.btn-add-to-cart');
                if (addBtn) {
                    addBtn.addEventListener('click', async (e) => {
                        e.preventDefault();
                        // Llama a la nueva función global window.addToCart
                        await window.addToCart(prod.id, 1, addBtn);
                    });
                }
            });
            
        } catch (error) {
            productList.innerHTML = `<p class="loading">Error al cargar productos: ${error.message}</p>`;
        }
    })();

    const btnAccesibilidad = document.getElementById('btn-accesibilidad');

    if (btnAccesibilidad) {
        console.log('✅ Botón accesibilidad encontrado');
        
        const modoGuardado = localStorage.getItem('modo-accesible');
        console.log('Modo guardado:', modoGuardado);
        
        if (modoGuardado === 'true') {
            document.body.classList.add('high-contrast');
            console.log('✅ Modo alto contraste activado desde localStorage');
        }

        btnAccesibilidad.addEventListener('click', function() {
            console.log('🖱️ Click en botón accesibilidad');
            
            const isActive = document.body.classList.toggle('high-contrast');
            localStorage.setItem('modo-accesible', isActive);
            
            console.log('Estado actual:', isActive);
            
            const mensaje = isActive ? 
                'Modo de alto contraste activado ✅' : 
                'Modo de alto contraste desactivado ❌';
            
            showAlert(mensaje, 'info');
        });
    } else {
        console.error('❌ Botón accesibilidad NO encontrado');
    }

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    const header = document.getElementById('main-header');
    if (header) {
        let lastScroll = 0;
        
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            
            if (currentScroll > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
            
            lastScroll = currentScroll;
        });
    }

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    document.querySelectorAll('.animate-fadeInUp').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
        observer.observe(el);
    });

    const emailInputs = document.querySelectorAll('input[type="email"]');
    emailInputs.forEach(input => {
        input.addEventListener('blur', function() {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (this.value && !emailRegex.test(this.value)) {
                this.classList.add('error');
                this.classList.remove('success');
            } else if (this.value) {
                this.classList.add('success');
                this.classList.remove('error');
            }
        });
    });

    const passwordInputs = document.querySelectorAll('input[type="password"]');
    passwordInputs.forEach(input => {
        input.addEventListener('input', function() {
            if (this.value.length > 0 && this.value.length < 6) {
                this.classList.add('error');
                this.classList.remove('success');
            } else if (this.value.length >= 6) {
                this.classList.add('success');
                this.classList.remove('error');
            }
        });
    });

    function showLoading(element) {
        element.style.opacity = '0.6';
        element.style.pointerEvents = 'none';
    }

    function hideLoading(element) {
        element.style.opacity = '1';
        element.style.pointerEvents = 'auto';
    }

    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        console.log('Modo oscuro detectado en el sistema');
    }

    const hours = new Date().getHours();
    let greeting = 'Bienvenido';
    
    if (hours < 12) greeting = 'Buenos días';
    else if (hours < 19) greeting = 'Buenas tardes';
    else greeting = 'Buenas noches';

    console.log(`${greeting} a Farmacias tere`);
});

// ==========================================
// FUNCIONES PARA EFECTOS DEL CARRITO (Consolidado)
// ==========================================

// Función para animar el pequeño contador rojo del carrito
function animateCartIcon() {
    const cartCount = document.querySelector('.cart-count'); // This is cartCountBubble
    if (cartCount) {
        cartCount.classList.add('bump');
        cartCount.addEventListener('animationend', () => {
            cartCount.classList.remove('bump');
        }, { once: true });
    }
}

// Nueva función consolidada para manejar los efectos visuales al añadir al carrito
function handleAddToCartSuccessEffects() {
    // Lanzar confeti desde la esquina superior derecha
    if (typeof confetti === 'function') {
        confetti({
            particleCount: 60,
            spread: 50,
            origin: { y: 0.1, x: 0.9 }, // Origen cerca del icono del carrito (arriba a la derecha)
            colors: ['#3498db', '#2ecc71', '#f1c40f', '#e74c3c'],
            disableForReducedMotion: true
        });
    }
    // Animar el icono del carrito
    animateCartIcon();
}
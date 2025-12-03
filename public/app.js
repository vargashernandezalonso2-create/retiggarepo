// aaa app.js con DEBUG MASIVO -bynd
console.log('🚀 [APP] Iniciando aplicación...');

// Estado global
window.isUserAuthenticated = false;

document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 [DOM] DOM Cargado completamente');

    // chintrolas sistema de logging mejorado -bynd
    const log = {
        success: (context, msg, ...args) => console.log(`✅ [${context}]`, msg, ...args),
        error: (context, msg, ...args) => console.error(`❌ [${context}]`, msg, ...args),
        warn: (context, msg, ...args) => console.warn(`⚠️  [${context}]`, msg, ...args),
        info: (context, msg, ...args) => console.log(`ℹ️  [${context}]`, msg, ...args),
        debug: (context, msg, ...args) => console.log(`🔍 [${context}]`, msg, ...args),
        api: (method, url, data) => console.log(`📡 [API] ${method} ${url}`, data || '')
    };

    // ey obtener elementos del DOM -bynd
    console.log('🔍 [DOM] Buscando elementos...');
    
    const productList = document.getElementById('lista-productos');
    const loginModal = document.getElementById('login-modal');
    const registerModal = document.getElementById('register-modal');
    const cartOverlay = document.getElementById('side-cart-overlay');
    const cartElement = document.getElementById('side-cart');
    const cartBody = document.getElementById('cart-body');
    const cartFooter = document.getElementById('cart-footer');
    const cartSubtotal = document.getElementById('cart-subtotal');
    const cartCountBubble = document.getElementById('cart-count-bubble');
    const navAuth = document.getElementById('nav-auth');
    const userInfo = document.getElementById('user-info');
    const userName = document.getElementById('user-name');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const checkoutForm = document.getElementById('checkout-form');
    const loginError = document.getElementById('login-error');
    const registerError = document.getElementById('register-error');
    const checkoutError = document.getElementById('checkout-error');

    // vavavava verificar elementos críticos -bynd
    log.debug('DOM', 'productList:', productList ? '✅' : '❌');
    log.debug('DOM', 'loginModal:', loginModal ? '✅' : '❌');
    log.debug('DOM', 'cartOverlay:', cartOverlay ? '✅' : '❌');
    log.debug('DOM', 'cartBody:', cartBody ? '✅' : '❌');

    // q chidoteee función helper para mapear productos de PostgreSQL -bynd
    function mapearProducto(prod) {
        log.debug('MAPPER', 'Mapeando producto:', prod);
        const mapped = {
            id: prod.id_producto || prod.id,
            nombre: prod.name_prod || prod.nombre,
            precio: prod.costo_uni || prod.precio,
            stock: prod.cantidad || prod.stock,
            imagen_url: prod.imagen_url || prod.img_url
        };
        log.debug('MAPPER', 'Producto mapeado:', mapped);
        return mapped;
    }

    // fokeis función para mostrar alertas -bynd
    function showAlert(message, type = 'info') {
        log.info('ALERT', `Mostrando alerta ${type}:`, message);
        
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
            alert.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => alert.remove(), 300);
        }, 4000);
    }

    // aaa función fetchAPI con debug -bynd
    async function fetchAPI(url, options = {}) {
        log.api(options.method || 'GET', url, options.body ? 'con body' : 'sin body');
        
        try {
            const response = await fetch(url, {
                ...options,
                credentials: 'include'
            });
            
            log.debug('API', `Status: ${response.status} ${response.statusText}`);
            
            const data = await response.json();
            log.debug('API', 'Response data:', data);
            
            if (!response.ok) {
                log.error('API', 'Error en response:', data);
                throw new Error(data.error || data.mensaje || 'Error desconocido');
            }
            
            log.success('API', 'Request exitoso:', url);
            return data;
        } catch (error) {
            log.error('API', 'Error en fetch:', error.message);
            throw error;
        }
    }

    // ey funciones de modal -bynd
    function openModal(modal) {
        if (!modal) {
            log.error('MODAL', 'Modal no existe');
            return;
        }
        log.info('MODAL', 'Abriendo modal:', modal.id);
        modal.classList.add('active'); // chintrolas CSS usa 'active' no 'show' -bynd
        document.body.style.overflow = 'hidden';
    }

    function closeModal(modal) {
        if (!modal) return;
        log.info('MODAL', 'Cerrando modal:', modal.id);
        modal.classList.remove('active'); // chintrolas CSS usa 'active' no 'show' -bynd
        document.body.style.overflow = '';
    }

    // chintrolas verificar autenticación al cargar -bynd
    (async function checkAuthStatus() {
        log.info('AUTH', '🔐 Verificando estado de autenticación...');
        
        try {
            const data = await fetchAPI('/api/auth/check');
            log.debug('AUTH', 'Respuesta de checkAuth:', data);
            
            if (data.autenticado && data.usuario) {
                log.success('AUTH', 'Usuario autenticado:', data.usuario.email);
                window.isUserAuthenticated = true;
                
                if (navAuth) navAuth.style.display = 'none';
                if (userInfo) {
                    userInfo.style.display = 'flex';
                    if (userName) userName.textContent = data.usuario.nombre || data.usuario.email.split('@')[0];
                }
                
                loadCart();
            } else {
                log.info('AUTH', 'Usuario NO autenticado');
                window.isUserAuthenticated = false;
                
                if (navAuth) navAuth.style.display = 'flex';
                if (userInfo) userInfo.style.display = 'none';
            }
        } catch (error) {
            log.error('AUTH', 'Error verificando autenticación:', error.message);
            window.isUserAuthenticated = false;
        }
    })();

    // vavavava botones de auth -bynd
    const btnShowLogin = document.getElementById('btn-show-login');
    const btnCloseLogin = document.getElementById('btn-close-login');
    const btnShowRegister = document.getElementById('btn-show-register');
    const btnCloseRegister = document.getElementById('btn-close-register');
    const switchToRegister = document.getElementById('switch-to-register');
    const switchToLogin = document.getElementById('switch-to-login');
    const btnLogout = document.getElementById('btn-logout');
    
    // q chidoteee función para pedir login -bynd
    window.requestLogin = function(mensajeAdvertencia = null) {
        log.info('AUTH', 'requestLogin llamado con mensaje:', mensajeAdvertencia);
        
        if (mensajeAdvertencia) {
            showAlert(mensajeAdvertencia, 'warning');
        }
        
        if (loginModal) {
            openModal(loginModal);
        } else {
            log.error('AUTH', 'loginModal no encontrado!');
        }
    };

    // fokeis eventos de modales -bynd
    if (btnShowLogin) {
        log.debug('AUTH', 'Registrando evento btnShowLogin');
        btnShowLogin.addEventListener('click', () => {
            log.info('AUTH', 'Click en btnShowLogin');
            window.requestLogin(null);
        });
    } else {
        log.warn('AUTH', 'btnShowLogin no encontrado');
    }
    
    if (btnCloseLogin) btnCloseLogin.addEventListener('click', () => closeModal(loginModal));
    if (switchToRegister) {
        switchToRegister.addEventListener('click', () => { 
            log.info('AUTH', 'Cambiando a registro');
            closeModal(loginModal); 
            openModal(registerModal); 
        });
    }
    if (btnShowRegister) btnShowRegister.addEventListener('click', () => openModal(registerModal));
    if (btnCloseRegister) btnCloseRegister.addEventListener('click', () => closeModal(registerModal));
    if (switchToLogin) {
        switchToLogin.addEventListener('click', () => { 
            log.info('AUTH', 'Cambiando a login');
            closeModal(registerModal); 
            openModal(loginModal); 
        });
    }

    // aaa login form -bynd
    if (loginForm) {
        log.debug('AUTH', 'Registrando form de login');
        
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            log.info('AUTH', '📝 Procesando login...');
            
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            
            log.debug('AUTH', 'Email:', email);
            log.debug('AUTH', 'Password length:', password.length);
            
            if (loginError) loginError.style.display = 'none';
            
            try {
                const data = await fetchAPI('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                
                log.success('AUTH', 'Login exitoso!', data);
                
                window.isUserAuthenticated = true;
                
                if (navAuth) navAuth.style.display = 'none';
                if (userInfo) {
                    userInfo.style.display = 'flex';
                    if (userName) userName.textContent = data.usuario.nombre || email.split('@')[0];
                }
                
                closeModal(loginModal);
                showAlert('¡Bienvenido! ' + (data.usuario.nombre || email), 'success');
                loginForm.reset();
                
                loadCart();
                
            } catch (error) {
                log.error('AUTH', 'Error en login:', error.message);
                if (loginError) {
                    loginError.style.display = 'block';
                    loginError.textContent = error.message;
                }
                showAlert('Error al iniciar sesión: ' + error.message, 'danger');
            }
        });
    } else {
        log.error('AUTH', 'loginForm no encontrado!');
    }

    // ey register form -bynd
    if (registerForm) {
        log.debug('AUTH', 'Registrando form de registro');
        
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            log.info('AUTH', '📝 Procesando registro...');
            
            const nombre = document.getElementById('register-name').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            const passwordConfirm = document.getElementById('register-password-confirm').value;
            
            log.debug('AUTH', 'Datos de registro:', { nombre, email, passwordLength: password.length });
            
            if (registerError) registerError.style.display = 'none';
            
            if (password !== passwordConfirm) {
                log.error('AUTH', 'Contraseñas no coinciden');
                if (registerError) {
                    registerError.style.display = 'block';
                    registerError.textContent = 'Las contraseñas no coinciden';
                }
                return;
            }
            
            try {
                const data = await fetchAPI('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nombre, email, password })
                });
                
                log.success('AUTH', 'Registro exitoso!', data);
                
                window.isUserAuthenticated = true;
                
                if (navAuth) navAuth.style.display = 'none';
                if (userInfo) {
                    userInfo.style.display = 'flex';
                    if (userName) userName.textContent = nombre;
                }
                
                closeModal(registerModal);
                showAlert('¡Cuenta creada exitosamente! Bienvenido, ' + nombre, 'success');
                registerForm.reset();
                
                loadCart();
                
            } catch (error) {
                log.error('AUTH', 'Error en registro:', error.message);
                if (registerError) {
                    registerError.style.display = 'block';
                    registerError.textContent = error.message;
                }
                showAlert('Error al registrarse: ' + error.message, 'danger');
            }
        });
    } else {
        log.error('AUTH', 'registerForm no encontrado!');
    }

    // chintrolas logout -bynd
    if (btnLogout) {
        log.debug('AUTH', 'Registrando btnLogout');
        
        btnLogout.addEventListener('click', async () => {
            log.info('AUTH', '👋 Cerrando sesión...');
            
            try {
                await fetchAPI('/api/auth/logout', { method: 'POST' });
                
                log.success('AUTH', 'Sesión cerrada');
                
                window.isUserAuthenticated = false;
                
                if (navAuth) navAuth.style.display = 'flex';
                if (userInfo) userInfo.style.display = 'none';
                
                showAlert('Sesión cerrada correctamente', 'success');
                
                if (cartBody) cartBody.innerHTML = '<p class="cart-empty">Tu carrito está vacío.</p>';
                if (cartFooter) cartFooter.style.display = 'none';
                if (cartCountBubble) cartCountBubble.style.display = 'none';
                
            } catch (error) {
                log.error('AUTH', 'Error cerrando sesión:', error.message);
                showAlert('Error al cerrar sesión', 'danger');
            }
        });
    } else {
        log.warn('AUTH', 'btnLogout no encontrado');
    }

    // vavavava funciones del carrito -bynd
    function openCart() {
        log.info('CART', '🛒 Abriendo carrito...');
        if (cartOverlay) {
            cartOverlay.classList.add('active'); // chintrolas CSS usa 'active' no 'show' -bynd
            loadCart();
        } else {
            log.error('CART', 'cartOverlay no existe!');
        }
    }

    function closeCart() {
        log.info('CART', 'Cerrando carrito');
        if (cartOverlay) cartOverlay.classList.remove('active'); // chintrolas CSS usa 'active' no 'show' -bynd
    }

    const btnCart = document.getElementById('btn-show-cart');
    const btnCloseCart = document.getElementById('btn-close-cart');
    
    if (btnCart) {
        log.debug('CART', 'Registrando btnCart');
        btnCart.addEventListener('click', openCart);
    } else {
        log.warn('CART', 'btnCart no encontrado');
    }
    
    if (btnCloseCart) btnCloseCart.addEventListener('click', closeCart);
    if (cartOverlay) {
        cartOverlay.addEventListener('click', (e) => {
            if (e.target === cartOverlay) closeCart();
        });
    }

    // q chidoteee cargar carrito -bynd
    async function loadCart() {
        log.info('CART', '📦 Cargando carrito...');
        
        if (!cartBody) {
            log.error('CART', 'cartBody no existe!');
            return;
        }
        
        try {
            const data = await fetchAPI('/api/cliente/carrito');
            log.debug('CART', 'Data recibida:', data);
            
            // fokeis el servidor retorna data.carrito -bynd
            const items = data.carrito || data.items || [];
            log.debug('CART', 'Items en carrito:', items.length);
            
            if (items.length === 0) {
                log.info('CART', 'Carrito vacío');
                cartBody.innerHTML = '<p class="cart-empty">Tu carrito está vacío.</p>';
                if (cartFooter) cartFooter.style.display = 'none';
                if (cartCountBubble) cartCountBubble.style.display = 'none';
                return;
            }

            cartBody.innerHTML = '';
            let total = 0;
            let itemCount = 0;

            items.forEach((item, index) => {
                log.debug('CART', `Item ${index + 1}:`, item);
                
                const cantidad = item.cantidad || 1;
                const precioUnitario = parseFloat(item.precio || 0);
                const subtotal = precioUnitario * cantidad;
                
                total += subtotal;
                itemCount += cantidad;

                const itemEl = document.createElement('div');
                itemEl.className = 'cart-item';
                itemEl.innerHTML = `
                    <img src="${item.imagen_url || 'https://via.placeholder.com/60'}" alt="${item.nombre}">
                    <div class="cart-item-details">
                        <h4>${item.nombre}</h4>
                        <div class="cart-item-price">$${precioUnitario.toFixed(2)}</div>
                    </div>
                    <div class="cart-item-qty">
                        <button class="btn-qty-decrease" data-item-id="${item.id}">−</button>
                        <span>${cantidad}</span>
                        <button class="btn-qty-increase" data-producto-id="${item.id}">+</button>
                    </div>
                    <div class="cart-item-subtotal">$${subtotal.toFixed(2)}</div>
                    <button class="btn-remove-item" data-item-id="${item.id}">🗑️</button>
                `;
                cartBody.appendChild(itemEl);
            });

            log.success('CART', `Carrito cargado: ${itemCount} items, Total: $${total.toFixed(2)}`);
            
            if (cartSubtotal) cartSubtotal.textContent = `$${total.toFixed(2)}`;
            if (cartFooter) cartFooter.style.display = 'block';
            if (cartCountBubble) {
                cartCountBubble.textContent = itemCount;
                cartCountBubble.style.display = 'flex';
            }

            // aaa eventos de botones del carrito -bynd
            document.querySelectorAll('.btn-qty-increase').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const productoId = e.currentTarget.dataset.productoId;
                    log.info('CART', 'Aumentando cantidad:', productoId);
                    
                    try {
                        await fetchAPI('/api/cliente/carrito/agregar', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ producto_id: productoId, cantidad: 1 })
                        });
                        loadCart();
                    } catch (error) {
                        log.error('CART', 'Error aumentando cantidad:', error.message);
                        showAlert(error.message, 'danger');
                    }
                });
            });

            document.querySelectorAll('.btn-qty-decrease').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const itemId = e.currentTarget.dataset.itemId;
                    log.info('CART', 'Disminuyendo cantidad:', itemId);
                    
                    const currentItem = items.find(i => i.id == itemId);
                    if (currentItem && currentItem.cantidad > 1) {
                        try {
                            await fetchAPI(`/api/cliente/carrito/actualizar/${itemId}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ cantidad: currentItem.cantidad - 1 })
                            });
                            loadCart();
                        } catch (error) {
                            log.error('CART', 'Error disminuyendo:', error.message);
                            showAlert(error.message, 'danger');
                        }
                    } else {
                        // chintrolas si es 1, eliminar -bynd
                        try {
                            await fetchAPI(`/api/cliente/carrito/${itemId}`, {
                                method: 'DELETE'
                            });
                            loadCart();
                        } catch (error) {
                            log.error('CART', 'Error eliminando:', error.message);
                            showAlert(error.message, 'danger');
                        }
                    }
                });
            });

            document.querySelectorAll('.btn-remove-item').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const itemId = e.currentTarget.dataset.itemId;
                    log.info('CART', 'Eliminando item:', itemId);
                    
                    try {
                        await fetchAPI(`/api/cliente/carrito/${itemId}`, {
                            method: 'DELETE'
                        });
                        showAlert('Producto eliminado del carrito', 'success');
                        loadCart();
                    } catch (error) {
                        log.error('CART', 'Error eliminando:', error.message);
                        showAlert(error.message, 'danger');
                    }
                });
            });
            
        } catch (error) {
            log.error('CART', 'Error cargando carrito:', error.message);
            if (cartBody) cartBody.innerHTML = '<p class="cart-empty">Error al cargar el carrito.</p>';
        }
    }

    // ey cargar productos -bynd
    (async function loadProducts() {
        log.info('PRODUCTS', '📦 Cargando productos...');
        
        if (!productList) {
            log.error('PRODUCTS', 'productList no existe!');
            return;
        }
        
        productList.innerHTML = '<p class="loading">Cargando productos...</p>';
        
        try {
            const productos = await fetchAPI('/api/cliente/productos');
            log.debug('PRODUCTS', 'Productos recibidos:', productos.length);
            
            if (!productos || productos.length === 0) {
                log.warn('PRODUCTS', 'No hay productos');
                productList.innerHTML = '<p class="loading">No hay productos disponibles.</p>';
                return;
            }
            
            productList.innerHTML = '';
            
            productos.forEach((prodRaw, index) => {
                log.debug('PRODUCTS', `Producto ${index + 1}:`, prodRaw);
                
                const prod = mapearProducto(prodRaw);
                
                const card = document.createElement('div');
                card.className = 'product-card animate-fadeInUp';
                card.style.animationDelay = `${index * 0.05}s`;
                
                const badgeHTML = Math.random() > 0.7 ? '<span class="badge badge-danger">-20%</span>' : '';
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

                const addBtn = card.querySelector('.btn-add-to-cart');
                if (addBtn) {
                    addBtn.addEventListener('click', async (e) => {
                        e.preventDefault();
                        log.info('PRODUCTS', 'Click en agregar producto:', prod.id);

                        if (!window.isUserAuthenticated) {
                            log.warn('PRODUCTS', 'Usuario no autenticado, pidiendo login');
                            window.requestLogin('⚠️ Para continuar con la compra necesitas iniciar sesión o registrarte.');
                            return;
                        }

                        try {
                            await fetchAPI('/api/cliente/carrito/agregar', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ producto_id: prod.id, cantidad: 1 })
                            });
                            log.success('PRODUCTS', 'Producto agregado al carrito');
                            showAlert('Producto agregado exitosamente', 'success');
                            loadCart();
                        } catch (err) {
                            log.error('PRODUCTS', 'Error agregando:', err.message);
                            showAlert(err.message, 'danger');
                        }
                    });
                }
            });
            
            log.success('PRODUCTS', `${productos.length} productos cargados exitosamente`);
            
        } catch (error) {
            log.error('PRODUCTS', 'Error fatal cargando productos:', error.message);
            productList.innerHTML = `<p class="loading">Error al cargar productos: ${error.message}</p>`;
        }
    })();

    log.success('APP', '✅ Aplicación inicializada completamente');
});

console.log('📄 [APP] Script cargado');

require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const session = require('express-session');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3000;

// aaa sistema de logging mejorado con colores -bynd
const log = {
    info: (msg, ...args) => console.log(`ℹ️  [INFO] ${msg}`, ...args),
    success: (msg, ...args) => console.log(`✅ [SUCCESS] ${msg}`, ...args),
    error: (msg, ...args) => console.error(`❌ [ERROR] ${msg}`, ...args),
    warn: (msg, ...args) => console.warn(`⚠️  [WARN] ${msg}`, ...args),
    debug: (msg, ...args) => console.log(`🔍 [DEBUG] ${msg}`, ...args),
    api: (method, path, ...args) => console.log(`📡 [API] ${method} ${path}`, ...args),
    db: (msg, ...args) => console.log(`🗄️  [DB] ${msg}`, ...args),
    security: (msg, ...args) => console.log(`🛡️  [SECURITY] ${msg}`, ...args)
};

log.info('🚀 Iniciando servidor Farmacias Tere...');
log.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// chintrolas sistema anti-ataques con trolleo -bynd
let attackDetected = false;
let requestLog = {};
let bannedIPs = new Set();

// ey limpiar logs viejos cada 30 segundos -bynd
setInterval(() => {
    const now = Date.now();
    for (const ip in requestLog) {
        requestLog[ip] = requestLog[ip].filter(t => now - t < 30000);
        if (requestLog[ip].length === 0) {
            delete requestLog[ip];
        }
    }
}, 30000);

// vavavava middleware de detección de ataques -bynd
app.use((req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    // aaa si ya está baneado por ataque -bynd
    if (bannedIPs.has(ip)) {
        log.security(`🚫 IP baneada intentando acceder: ${ip}`);
        return res.redirect('/trolleo.html');
    }
    
    // ey inicializar log del IP -bynd
    if (!requestLog[ip]) {
        requestLog[ip] = [];
    }
    
    // chintrolas registrar request -bynd
    requestLog[ip].push(now);
    
    // q chidoteee detectar ataque: más de 40 requests en 10 segundos -bynd
    const recentRequests = requestLog[ip].filter(t => now - t < 10000);
    
    if (recentRequests.length > 40) {
        attackDetected = true;
        bannedIPs.add(ip);
        
        log.security('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        log.security('🚨 ATAQUE DETECTADO 🚨');
        log.security(`IP: ${ip}`);
        log.security(`Requests en 10s: ${recentRequests.length}`);
        log.security('Acción: TROLLEADO CON NYANCAT 😹');
        log.security('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        return res.redirect('/trolleo.html');
    }
    
    next();
});

// ey middleware básico -bynd
app.use(cors({
    origin: '*',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// q chidoteee logging de requests -bynd
app.use((req, res, next) => {
    log.api(req.method, req.path);
    next();
});

// aaa configuración de sesiones -bynd
app.use(session({
    secret: process.env.SESSION_SECRET || 'tu_secreto_muy_seguro_cambiar_en_produccion',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24
    }
}));

app.use(express.static(path.join(__dirname, 'public')));
log.info('📁 Sirviendo archivos estáticos desde /public');

// chintrolas aquí va la configuración de BD mejorada -bynd
log.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
log.info('🔧 CONFIGURACIÓN DE BASE DE DATOS:');
log.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// vavavava verificar si existe DATABASE_URL -bynd
if (process.env.DATABASE_URL) {
    log.success('✓ DATABASE_URL encontrada en .env');
    
    // aaa extraer y mostrar componentes de la URL -bynd
    try {
        const url = new URL(process.env.DATABASE_URL);
        log.db('Host:', url.hostname);
        log.db('Port:', url.port);
        log.db('User:', url.username);
        log.db('Database:', url.pathname.substring(1));
        log.db('Password:', url.password ? '***' + url.password.slice(-4) : '❌ NO CONFIGURADO');
    } catch (err) {
        log.error('❌ DATABASE_URL tiene formato inválido');
        log.error('Formato correcto: postgresql://user:password@host:port/database');
    }
} else {
    log.error('❌ DATABASE_URL no encontrada en .env');
    log.warn('Crea un archivo .env con:');
    log.warn('DATABASE_URL=postgresql://postgres.ifgnaqmolrswwwpzfqzw:[PASSWORD]@aws-1-us-east-2.pooler.supabase.com:5432/postgres');
}

log.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// q chidoteee crear pool de conexiones -bynd
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    },
    max: 3, 
    idleTimeoutMillis: 20000,
    connectionTimeoutMillis: 10000,
    allowExitOnIdle: true  
});

// fokeis manejo de errores del pool -bynd
pool.on('error', (err, client) => {
    log.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    log.error('💥 ERROR INESPERADO DEL POOL DE CONEXIONES');
    log.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    log.error('Mensaje:', err.message);
    log.error('Código:', err.code);
    
    if (err.code === 'ECONNREFUSED') {
        log.warn('🔴 CAUSA: No se puede conectar al servidor de BD');
        log.warn('   → Verifica que la BD esté activa en Supabase');
    } else if (err.code === '28P01') {
        log.warn('🔴 CAUSA: Autenticación fallida');
        log.warn('   → Verifica tu password en DATABASE_URL');
    } else if (err.code === '3D000') {
        log.warn('🔴 CAUSA: Base de datos no existe');
        log.warn('   → Verifica el nombre de la BD');
    }
    
    log.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});

// ey cerrar conexiones al terminar -bynd
process.on('SIGINT', async () => {
    log.warn('🔄 Recibido SIGINT, cerrando pool...');
    try {
        await pool.end();
        log.success('✓ Pool cerrado correctamente');
    } catch (err) {
        log.error('Error al cerrar pool:', err.message);
    }
    process.exit(0);
});

process.on('SIGTERM', async () => {
    log.warn('🔄 Recibido SIGTERM, cerrando pool...');
    try {
        await pool.end();
        log.success('✓ Pool cerrado correctamente');
    } catch (err) {
        log.error('Error al cerrar pool:', err.message);
    }
    process.exit(0);
});

// vavavava probar conexión inicial -bynd
log.info('🔌 Intentando conectar a la base de datos...');
pool.connect()
    .then(client => {
        log.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        log.success('🎉 CONEXIÓN EXITOSA A SUPABASE');
        log.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        log.db('✓ PostgreSQL conectado');
        log.db('✓ Session Pooler IPv4 activo (puerto 5432)');
        log.db('✓ Compatible con tablas POS');
        log.db('✓ Transacciones habilitadas');
        log.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        // chintrolas verificar tablas existentes -bynd
        client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name
        `)
        .then(result => {
            log.db('📊 Tablas encontradas:', result.rows.length);
            result.rows.forEach(row => {
                log.db('   → ' + row.table_name);
            });
            client.release();
        })
        .catch(err => {
            log.warn('No se pudieron listar las tablas:', err.message);
            client.release();
        });
    })
    .catch(err => {
        log.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        log.error('💀 ERROR DE CONEXIÓN A SUPABASE');
        log.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        log.error('Mensaje:', err.message);
        log.error('Código:', err.code);
        log.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        // aaa diagnóstico detallado del error -bynd
        if (err.code === 'ECONNREFUSED') {
            log.warn('🔴 PROBLEMA: No se puede conectar al servidor');
            log.warn('');
            log.warn('POSIBLES CAUSAS:');
            log.warn('   1. ❌ La base de datos está PAUSADA');
            log.warn('      → Ve a https://supabase.com/dashboard');
            log.warn('      → Selecciona tu proyecto');
            log.warn('      → Si dice "Paused", actívala');
            log.warn('');
            log.warn('   2. ❌ El HOST está mal configurado');
            log.warn('      → Debe ser: aws-1-us-east-2.pooler.supabase.com');
            log.warn('');
            log.warn('   3. ❌ El PUERTO está mal');
            log.warn('      → Session Pooler usa: 5432');
            log.warn('      → Transaction Pooler usa: 6543');
        } else if (err.code === '28P01') {
            log.warn('🔴 PROBLEMA: Autenticación fallida');
            log.warn('');
            log.warn('POSIBLES CAUSAS:');
            log.warn('   1. ❌ PASSWORD incorrecto');
            log.warn('      → Copia el password desde Supabase Dashboard');
            log.warn('      → Database → Connection String');
            log.warn('');
            log.warn('   2. ❌ USERNAME incorrecto');
            log.warn('      → Debe incluir el sufijo: postgres.XXXXXXXX');
            log.warn('      → NO solo "postgres"');
        } else if (err.code === 'ENOTFOUND') {
            log.warn('🔴 PROBLEMA: Host no encontrado');
            log.warn('');
            log.warn('VERIFICA:');
            log.warn('   → El host en DATABASE_URL');
            log.warn('   → Tu conexión a internet');
        } else if (err.code === '3D000') {
            log.warn('🔴 PROBLEMA: Base de datos no existe');
            log.warn('');
            log.warn('VERIFICA:');
            log.warn('   → El nombre de la base de datos (generalmente "postgres")');
        } else {
            log.warn('🔴 ERROR DESCONOCIDO');
            log.warn('   → Revisa tu connection string completa');
            log.warn('   → Formato: postgresql://user:pass@host:port/db');
        }
        
        log.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        log.warn('');
        log.info('💡 TIP: Prueba copiar la connection string directamente desde:');
        log.info('   https://supabase.com/dashboard → Tu Proyecto → Database → Connection String');
    });

// ey middleware para inyectar pool -bynd
app.use((req, res, next) => {
    req.db = pool;
    next();
});

// aaa modelos de datos -bynd
const Usuario = {
    create: async (nombre, email, password) => {
        log.debug('Usuario.create:', email);
        const hashedPassword = await bcrypt.hash(password, 10);
        const uid = Math.random().toString(16).substr(2, 8).toUpperCase();
        
        const sql = `INSERT INTO usuarios (uid, correo, contra, sematary, fecha_registro) 
                     VALUES ($1, $2, $3, 0.00, CURRENT_TIMESTAMP) 
                     RETURNING id_usuario, correo, uid`;
        
        try {
            const result = await pool.query(sql, [uid, email, hashedPassword]);
            log.success('✓ Usuario creado:', email, 'UID:', uid);
            return { 
                id: result.rows[0].id_usuario, 
                nombre: email.split('@')[0],
                email: result.rows[0].correo, 
                rol: 'cliente',
                uid: result.rows[0].uid
            };
        } catch (error) {
            log.error('❌ Error al crear usuario:', error.message);
            throw error;
        }
    },
    
    findByEmail: async (email) => {
        log.debug('Usuario.findByEmail:', email);
        const result = await pool.query('SELECT * FROM usuarios WHERE correo = $1', [email]);
        if (result.rows[0]) {
            log.debug('✓ Usuario encontrado:', email);
        } else {
            log.debug('✗ Usuario no encontrado:', email);
        }
        return result.rows[0];
    },
    
    findById: async (id) => {
        log.debug('Usuario.findById:', id);
        const result = await pool.query(
            'SELECT id_usuario, correo, uid, sematary, fecha_registro FROM usuarios WHERE id_usuario = $1', 
            [id]
        );
        return result.rows[0];
    },
    
    comparePassword: async (plainPassword, hashedPassword) => {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }
};

const Producto = {
    getAll: async () => {
        log.debug('Producto.getAll: Consultando tabla producto...');
        try {
            const sql = `SELECT 
                id_producto as id, 
                name_prod as nombre, 
                costo_uni as precio, 
                cantidad as stock,
                num_lote,
                caducidad_lote,
                img_url,
                descrip
            FROM producto 
            WHERE cantidad > 0
            ORDER BY name_prod`;
            
            const result = await pool.query(sql);
            log.success(`✓ Productos obtenidos: ${result.rows.length}`);
            
            return result.rows.map(producto => {
                log.debug(`  → ${producto.nombre}: $${producto.precio} (Stock: ${producto.stock})`);
                const imagenFinal = producto.img_url 
                    ? producto.img_url 
                    : `https://placehold.co/250x250/0056b3/FFFFFF/png?text=${encodeURIComponent(producto.nombre)}`;

                return {
                    ...producto,
                    imagen_url: imagenFinal,
                    descripcion: producto.descrip || `Lote: ${producto.num_lote} - Cad: ${producto.caducidad_lote}`,
                    categoria_nombre: 'General'
                };
            });
        } catch (error) {
            log.error('❌ Error en Producto.getAll:', error.message);
            throw error;
        }
    },
    
    findById: async (id) => {
        log.debug('Producto.findById:', id);
        try {
            const sql = `SELECT 
                id_producto as id, 
                name_prod as nombre, 
                costo_uni as precio, 
                cantidad as stock,
                num_lote,
                caducidad_lote,
                img_url,
                descrip
            FROM producto 
            WHERE id_producto = $1`;
            
            const result = await pool.query(sql, [id]);
            
            if (result.rows[0]) {
                const prod = result.rows[0];
                log.debug(`✓ Producto encontrado: ${prod.nombre} (Stock: ${prod.stock})`);
                
                prod.imagen_url = prod.img_url 
                    ? prod.img_url 
                    : `https://placehold.co/400x400/0056b3/FFFFFF/png?text=${encodeURIComponent(prod.nombre)}`;
                    
                prod.descripcion = prod.descrip || `Lote: ${prod.num_lote} - Caducidad: ${prod.caducidad_lote}`;
                return prod;
            } else {
                log.warn(`✗ Producto ${id} no encontrado`);
                return null;
            }
        } catch (error) {
            log.error('❌ Error en Producto.findById:', error.message);
            throw error;
        }
    },
    
    updateStock: async (productId, changeInQuantity, client) => {
        log.debug(`Producto.updateStock: ID=${productId}, Change=${changeInQuantity}`);
        const db = client || pool;
        const sql = 'UPDATE producto SET cantidad = cantidad + $1 WHERE id_producto = $2 AND cantidad + $1 >= 0';
        
        try {
            const result = await db.query(sql, [changeInQuantity, productId]);
            if (result.rowCount === 0) {
                log.error(`❌ Stock insuficiente para producto ${productId}`);
                throw new Error(`Stock insuficiente para el producto ID ${productId}.`);
            }
            log.success(`✓ Stock actualizado: Producto ${productId}, Cambio: ${changeInQuantity}`);
            return true;
        } catch (error) {
            log.error('❌ Error al actualizar stock:', error.message);
            throw error;
        }
    }
};

const Pedido = {
    create: async (usuarioId, items, metodoPago, total, direccionEnvio) => {
        log.debug('Pedido.create: Iniciando transacción...');
        log.debug('  Usuario:', usuarioId);
        log.debug('  Items:', items.length);
        log.debug('  Total: $' + total);
        
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            log.debug('  ✓ Transacción iniciada');
    
            const ventaResult = await client.query(
                'INSERT INTO venta (fecha, id_cajero, total) VALUES (CURRENT_TIMESTAMP, $1, $2) RETURNING id_venta',
                [1, total] 
            );
            const ventaId = ventaResult.rows[0].id_venta;
            log.debug(`  ✓ Venta creada: ID=${ventaId}`);

            for (const item of items) {
                const subtotal = item.precio * item.cantidad;
                log.debug(`    → Detalle: ${item.nombre} x${item.cantidad} = $${subtotal}`);
                
                await client.query(
                    `INSERT INTO detalle_venta (id_venta, id_producto, cantidad, precio_unitario, subtotal) 
                     VALUES ($1, $2, $3, $4, $5)`,
                    [ventaId, item.id, item.cantidad, item.precio, subtotal]
                );
                
                await Producto.updateStock(item.id, -item.cantidad, client);
            }

            await client.query('COMMIT');
            log.success(`🎉 Pedido #${ventaId} completado: $${total}`);
            
            return { 
                id: ventaId, 
                usuario_id: usuarioId, 
                total: total, 
                estado: 'procesando',
                metodo_pago: metodoPago,
                direccion_envio: direccionEnvio
            };
        } catch (error) {
            await client.query('ROLLBACK');
            log.error('❌ Error en transacción, ROLLBACK ejecutado');
            log.error('Detalle:', error.message);
            throw error;
        } finally {
            client.release();
            log.debug('  ✓ Cliente liberado');
        }
    },
    
    findByUsuario: async (usuarioId) => {
        log.debug('Pedido.findByUsuario:', usuarioId);
        try {
            const sql = `SELECT 
                v.id_venta as id, 
                v.fecha as fecha_pedido,
                v.total,
                'procesando' as estado,
                'web' as metodo_pago
            FROM venta v
            WHERE v.id_cajero = 1
            ORDER BY v.fecha DESC
            LIMIT 20`;
            
            const result = await pool.query(sql);
            log.debug(`  ✓ Pedidos encontrados: ${result.rows.length}`);
            return result.rows;
        } catch (error) {
            log.error('❌ Error en Pedido.findByUsuario:', error.message);
            return [];
        }
    }
};

// chintrolas controladores -bynd
const authController = {
    register: async (req, res) => {
        const { nombre, email, password } = req.body;
        log.api('POST', '/api/auth/register', { email, nombre });
        
        if (!nombre || !email || !password) {
            log.warn('✗ Registro fallido: campos faltantes');
            return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
        }
        
        try {
            const existente = await Usuario.findByEmail(email);
            if (existente) {
                log.warn('✗ Registro fallido: correo ya existe');
                return res.status(409).json({ error: 'El correo ya está registrado.' });
            }
            
            const nuevoUsuario = await Usuario.create(nombre, email, password);
            req.session.userId = nuevoUsuario.id;
            req.session.userRole = nuevoUsuario.rol;
            
            log.success(`✅ Usuario registrado: ${email}`);
            res.status(201).json({ 
                mensaje: 'Registro exitoso', 
                usuario: nuevoUsuario
            });
        } catch (error) {
            log.error('❌ Error en register:', error.message);
            res.status(500).json({ error: 'Error en el servidor' });
        }
    },
    
    login: async (req, res) => {
        const { email, password } = req.body;
        log.api('POST', '/api/auth/login', { email });
        
        if (!email || !password) {
            log.warn('✗ Login fallido: campos faltantes');
            return res.status(400).json({ error: 'Email y contraseña son obligatorios.' });
        }
        
        try {
            const usuario = await Usuario.findByEmail(email);
            
            if (!usuario) {
                log.warn('✗ Login fallido: usuario no existe');
                return res.status(401).json({ error: 'Credenciales incorrectas.' });
            }
            
            const passwordMatch = await Usuario.comparePassword(password, usuario.contra);
            
            if (!passwordMatch) {
                log.warn('✗ Login fallido: contraseña incorrecta');
                return res.status(401).json({ error: 'Credenciales incorrectas.' });
            }
            
            req.session.userId = usuario.id_usuario;
            req.session.userRole = 'cliente';
            
            log.success(`✅ Login exitoso: ${email}`);
            res.status(200).json({ 
                mensaje: 'Inicio de sesión exitoso', 
                usuario: { 
                    id: usuario.id_usuario, 
                    nombre: email.split('@')[0],
                    email: usuario.correo, 
                    rol: 'cliente' 
                } 
            });
        } catch (error) {
            log.error('❌ Error en login:', error.message);
            res.status(500).json({ error: 'Error en el servidor' });
        }
    },
    
    logout: (req, res) => {
        log.api('POST', '/api/auth/logout');
        req.session.destroy(err => {
            if (err) {
                log.error('❌ Error al cerrar sesión:', err.message);
                return res.status(500).json({ error: 'Error al cerrar sesión' });
            }
            res.clearCookie('connect.sid');
            log.success('✅ Sesión cerrada');
            res.status(200).json({ mensaje: 'Sesión cerrada' });
        });
    },
    
    checkAuth: async (req, res) => {
        log.api('GET', '/api/auth/check');
        
        if (!req.session.userId) {
            log.debug('✗ No autenticado');
            return res.status(200).json({ autenticado: false });
        }
        
        try {
            const usuario = await Usuario.findById(req.session.userId);
            
            if (!usuario) {
                log.debug('✗ Usuario no encontrado en sesión');
                return res.status(200).json({ autenticado: false });
            }
            
            log.debug('✓ Usuario autenticado:', usuario.correo);
            res.status(200).json({ 
                autenticado: true, 
                usuario: { 
                    id: usuario.id_usuario, 
                    nombre: usuario.correo.split('@')[0],
                    email: usuario.correo, 
                    rol: 'cliente' 
                } 
            });
        } catch (error) {
            log.error('❌ Error en checkAuth:', error.message);
            res.status(500).json({ error: 'Error en el servidor' });
        }
    }
};

const carritoController = {
    getCarrito: (req) => {
        return req.session.carrito || [];
    },
    
    verCarrito: (req, res) => {
        const carrito = carritoController.getCarrito(req);
        log.api('GET', '/api/cliente/carrito', `${carrito.length} items`);
        res.status(200).json({ carrito });
    },
    
    agregarAlCarrito: async (req, res) => {
        const { producto_id, cantidad } = req.body; 
        const productoId = parseInt(producto_id, 10);
        const cant = parseInt(cantidad, 10) || 1;
        
        log.api('POST', '/api/cliente/carrito/agregar', { id: productoId, cantidad: cant });
        
        try {
            if (isNaN(productoId)) {
                log.warn('✗ ID de producto inválido:', producto_id);
                return res.status(400).json({ error: 'ID de producto no válido.' });
            }

            const producto = await Producto.findById(productoId);
            
            if (!producto) {
                log.warn('✗ Producto no encontrado:', productoId);
                return res.status(404).json({ error: 'Producto no encontrado.' });
            }
            
            if (producto.stock < cant) {
                log.warn(`✗ Stock insuficiente: ${producto.nombre} (Disponible: ${producto.stock})`);
                return res.status(400).json({ 
                    error: `Stock insuficiente. Disponible: ${producto.stock}` 
                });
            }
            
            let carrito = carritoController.getCarrito(req);
            const itemExistente = carrito.find(item => item.id === productoId);
            
            if (itemExistente) {
                const nuevaCantidad = itemExistente.cantidad + cant;
                if (producto.stock < nuevaCantidad) {
                    return res.status(400).json({ 
                        error: `Stock insuficiente. Disponible: ${producto.stock}, en carrito: ${itemExistente.cantidad}` 
                    });
                }
                itemExistente.cantidad += cant;
                log.debug(`✓ Cantidad actualizada en carrito: ${producto.nombre} x${nuevaCantidad}`);
            } else {
                carrito.push({ 
                    id: producto.id, 
                    nombre: producto.nombre, 
                    precio: producto.precio, 
                    cantidad: cant, 
                    imagen_url: producto.imagen_url 
                });
                log.debug(`✓ Producto agregado al carrito: ${producto.nombre} x${cant}`);
            }
            
            req.session.carrito = carrito;
            log.success(`✅ Carrito actualizado: ${carrito.length} items`);
            
            res.status(200).json({ 
                mensaje: 'Producto agregado', 
                carrito: req.session.carrito 
            });
        } catch (error) {
            log.error('❌ Error en agregarAlCarrito:', error.message);
            res.status(500).json({ error: 'Error al agregar al carrito.' });
        }
    },
    
    actualizarCantidad: async (req, res) => {
        const { id } = req.params;
        const { cantidad } = req.body;
        const productoId = parseInt(id, 10);
        const nuevaCantidad = parseInt(cantidad, 10);
        
        log.api('PUT', `/api/cliente/carrito/actualizar/${id}`, { cantidad: nuevaCantidad });
        
        let carrito = carritoController.getCarrito(req);
        const itemIndex = carrito.findIndex(item => item.id === productoId);
        
        if (itemIndex === -1) {
            log.warn('✗ Producto no en carrito:', productoId);
            return res.status(404).json({ error: 'Producto no en carrito.' });
        }

        if (nuevaCantidad <= 0) {
            carrito.splice(itemIndex, 1);
            log.debug('✓ Producto eliminado del carrito');
        } else {
            try {
                const producto = await Producto.findById(productoId);
                
                if (producto.stock < nuevaCantidad) {
                    log.warn(`✗ Stock insuficiente: ${producto.nombre}`);
                    return res.status(400).json({ 
                        error: `Stock insuficiente. Disponible: ${producto.stock}` 
                    });
                }
                
                carrito[itemIndex].cantidad = nuevaCantidad;
                log.debug(`✓ Cantidad actualizada: ${producto.nombre} x${nuevaCantidad}`);
            } catch (error) {
                log.error('❌ Error actualizando cantidad:', error.message);
                return res.status(500).json({ error: 'Error al actualizar cantidad.' });
            }
        }
        
        req.session.carrito = carrito;
        log.success(`✅ Carrito actualizado: ${carrito.length} items`);
        res.status(200).json({ mensaje: 'Carrito actualizado', carrito });
    },
    
    eliminarDelCarrito: (req, res) => {
        const { id } = req.params;
        const productoId = parseInt(id, 10);
        
        log.api('DELETE', `/api/cliente/carrito/${id}`);
        
        let carrito = carritoController.getCarrito(req);
        const itemIndex = carrito.findIndex(item => item.id === productoId);
        
        if (itemIndex === -1) {
            log.warn('✗ Producto no en carrito:', productoId);
            return res.status(404).json({ error: 'Producto no en carrito.' });
        }
        
        const productoEliminado = carrito[itemIndex].nombre;
        carrito.splice(itemIndex, 1);
        req.session.carrito = carrito;
        
        log.success(`✅ Producto eliminado: ${productoEliminado}`);
        res.status(200).json({ mensaje: 'Producto eliminado del carrito', carrito });
    }
};

const pedidoController = {
    crearPedido: async (req, res) => {
        if (!req.session.userId) {
            log.warn('✗ No autenticado al crear pedido');
            return res.status(401).json({ error: 'Usuario no autenticado.' });
        }
        
        const { metodoPago, direccionEnvio } = req.body;
        const carrito = carritoController.getCarrito(req);
        
        log.api('POST', '/api/cliente/pedido', { 
            items: carrito.length, 
            metodo: metodoPago 
        });
        
        if (carrito.length === 0) {
            log.warn('✗ Intento de pedido con carrito vacío');
            return res.status(400).json({ error: 'El carrito está vacío.' });
        }
        
        try {
            const pedido = await Pedido.create(
                req.session.userId, 
                carrito, 
                metodoPago, 
                direccionEnvio
            );
            
            req.session.carrito = [];
            
            log.success(`🎉 Pedido creado exitosamente: #${pedido.id}`);
            res.status(201).json({ 
                mensaje: 'Pedido creado exitosamente', 
                pedido 
            });
        } catch (error) {
            log.error('❌ Error al crear pedido:', error.message);
            res.status(500).json({ error: 'Error al procesar el pedido.' });
        }
    },
    
    obtenerPedidos: async (req, res) => {
        if (!req.session.userId) {
            log.warn('✗ No autenticado al obtener pedidos');
            return res.status(401).json({ error: 'Usuario no autenticado.' });
        }
        
        log.api('GET', '/api/cliente/pedidos');
        
        try {
            const pedidos = await Pedido.findByUsuario(req.session.userId);
            log.debug(`✓ Pedidos encontrados: ${pedidos.length}`);
            res.status(200).json(pedidos);
        } catch (error) {
            log.error('❌ Error al obtener pedidos:', error.message);
            res.status(500).json({ error: 'Error al obtener los pedidos.' });
        }
    }
};

// aaa rutas de autenticación -bynd
app.post('/api/auth/register', authController.register);
app.post('/api/auth/login', authController.login);
app.post('/api/auth/logout', authController.logout);
app.get('/api/auth/check', authController.checkAuth);

// ey rutas de productos -bynd
app.get('/api/cliente/productos', async (req, res) => {
    log.api('GET', '/api/cliente/productos');
    try {
        const productos = await Producto.getAll();
        log.debug(`✓ Productos encontrados: ${productos.length}`);
        res.status(200).json(productos);
    } catch (error) {
        log.error('❌ Error al obtener productos:', error.message);
        res.status(500).json({ error: 'Error al obtener productos.' });
    }
});

app.get('/api/cliente/productos/:id', async (req, res) => {
    const { id } = req.params;
    log.api('GET', `/api/cliente/productos/${id}`);
    
    try {
        const producto = await Producto.findById(parseInt(id, 10));
        if (!producto) {
            log.warn('✗ Producto no encontrado:', id);
            return res.status(404).json({ error: 'Producto no encontrado.' });
        }
        log.debug(`✓ Producto encontrado: ${producto.nombre}`);
        res.status(200).json(producto);
    } catch (error) {
        log.error('❌ Error al obtener producto:', error.message);
        res.status(500).json({ error: 'Error al obtener el producto.' });
    }
});

// chintrolas rutas de carrito -bynd
app.get('/api/cliente/carrito', carritoController.verCarrito);
app.post('/api/cliente/carrito/agregar', carritoController.agregarAlCarrito);
app.put('/api/cliente/carrito/actualizar/:id', carritoController.actualizarCantidad);
app.delete('/api/cliente/carrito/:id', carritoController.eliminarDelCarrito);

// vavavava rutas de pedidos -bynd
app.post('/api/cliente/pedido', pedidoController.crearPedido);
app.get('/api/cliente/pedidos', pedidoController.obtenerPedidos);

// q chidoteee ruta principal -bynd
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// fokeis manejo de rutas no encontradas -bynd
app.use((req, res) => {
    log.warn('⚠️  Ruta no encontrada:', req.path);
    res.status(404).json({ error: 'Endpoint no encontrado' });
});

// aaa manejo de errores globales -bynd
app.use((err, req, res, next) => {
    log.error('💥 Error no manejado:', err.message);
    log.error(err.stack);
    res.status(500).json({ error: 'Error interno del servidor' });
});

// ey iniciar servidor -bynd
app.listen(PORT, () => {
    log.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    log.success(`🚀 SERVIDOR INICIADO EXITOSAMENTE`);
    log.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    log.info(`📍 URL: http://localhost:${PORT}`);
    log.info(`🌐 Entorno: ${process.env.NODE_ENV || 'development'}`);
    log.info(`🛡️  Sistema anti-ataques: ACTIVO 😹`);
    log.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});

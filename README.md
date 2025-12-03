# 💊 Farmacias Tere - Sistema de E-Commerce

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)
![License](https://img.shields.io/badge/license-ISC-green.svg)
![PostgreSQL](https://img.shields.io/badge/database-PostgreSQL-blue.svg)
![Express](https://img.shields.io/badge/backend-Express-lightgrey.svg)

**Plataforma moderna de e-commerce para productos farmacéuticos con gestión integral de inventario, usuarios y pedidos.**

[Características](#-características-principales) •
[Instalación](#-instalación) •
[Configuración](#-configuración) •
[API](#-api-reference) •
[Arquitectura](#-arquitectura)

</div>

---

## 📋 Tabla de Contenidos

- [Características Principales](#-características-principales)
- [Tecnologías](#-tecnologías)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Uso](#-uso)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [API Reference](#-api-reference)
- [Arquitectura](#-arquitectura)
- [Seguridad](#-seguridad)
- [Variables de Entorno](#-variables-de-entorno)
- [Scripts Disponibles](#-scripts-disponibles)
- [Troubleshooting](#-troubleshooting)
- [Contribución](#-contribución)
- [Licencia](#-licencia)

---

## ✨ Características Principales

### 🛍️ **E-Commerce Completo**
- Catálogo de productos con búsqueda y filtros
- Carrito de compras en tiempo real
- Sistema de checkout integrado
- Gestión de pedidos y historial de compras

### 👥 **Gestión de Usuarios**
- Registro y autenticación segura con bcrypt
- Sesiones persistentes
- Perfiles de usuario
- Sistema de roles (cliente/admin)

### 📦 **Inventario Inteligente**
- Sincronización con sistema POS
- Control de stock en tiempo real
- Gestión de lotes y caducidades
- Alertas de stock bajo

### 🔒 **Seguridad Avanzada**
- Rate limiting inteligente
- Protección contra ataques DDoS
- Sanitización de inputs
- Sesiones cifradas
- CORS configurado

### 🎨 **Interfaz Moderna**
- Diseño responsive mobile-first
- Animaciones fluidas
- Sistema de notificaciones
- Experiencia de usuario optimizada

### 🤖 **Asistente Virtual**
- Chatbot médico integrado
- Consultas en tiempo real
- Recomendaciones personalizadas

### 📊 **Analíticas y Reportes**
- Dashboard de ventas
- Estadísticas de productos
- Métricas de usuarios
- Logs detallados

---

## 🛠 Tecnologías

### **Backend**
- **Node.js** (≥14.0.0) - Runtime de JavaScript
- **Express.js** (4.x) - Framework web minimalista
- **PostgreSQL** - Base de datos relacional
- **Supabase** - Backend as a Service
- **bcryptjs** - Hash de contraseñas
- **express-session** - Gestión de sesiones

### **Frontend**
- **HTML5** - Estructura semántica
- **CSS3** - Estilos modernos con variables CSS
- **JavaScript ES6+** - Lógica del cliente
- **SweetAlert2** - Modales elegantes
- **Canvas Confetti** - Efectos visuales
- **Leaflet.js** - Mapas interactivos

### **Base de Datos**
- **PostgreSQL 15+** - DBMS principal
- **Supabase Pooler** - Gestión de conexiones
- Esquema compatible con sistema POS existente

---

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** (v14 o superior)
  ```bash
  node --version  # Debe mostrar v14.x.x o superior
  ```

- **npm** (v6 o superior)
  ```bash
  npm --version
  ```

- **PostgreSQL** (v12 o superior) o cuenta de **Supabase**
  - [Crear cuenta en Supabase](https://supabase.com)

- **Git** (opcional, para clonar el repositorio)
  ```bash
  git --version
  ```

---

## 🚀 Instalación

### 1️⃣ Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/farmacias-tere.git
cd farmacias-tere
```

### 2️⃣ Instalar Dependencias

```bash
npm install
```

### 3️⃣ Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```bash
cp .env.example .env
```

Edita `.env` con tus credenciales:

```env
# Database Configuration
DATABASE_URL=postgresql://user:password@host:5432/database

# Session Configuration
SESSION_SECRET=tu_secreto_super_seguro_aqui

# Environment
NODE_ENV=development
PORT=3000
```

### 4️⃣ Configurar Base de Datos

#### **Opción A: Usar Supabase (Recomendado)**

1. Crea un proyecto en [Supabase](https://supabase.com/dashboard)
2. Ve a **Database → Connection String**
3. Copia la connection string con Session Pooler
4. Pégala en tu `.env` como `DATABASE_URL`

#### **Opción B: PostgreSQL Local**

```bash
# Crear base de datos
createdb farmacias_tere

# Importar schema
psql farmacias_tere < schema.sql
```

### 5️⃣ Iniciar el Servidor

```bash
# Desarrollo (con auto-reload)
npm run dev

# Producción
npm start
```

El servidor estará disponible en: **http://localhost:3000**

---

## ⚙️ Configuración

### Configuración de Base de Datos

El sistema utiliza las siguientes tablas principales:

- `usuarios` - Información de usuarios y autenticación
- `producto` - Catálogo de productos
- `venta` - Registro de ventas
- `detalle_venta` - Items de cada venta

### Configuración de Sesiones

```javascript
// server.js
session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 horas
    }
})
```

### Configuración de CORS

```javascript
cors({
    origin: '*', // Cambiar en producción
    credentials: true
})
```

---

## 💻 Uso

### Registro de Usuario

```bash
POST /api/auth/register
Content-Type: application/json

{
  "nombre": "Juan Pérez",
  "email": "juan@example.com",
  "password": "contraseña123"
}
```

### Inicio de Sesión

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "juan@example.com",
  "password": "contraseña123"
}
```

### Agregar al Carrito

```bash
POST /api/cliente/carrito/agregar
Content-Type: application/json

{
  "producto_id": 1,
  "cantidad": 2
}
```

### Realizar Pedido

```bash
POST /api/cliente/pedido
Content-Type: application/json

{
  "metodoPago": "tarjeta",
  "direccionEnvio": "Calle Principal #123"
}
```

---

## 📁 Estructura del Proyecto

```
farmacias-tere/
├── server.js                 # Servidor principal
├── anti-spam.js             # Sistema de seguridad
├── package.json             # Dependencias y scripts
├── .env                     # Variables de entorno (no incluido)
├── .gitignore              # Archivos ignorados por Git
├── README.md               # Este archivo
│
├── public/                 # Archivos estáticos
│   ├── index.html         # Página principal
│   ├── producto.html      # Vista de producto
│   ├── doctor-virtual.html # Asistente virtual
│   ├── style.css          # Estilos globales
│   ├── app.js            # Lógica principal del cliente
│   ├── carrito.js        # Sistema de carrito
│   ├── alerts.js         # Sistema de notificaciones
│   ├── doctor-virtual.js # IA del asistente
│   ├── yoshi-integration.js # Mascota animada
│   └── resources/        # Imágenes y assets
│       ├── logo-farmacia.png
│       ├── hero-farmacia.png
│       └── productos/    # Imágenes de productos
│
└── docs/                 # Documentación adicional
    ├── API.md           # Documentación de API
    ├── DATABASE.md      # Schema de base de datos
    └── DEPLOYMENT.md    # Guía de despliegue
```

---

## 📡 API Reference

### **Autenticación**

#### `POST /api/auth/register`
Registra un nuevo usuario.

**Request Body:**
```json
{
  "nombre": "string",
  "email": "string",
  "password": "string (min 6 caracteres)"
}
```

**Response:** `201 Created`
```json
{
  "mensaje": "Registro exitoso",
  "usuario": {
    "id": 1,
    "nombre": "Juan",
    "email": "juan@example.com",
    "rol": "cliente"
  }
}
```

#### `POST /api/auth/login`
Inicia sesión de usuario.

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:** `200 OK`
```json
{
  "mensaje": "Inicio de sesión exitoso",
  "usuario": { ... }
}
```

#### `POST /api/auth/logout`
Cierra la sesión actual.

**Response:** `200 OK`
```json
{
  "mensaje": "Sesión cerrada"
}
```

#### `GET /api/auth/check`
Verifica el estado de autenticación.

**Response:** `200 OK`
```json
{
  "autenticado": true,
  "usuario": { ... }
}
```

---

### **Productos**

#### `GET /api/cliente/productos`
Obtiene el catálogo completo de productos.

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "nombre": "Paracetamol 500mg",
    "precio": 45.50,
    "stock": 100,
    "imagen_url": "https://...",
    "descripcion": "Analgésico y antipirético",
    "categoria_nombre": "Analgésicos"
  }
]
```

#### `GET /api/cliente/productos/:id`
Obtiene detalles de un producto específico.

**Response:** `200 OK`
```json
{
  "id": 1,
  "nombre": "Paracetamol 500mg",
  "precio": 45.50,
  "stock": 100,
  "num_lote": "LOT123",
  "caducidad_lote": "2025-12-31",
  "imagen_url": "https://...",
  "descripcion": "..."
}
```

---

### **Carrito de Compras**

#### `GET /api/cliente/carrito`
Obtiene el contenido del carrito actual.

**Response:** `200 OK`
```json
{
  "carrito": [
    {
      "id": 1,
      "nombre": "Paracetamol 500mg",
      "precio": 45.50,
      "cantidad": 2,
      "imagen_url": "https://..."
    }
  ]
}
```

#### `POST /api/cliente/carrito/agregar`
Agrega un producto al carrito.

**Request Body:**
```json
{
  "producto_id": 1,
  "cantidad": 2
}
```

**Response:** `200 OK`
```json
{
  "mensaje": "Producto agregado",
  "carrito": [ ... ]
}
```

#### `PUT /api/cliente/carrito/actualizar/:id`
Actualiza la cantidad de un producto en el carrito.

**Request Body:**
```json
{
  "cantidad": 3
}
```

#### `DELETE /api/cliente/carrito/:id`
Elimina un producto del carrito.

**Response:** `200 OK`
```json
{
  "mensaje": "Producto eliminado del carrito",
  "carrito": [ ... ]
}
```

---

### **Pedidos**

#### `POST /api/cliente/pedido`
Crea un nuevo pedido con el contenido del carrito.

**Request Body:**
```json
{
  "metodoPago": "tarjeta|efectivo",
  "direccionEnvio": "Calle Principal #123, Col. Centro"
}
```

**Response:** `201 Created`
```json
{
  "mensaje": "Pedido creado exitosamente",
  "pedido": {
    "id": 42,
    "total": 189.50,
    "estado": "procesando",
    "metodo_pago": "tarjeta"
  }
}
```

#### `GET /api/cliente/pedidos`
Obtiene el historial de pedidos del usuario.

**Response:** `200 OK`
```json
[
  {
    "id": 42,
    "fecha_pedido": "2025-12-03T10:30:00Z",
    "total": 189.50,
    "estado": "procesando"
  }
]
```

---

### **Administración**

#### `GET /api/admin/security/stats`
Obtiene estadísticas del sistema de seguridad.

**Response:** `200 OK`
```json
{
  "bannedIPs": 3,
  "activeMonitoring": 5,
  "warnings": 1,
  "bannedIPsList": ["192.168.1.100"]
}
```

---

## 🏗 Arquitectura

### **Diagrama de Arquitectura**

```
┌─────────────────┐
│   Cliente Web   │
│  (HTML/CSS/JS)  │
└────────┬────────┘
         │
         │ HTTPS
         ▼
┌─────────────────┐
│  Express Server │
│   (Node.js)     │
├─────────────────┤
│ • Anti-Spam     │
│ • Auth          │
│ • Sessions      │
│ • API Routes    │
└────────┬────────┘
         │
         │ PostgreSQL Protocol
         ▼
┌─────────────────┐
│    Supabase     │
│  (PostgreSQL)   │
├─────────────────┤
│ • usuarios      │
│ • producto      │
│ • venta         │
│ • detalle_venta │
└─────────────────┘
```

### **Flujo de Datos**

```
1. Cliente → Request → Express Middleware
2. Anti-Spam → Validación de Rate Limit
3. Router → Controlador específico
4. Controlador → Modelo de datos
5. Modelo → Query a PostgreSQL/Supabase
6. PostgreSQL → Response data
7. Modelo → Procesamiento de datos
8. Controlador → JSON Response
9. Cliente → Actualización UI
```

### **Capas de la Aplicación**

```
┌──────────────────────────────┐
│     Presentación (UI)        │  ← HTML/CSS/JavaScript
├──────────────────────────────┤
│  Controladores (Controllers) │  ← Lógica de negocio
├──────────────────────────────┤
│    Modelos (Models)          │  ← Acceso a datos
├──────────────────────────────┤
│  Base de Datos (PostgreSQL)  │  ← Persistencia
└──────────────────────────────┘
```

---

## 🔒 Seguridad

### **Características de Seguridad Implementadas**

#### 🛡️ **Rate Limiting Inteligente**
- Detección automática de spam
- Límite: 50 requests/10 segundos por IP
- Bloqueo permanente de IPs maliciosas
- Persistencia de bans entre reinicios

#### 🔐 **Autenticación y Sesiones**
- Passwords hasheados con bcrypt (10 rounds)
- Sesiones cifradas con `express-session`
- Cookies con flag `httpOnly`
- Expiración automática de sesiones (24h)

#### 🚫 **Protección contra Ataques**
- CORS configurado
- Sanitización de inputs
- Validación de tipos de datos
- Protección SQL injection (prepared statements)
- XSS prevention

#### 📝 **Logging y Auditoría**
- Logs detallados con niveles
- Registro de accesos
- Tracking de IPs
- Alertas de seguridad

### **Mejores Prácticas**

```javascript
// ✅ HACER
- Usar variables de entorno para secretos
- Validar todos los inputs del usuario
- Usar HTTPS en producción
- Mantener dependencias actualizadas

// ❌ NO HACER
- Hardcodear credenciales
- Confiar en datos del cliente sin validar
- Usar passwords débiles
- Exponer información sensible en logs
```

---

## 🔧 Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```bash
# ==========================================
# DATABASE CONFIGURATION
# ==========================================
DATABASE_URL=postgresql://postgres.xxx:PASSWORD@host:5432/postgres

# ==========================================
# SESSION CONFIGURATION
# ==========================================
SESSION_SECRET=genera_un_secret_aleatorio_super_largo_y_seguro

# ==========================================
# SERVER CONFIGURATION
# ==========================================
NODE_ENV=development
PORT=3000

# ==========================================
# OPTIONAL: SUPABASE INDIVIDUAL PARAMS
# (Solo si no usas DATABASE_URL)
# ==========================================
SUPABASE_HOST=aws-1-us-east-2.pooler.supabase.com
SUPABASE_PORT=5432
SUPABASE_DB=postgres
SUPABASE_USER=postgres.xxx
SUPABASE_PASSWORD=tu_password
```

### **Generar SESSION_SECRET seguro:**

```bash
# Opción 1: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Opción 2: OpenSSL
openssl rand -hex 32

# Opción 3: Online
# https://randomkeygen.com/
```

---

## 📜 Scripts Disponibles

```bash
# Iniciar servidor en modo desarrollo (con auto-reload)
npm run dev

# Iniciar servidor en modo producción
npm start

# Ejecutar tests (si están configurados)
npm test

# Verificar conexión a base de datos
npm run test

# Limpiar node_modules y reinstalar
npm run clean-install
```

### **Scripts Adicionales**

```bash
# Desbanear todas las IPs
node unban.js all

# Desbanear IP específica
node unban.js 127.0.0.1

# Ver estadísticas de seguridad
curl http://localhost:3000/api/admin/security/stats
```

---

## 🐛 Troubleshooting

### **Error: ECONNREFUSED al conectar a base de datos**

**Problema:** No se puede conectar a PostgreSQL/Supabase

**Soluciones:**
```bash
# 1. Verificar que la base de datos esté activa
# En Supabase: Dashboard → tu proyecto → verificar estado

# 2. Verificar DATABASE_URL
echo $DATABASE_URL

# 3. Probar conexión manualmente
psql $DATABASE_URL
```

### **Error: Session secret not defined**

**Problema:** Falta `SESSION_SECRET` en `.env`

**Solución:**
```bash
# Generar y agregar al .env
echo "SESSION_SECRET=$(openssl rand -hex 32)" >> .env
```

### **Error: Port 3000 already in use**

**Problema:** El puerto 3000 ya está siendo usado

**Soluciones:**
```bash
# Opción 1: Usar otro puerto
PORT=3001 npm start

# Opción 2: Matar proceso en puerto 3000
lsof -ti:3000 | xargs kill -9

# Opción 3: Cambiar PORT en .env
PORT=3001
```

### **Error: Cannot find module 'anti-spam'**

**Problema:** Falta el archivo `anti-spam.js`

**Solución:**
```bash
# Verificar que anti-spam.js exista en la raíz
ls -la anti-spam.js

# Si no existe, copiarlo
cp /ruta/al/archivo/anti-spam.js .
```

### **Página en blanco / Error 404**

**Problema:** Archivos estáticos no se encuentran

**Solución:**
```bash
# Verificar estructura de public/
ls -la public/

# Debe contener: index.html, style.css, app.js, etc.
```

### **Me baneé a mí mismo**

**Problema:** Tu IP fue bloqueada por spam

**Solución:**
```bash
# Desbanear todas las IPs
node unban.js all

# O borrar el archivo
rm banned-ips.json
```

---

## 🤝 Contribución

Las contribuciones son bienvenidas. Para contribuir:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add: AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### **Guía de Estilo de Código**

```javascript
// Usar comentarios descriptivos
// aaa para secciones principales
// ey para funciones importantes
// chintrolas para casos especiales
// vavavava para flujos complejos

// Usar nombres descriptivos
const getUserById = (id) => { ... }

// Manejar errores apropiadamente
try {
    // código
} catch (error) {
    log.error('Error descriptivo:', error.message);
    // manejar error
}
```

---

## 📄 Licencia

Este proyecto está bajo la Licencia ISC.

```
Copyright (c) 2025 Farmacias Tere

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
```

---

## 📞 Contacto y Soporte

- **Email:** contacto@farmaciastere.com
- **Website:** https://farmaciastere.com
- **Ubicación:** Av. San Pablo Xalpa, Col. Reynosa Tamaulipas, CDMX

---

## 🙏 Agradecimientos

- **Supabase** - Por proporcionar una excelente plataforma de base de datos
- **Express.js** - Por el framework web robusto y flexible
- **Node.js Community** - Por las increíbles herramientas y librerías
- Todos los contribuidores que han ayudado a mejorar este proyecto

---

<div align="center">

**Hecho con ❤️ para mejorar el acceso a productos farmacéuticos**

⭐ Si este proyecto te fue útil, considera darle una estrella en GitHub

</div>

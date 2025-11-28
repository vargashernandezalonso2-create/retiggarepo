DROP TABLE IF EXISTS mcajero CASCADE;

CREATE TABLE mcajero (
  id_ca SERIAL PRIMARY KEY,
  nombre VARCHAR(60) NOT NULL,
  contra VARCHAR(20) NOT NULL,
  correo VARCHAR(255) NOT NULL
);

INSERT INTO mcajero (id_ca, nombre, contra, correo) VALUES 
(1, 'Pedro', '5678', 'foco@gmail.com');
SELECT setval('mcajero_id_ca_seq', (SELECT MAX(id_ca) FROM mcajero));

DROP TABLE IF EXISTS madmin CASCADE;

CREATE TABLE madmin (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  contra VARCHAR(60) NOT NULL,
  correo VARCHAR(100) NOT NULL UNIQUE
);

INSERT INTO madmin (id, nombre, contra, correo) VALUES 
(1, 'juan', '5', 'juan@example.com'),
(7, 'Juan', '1234', 'juan@a.com');

SELECT setval('madmin_id_seq', (SELECT MAX(id) FROM madmin));

DROP TABLE IF EXISTS producto CASCADE;

CREATE TABLE producto (
  id_producto BIGSERIAL PRIMARY KEY,
  name_prod VARCHAR(60) NOT NULL,
  num_lote VARCHAR(30) NOT NULL,
  caducidad_lote DATE NOT NULL,
  costo_uni DECIMAL(10,3) NOT NULL,
  cantidad INTEGER NOT NULL DEFAULT 0,
  imagen_url TEXT
);
INSERT INTO producto (id_producto, name_prod, num_lote, caducidad_lote, costo_uni, cantidad) VALUES 
(70847036043, 'WM', '343658', '2026-12-18', 37.000, 59),
(99575348617, 'dfssd', '333', '2045-07-13', 500.000, 0),
(400009655896, 'Curitas', '15530', '2025-07-10', 20.000, 0),
(7501199416533, 'Pegamento', '2222', '2025-07-14', 15.000, 1),
(7502309734745, 'Calvos', '333', '2430-07-24', 5.000, 8);

SELECT setval('producto_id_producto_seq', (SELECT MAX(id_producto) FROM producto));

DROP TABLE IF EXISTS usuarios CASCADE;

CREATE TABLE usuarios (
  id_usuario SERIAL PRIMARY KEY,
  uid VARCHAR(20) NOT NULL UNIQUE,
  correo VARCHAR(255),
  contra VARCHAR(255),
  sematary DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  ticket TEXT,
  fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ultima_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_uid ON usuarios(uid);

INSERT INTO usuarios (id_usuario, uid, correo, contra, sematary, ticket, fecha_registro, ultima_actualizacion) VALUES 
(1, '94282BD8', 'Fent@gmail.com', 'foco', 463.00, 
'========== FARMACIA TERE ==========
Fecha: 20/11/2025 00:21:15
Cajero: Pedro
ID Venta: 34
===================================

PRODUCTOS:
-----------------------------------
WM                   x1
$37.00 cada uno = $37.00
-----------------------------------

TOTAL: $37.00
CAMBIO GUARDADO: $463.00

===================================

¡Gracias por su compra!
Cambio guardado en tarjeta NFC
', 
'2025-11-20 00:21:15', '2025-11-20 00:44:14');

SELECT setval('usuarios_id_usuario_seq', (SELECT MAX(id_usuario) FROM usuarios));

DROP TABLE IF EXISTS venta CASCADE;

CREATE TABLE venta (
  id_venta BIGSERIAL PRIMARY KEY,
  fecha TIMESTAMP NOT NULL,
  id_cajero INTEGER NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  CONSTRAINT fk_venta_cajero FOREIGN KEY (id_cajero) REFERENCES mcajero(id_ca)
);

CREATE INDEX idx_venta_cajero ON venta(id_cajero);

INSERT INTO venta (id_venta, fecha, id_cajero, total) VALUES 
(1, '2025-07-04 00:25:54', 1, 2000.00),
(2, '2025-07-04 01:02:32', 1, 1111.00),
(3, '2025-07-04 01:49:04', 1, 1111.00),
(4, '2025-07-04 15:39:51', 1, 15.00),
(5, '2025-07-07 22:07:42', 1, 505.00),
(6, '2025-07-07 22:09:43', 1, 5.00),
(7, '2025-07-08 02:54:55', 1, 500.00),
(8, '2025-07-08 03:20:17', 1, 1500.00),
(9, '2025-07-08 03:36:25', 1, 5.00),
(10, '2025-07-08 03:37:30', 1, 5.00),
(11, '2025-07-08 11:49:43', 1, 10.00),
(12, '2025-07-08 11:57:03', 1, 10.00),
(13, '2025-07-08 11:57:56', 1, 15.00),
(14, '2025-07-08 20:08:26', 1, 40.00),
(15, '2025-07-08 20:22:44', 1, 15.00),
(24, '2025-11-19 08:56:19', 1, 5.00),
(25, '2025-11-19 08:56:23', 1, 37.00),
(26, '2025-11-19 08:56:39', 1, 57.00),
(27, '2025-11-19 09:09:50', 1, 37.00),
(28, '2025-11-19 09:13:38', 1, 37.00),
(29, '2025-11-19 09:42:29', 1, 5.00),
(30, '2025-11-19 11:29:25', 1, 82.00),
(31, '2025-11-19 22:16:15', 1, 5.00),
(32, '2025-11-19 22:22:24', 1, 37.00),
(33, '2025-11-19 23:58:42', 1, 37.00),
(34, '2025-11-20 00:21:04', 1, 37.00);

SELECT setval('venta_id_venta_seq', (SELECT MAX(id_venta) FROM venta));


DROP TABLE IF EXISTS detalle_venta CASCADE;

CREATE TABLE detalle_venta (
  id_detalle BIGSERIAL PRIMARY KEY,
  id_venta BIGINT NOT NULL,
  id_producto BIGINT NOT NULL,
  cantidad INTEGER NOT NULL,
  precio_unitario DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  CONSTRAINT fk_detalle_venta FOREIGN KEY (id_venta) REFERENCES venta(id_venta) ON DELETE CASCADE,
  CONSTRAINT fk_detalle_producto FOREIGN KEY (id_producto) REFERENCES producto(id_producto) ON DELETE CASCADE
);

CREATE INDEX idx_detalle_venta ON detalle_venta(id_venta);
CREATE INDEX idx_detalle_producto ON detalle_venta(id_producto);

INSERT INTO detalle_venta (id_detalle, id_venta, id_producto, cantidad, precio_unitario, subtotal) VALUES 
(9, 5, 7502309734745, 1, 5.00, 5.00),
(10, 5, 99575348617, 1, 500.00, 500.00),
(11, 6, 7502309734745, 1, 5.00, 5.00),
(12, 7, 99575348617, 1, 500.00, 500.00),
(13, 8, 99575348617, 1, 500.00, 500.00),
(14, 8, 99575348617, 2, 500.00, 1000.00),
(15, 9, 7502309734745, 1, 5.00, 5.00),
(16, 10, 7502309734745, 1, 5.00, 5.00),
(17, 11, 7502309734745, 1, 5.00, 5.00),
(18, 11, 7502309734745, 1, 5.00, 5.00),
(19, 12, 7502309734745, 1, 5.00, 5.00),
(20, 12, 7502309734745, 1, 5.00, 5.00),
(21, 13, 7501199416533, 1, 15.00, 15.00),
(22, 14, 400009655896, 2, 20.00, 40.00),
(23, 15, 7501199416533, 1, 15.00, 15.00),
(24, 24, 7502309734745, 1, 5.00, 5.00),
(25, 25, 70847036043, 1, 37.00, 37.00),
(26, 26, 400009655896, 1, 20.00, 20.00),
(27, 26, 70847036043, 1, 37.00, 37.00),
(28, 27, 70847036043, 1, 37.00, 37.00),
(29, 28, 70847036043, 1, 37.00, 37.00),
(30, 29, 7502309734745, 1, 5.00, 5.00),
(31, 30, 7502309734745, 1, 5.00, 5.00),
(32, 30, 400009655896, 1, 20.00, 20.00),
(33, 30, 400009655896, 1, 20.00, 20.00),
(34, 30, 70847036043, 1, 37.00, 37.00),
(35, 31, 7502309734745, 1, 5.00, 5.00),
(36, 32, 70847036043, 1, 37.00, 37.00),
(37, 33, 70847036043, 1, 37.00, 37.00),
(38, 34, 70847036043, 1, 37.00, 37.00);

SELECT setval('detalle_venta_id_detalle_seq', (SELECT MAX(id_detalle) FROM detalle_venta));

DROP TABLE IF EXISTS ventas CASCADE;

CREATE TABLE ventas (
  id_venta SERIAL PRIMARY KEY,
  fecha_venta TIMESTAMP NOT NULL,
  total_venta DECIMAL(10,2) NOT NULL,
  id_cajero INTEGER NOT NULL,
  CONSTRAINT ventas_fk_cajero FOREIGN KEY (id_cajero) REFERENCES mcajero(id_ca)
);

CREATE INDEX idx_ventas_cajero ON ventas(id_cajero);

CREATE OR REPLACE FUNCTION update_ultima_actualizacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.ultima_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trigger_update_usuarios
    BEFORE UPDATE ON usuarios
    FOR EACH ROW
    EXECUTE FUNCTION update_ultima_actualizacion();


-- ============================================
-- NOTAS DE MIGRACIÓN
-- ============================================
-- ✅ Convertido AUTO_INCREMENT a SERIAL/BIGSERIAL
-- ✅ Convertido DATETIME a TIMESTAMP
-- ✅ Convertido INT a INTEGER
-- ✅ Añadido trigger para ultima_actualizacion
-- ✅ Preservadas todas las foreign keys con CASCADE
-- ✅ Preservados índices y constraints
-- ✅ Reseteo de secuencias incluido
-- ⚠️  Encoding: caracteres especiales en 'contra' preservados
-- ⚠️  Tabla 'ventas' existe pero está vacía (posible duplicado de 'venta')

-- Para importar en Supabase:
-- 1. Ve a SQL Editor en tu proyecto Supabase
-- 2. Copia y pega todo este archivo
-- 3. Ejecuta el script
-- 4. Verifica las tablas en Table Editor

-- -bynd 🐱

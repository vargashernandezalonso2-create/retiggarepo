// aaa script para probar la conexión a Supabase -bynd
require('dotenv').config();
const { Pool } = require('pg');

console.log('🔍 Verificando configuración...\n');

// ey verificar q existe DATABASE_URL -bynd
if (!process.env.DATABASE_URL) {
    console.error('❌ ERROR: DATABASE_URL no encontrada en .env');
    console.log('\n💡 Crea un archivo .env con:');
    console.log('DATABASE_URL=postgresql://postgres.XXXXX:PASSWORD@HOST:5432/postgres\n');
    process.exit(1);
}

// chintrolas parsear la URL para mostrar info -bynd
try {
    const url = new URL(process.env.DATABASE_URL);
    console.log('📋 Configuración encontrada:');
    console.log('   Host:', url.hostname);
    console.log('   Port:', url.port);
    console.log('   User:', url.username);
    console.log('   Database:', url.pathname.substring(1));
    console.log('   Password:', url.password ? '***' + url.password.slice(-4) : '❌ NO CONFIGURADO');
    console.log('');
} catch (err) {
    console.error('❌ DATABASE_URL tiene formato inválido');
    console.log('Formato correcto: postgresql://user:password@host:port/database\n');
    process.exit(1);
}

// q chidoteee intentar conexión -bynd
console.log('🔌 Intentando conectar a Supabase...\n');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

pool.connect()
    .then(client => {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ ¡CONEXIÓN EXITOSA A SUPABASE! 🎉');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        
        // vavavava probar una query simple -bynd
        return client.query('SELECT NOW() as fecha, version() as version')
            .then(result => {
                console.log('📅 Fecha/hora del servidor:', result.rows[0].fecha);
                console.log('🗄️  Versión PostgreSQL:', result.rows[0].version.split(' ')[0] + ' ' + result.rows[0].version.split(' ')[1]);
                console.log('');
                
                // aaa listar tablas -bynd
                return client.query(`
                    SELECT table_name 
                    FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    ORDER BY table_name
                `);
            })
            .then(result => {
                console.log('📊 Tablas en la base de datos (' + result.rows.length + '):');
                if (result.rows.length === 0) {
                    console.log('   ⚠️  No hay tablas públicas');
                    console.log('   💡 Necesitas crear las tablas de la farmacia\n');
                } else {
                    result.rows.forEach(row => {
                        console.log('   ✓', row.table_name);
                    });
                    console.log('');
                }
                
                client.release();
                pool.end();
                
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                console.log('✅ Prueba completada exitosamente');
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
                console.log('👉 Ahora puedes ejecutar: node server.js\n');
            });
    })
    .catch(err => {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('❌ ERROR DE CONEXIÓN');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        console.error('Mensaje:', err.message);
        console.error('Código:', err.code);
        console.log('');
        
        // fokeis diagnóstico del error -bynd
        if (err.code === 'XX000' || err.message.includes('Tenant or user not found')) {
            console.log('🔴 PROBLEMA: Usuario o proyecto no encontrado\n');
            console.log('SOLUCIONES:');
            console.log('   1. ❌ El USER está incorrecto');
            console.log('      → Debe ser: postgres.XXXXXXXXXXXXX');
            console.log('      → NO solo "postgres"');
            console.log('      → Cópialo desde: Dashboard → Database → Connection info\n');
            
            console.log('   2. ❌ El proyecto está PAUSADO');
            console.log('      → Ve a: https://supabase.com/dashboard');
            console.log('      → Activa tu proyecto si dice "Paused"\n');
            
            console.log('   3. ❌ El HOST está mal');
            console.log('      → Usa el Session Pooler host');
            console.log('      → Ejemplo: aws-0-us-east-1.pooler.supabase.com\n');
            
        } else if (err.code === '28P01') {
            console.log('🔴 PROBLEMA: Password incorrecto\n');
            console.log('SOLUCIONES:');
            console.log('   1. Ve a Dashboard → Database → Reset database password');
            console.log('   2. Copia el nuevo password (se muestra solo una vez)');
            console.log('   3. Actualiza DATABASE_URL en .env\n');
            
        } else if (err.code === 'ENOTFOUND') {
            console.log('🔴 PROBLEMA: Host no encontrado\n');
            console.log('VERIFICA:');
            console.log('   → El HOST en DATABASE_URL');
            console.log('   → Debe ser: aws-0-REGION.pooler.supabase.com');
            console.log('   → Con REGION = us-east-1, us-east-2, eu-central-1, etc.\n');
            
        } else if (err.code === 'ECONNREFUSED') {
            console.log('🔴 PROBLEMA: Conexión rechazada\n');
            console.log('VERIFICA:');
            console.log('   → Proyecto pausado en Supabase');
            console.log('   → Puerto correcto (5432 para Session Pooler)');
            console.log('   → Firewall no bloqueando la conexión\n');
        }
        
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📖 Lee la guía completa: GUIA_SUPABASE.md');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        
        pool.end();
        process.exit(1);
    });

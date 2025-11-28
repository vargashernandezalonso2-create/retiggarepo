// ey script para generar DATABASE_URL con password correcta -bynd
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🔧 Generador de DATABASE_URL');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const config = {};

// aaa función para encodear password correctamente -bynd
function encodePassword(password) {
    // chintrolas caracteres especiales que necesitan encoding -bynd
    return encodeURIComponent(password);
}

console.log('📝 Vamos a construir tu connection string paso a paso\n');
console.log('💡 TIP: Copia cada valor directamente desde Supabase Dashboard');
console.log('   → Settings → Database → Connection info\n');

rl.question('1️⃣  User (ej: postgres.ifgnaqmolrswwwpzfqzw): ', (user) => {
    config.user = user.trim();
    
    rl.question('2️⃣  Password (pégalo completo, con todos los caracteres): ', (password) => {
        config.password = password.trim();
        config.encodedPassword = encodePassword(password);
        
        rl.question('3️⃣  Host (ej: aws-1-us-east-2.pooler.supabase.com): ', (host) => {
            config.host = host.trim();
            
            rl.question('4️⃣  Port [5432]: ', (port) => {
                config.port = port.trim() || '5432';
                
                rl.question('5️⃣  Database [postgres]: ', (database) => {
                    config.database = database.trim() || 'postgres';
                    
                    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                    console.log('✅ CONFIGURACIÓN GENERADA');
                    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
                    
                    console.log('📋 Componentes:');
                    console.log('   User:', config.user);
                    console.log('   Password (original):', config.password);
                    console.log('   Password (encoded):', config.encodedPassword);
                    console.log('   Host:', config.host);
                    console.log('   Port:', config.port);
                    console.log('   Database:', config.database);
                    console.log('');
                    
                    // q chidoteee generar connection string -bynd
                    const connectionString = `postgresql://${config.user}:${config.encodedPassword}@${config.host}:${config.port}/${config.database}`;
                    
                    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                    console.log('📝 COPIA ESTO A TU ARCHIVO .env:');
                    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
                    console.log(`DATABASE_URL=${connectionString}\n`);
                    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
                    
                    // vavavava detectar posibles problemas -bynd
                    console.log('🔍 Verificación de posibles problemas:');
                    
                    if (config.password !== config.encodedPassword) {
                        console.log('   ⚠️  Tu password contiene caracteres especiales');
                        console.log('   ✅ Se codificó automáticamente para ti');
                        console.log('');
                        console.log('   Caracteres que se codificaron:');
                        const specialChars = {
                            '@': '%40',
                            ':': '%3A',
                            '/': '%2F',
                            '?': '%3F',
                            '#': '%23',
                            '[': '%5B',
                            ']': '%5D',
                            '!': '%21',
                            '$': '%24',
                            '&': '%26',
                            "'": '%27',
                            '(': '%28',
                            ')': '%29',
                            '*': '%2A',
                            '+': '%2B',
                            ',': '%2C',
                            ';': '%3B',
                            '=': '%3D',
                            '%': '%25',
                            ' ': '%20'
                        };
                        
                        for (const [char, encoded] of Object.entries(specialChars)) {
                            if (config.password.includes(char)) {
                                console.log(`   → "${char}" se convirtió a "${encoded}"`);
                            }
                        }
                        console.log('');
                    }
                    
                    if (!config.user.startsWith('postgres.')) {
                        console.log('   ⚠️  El user NO empieza con "postgres."');
                        console.log('   ❌ Puede ser incorrecto');
                        console.log('   ✅ Debe ser: postgres.XXXXXXXXXXXXX\n');
                    } else {
                        console.log('   ✅ User tiene formato correcto\n');
                    }
                    
                    if (!config.host.includes('pooler.supabase.com')) {
                        console.log('   ⚠️  El host no parece ser de Supabase Pooler');
                        console.log('   💡 Asegúrate de usar Session Pooler o Transaction Pooler\n');
                    } else {
                        console.log('   ✅ Host tiene formato correcto\n');
                    }
                    
                    if (config.port !== '5432' && config.port !== '6543') {
                        console.log('   ⚠️  Puerto inusual detectado');
                        console.log('   💡 Normalmente es 5432 (Session) o 6543 (Transaction)\n');
                    } else {
                        console.log('   ✅ Puerto correcto\n');
                    }
                    
                    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                    console.log('👉 Siguientes pasos:');
                    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
                    console.log('1. Copia el DATABASE_URL de arriba');
                    console.log('2. Pégalo en tu archivo .env');
                    console.log('3. Guarda el archivo .env');
                    console.log('4. Ejecuta: node test-conexion.js');
                    console.log('5. Si funciona, ejecuta: node server.js\n');
                    
                    rl.close();
                });
            });
        });
    });
});

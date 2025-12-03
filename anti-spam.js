// aaa sistema anti-spam y anti-ataques mejorado -bynd
// q chidoteee ahora con lockdown permanente sin crashear el servidor -bynd

const fs = require('fs');
const path = require('path');

// chintrolas archivo para guardar IPs baneadas permanentemente -bynd
const BANNED_IPS_FILE = path.join(__dirname, 'banned-ips.json');

class AntiSpamSystem {
    constructor() {
        // ey inicializar estructuras de datos -bynd
        this.requestLog = {};
        this.bannedIPs = new Set();
        this.warningIPs = new Map(); // vavavava IPs con advertencia -bynd
        
        // q chidoteee cargar IPs baneadas del archivo -bynd
        this.loadBannedIPs();
        
        // fokeis limpiar logs cada 30 segundos -bynd
        setInterval(() => this.cleanOldLogs(), 30000);
        
        // aaa guardar IPs baneadas cada 5 minutos -bynd
        setInterval(() => this.saveBannedIPs(), 300000);
    }
    
    // ey cargar IPs baneadas del archivo -bynd
    loadBannedIPs() {
        try {
            if (fs.existsSync(BANNED_IPS_FILE)) {
                const data = fs.readFileSync(BANNED_IPS_FILE, 'utf8');
                const banned = JSON.parse(data);
                this.bannedIPs = new Set(banned.ips || []);
                console.log(`🛡️  [SECURITY] Cargadas ${this.bannedIPs.size} IPs baneadas`);
            } else {
                // chintrolas crear archivo si no existe -bynd
                console.log('📝 [SECURITY] Creando archivo banned-ips.json...');
                const emptyData = {
                    ips: [],
                    lastUpdated: new Date().toISOString()
                };
                fs.writeFileSync(BANNED_IPS_FILE, JSON.stringify(emptyData, null, 2));
                console.log('✅ [SECURITY] Archivo banned-ips.json creado');
            }
        } catch (error) {
            console.error('❌ [ERROR] No se pudieron cargar IPs baneadas:', error.message);
        }
    }
    
    // chintrolas guardar IPs baneadas al archivo -bynd
    saveBannedIPs() {
        try {
            const data = {
                ips: Array.from(this.bannedIPs),
                lastUpdated: new Date().toISOString()
            };
            fs.writeFileSync(BANNED_IPS_FILE, JSON.stringify(data, null, 2));
            console.log(`💾 [SECURITY] IPs baneadas guardadas: ${this.bannedIPs.size}`);
        } catch (error) {
            console.error('❌ [ERROR] No se pudieron guardar IPs baneadas:', error.message);
        }
    }
    
    // vavavava limpiar logs antiguos -bynd
    cleanOldLogs() {
        const now = Date.now();
        for (const ip in this.requestLog) {
            // aaa mantener solo requests de los últimos 30 segundos -bynd
            this.requestLog[ip] = this.requestLog[ip].filter(t => now - t < 30000);
            if (this.requestLog[ip].length === 0) {
                delete this.requestLog[ip];
            }
        }
        
        // ey limpiar advertencias viejas (más de 5 minutos) -bynd
        for (const [ip, timestamp] of this.warningIPs.entries()) {
            if (now - timestamp > 300000) {
                this.warningIPs.delete(ip);
            }
        }
    }
    
    // q chidoteee obtener IP del cliente -bynd
    getClientIP(req) {
        return req.headers['x-forwarded-for']?.split(',')[0] || 
               req.headers['x-real-ip'] || 
               req.ip || 
               req.connection.remoteAddress || 
               'unknown';
    }
    
    // fokeis verificar si una IP está baneada -bynd
    isBanned(ip) {
        return this.bannedIPs.has(ip);
    }
    
    // aaa banear una IP permanentemente -bynd
    banIP(ip, reason = 'Spam detectado') {
        this.bannedIPs.add(ip);
        this.saveBannedIPs();
        
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🚨 [SECURITY] IP BANEADA PERMANENTEMENTE');
        console.log(`IP: ${ip}`);
        console.log(`Razón: ${reason}`);
        console.log(`Fecha: ${new Date().toISOString()}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    }
    
    // ey registrar request y detectar spam -bynd
    checkRequest(ip) {
        const now = Date.now();
        
        // chintrolas inicializar log del IP -bynd
        if (!this.requestLog[ip]) {
            this.requestLog[ip] = [];
        }
        
        // vavavava registrar timestamp -bynd
        this.requestLog[ip].push(now);
        
        // q chidoteee contar requests recientes -bynd
        const recentRequests = this.requestLog[ip].filter(t => now - t < 10000);
        
        // fokeis detectar spam agresivo (más de 50 requests en 10 segundos) -bynd
        if (recentRequests.length > 50) {
            this.banIP(ip, `Spam agresivo: ${recentRequests.length} requests en 10s`);
            return 'BANNED';
        }
        
        // aaa advertencia si hay mucho tráfico (más de 30 en 10s) -bynd
        if (recentRequests.length > 30) {
            if (!this.warningIPs.has(ip)) {
                this.warningIPs.set(ip, now);
                console.log(`⚠️  [SECURITY] Advertencia para IP ${ip}: ${recentRequests.length} requests`);
            }
            return 'WARNING';
        }
        
        return 'OK';
    }
    
    // ey middleware de Express -bynd
    middleware() {
        return (req, res, next) => {
            const ip = this.getClientIP(req);
            
            // chintrolas excluir recursos estáticos del sistema -bynd
            if (req.path === '/baduser.html' || 
                req.path === '/gatov2.mp4' ||
                req.path.startsWith('/resources/')) {
                return next();
            }
            
            // vavavava si está baneado, lockdown total -bynd
            if (this.isBanned(ip)) {
                console.log(`🚫 [SECURITY] IP baneada intentando acceder: ${ip} → ${req.path}`);
                
                // q chidoteee redirigir SIEMPRE a página de troleo -bynd
                if (req.path !== '/baduser.html') {
                    return res.redirect('/baduser.html');
                }
                
                return next();
            }
            
            // fokeis verificar si hay spam -bynd
            const status = this.checkRequest(ip);
            
            if (status === 'BANNED') {
                // aaa banear y redirigir -bynd
                return res.redirect('/baduser.html');
            }
            
            if (status === 'WARNING') {
                // ey continuar pero con advertencia en logs -bynd
                console.log(`⚠️  [SECURITY] IP bajo observación: ${ip}`);
            }
            
            next();
        };
    }
    
    // chintrolas obtener estadísticas -bynd
    getStats() {
        return {
            bannedIPs: this.bannedIPs.size,
            activeMonitoring: Object.keys(this.requestLog).length,
            warnings: this.warningIPs.size
        };
    }
}

// vavavava exportar instancia singleton -bynd
const antiSpam = new AntiSpamSystem();

module.exports = {
    antiSpam,
    middleware: antiSpam.middleware.bind(antiSpam)
};

// q chidoteee guardar al cerrar el proceso -bynd
process.on('SIGINT', () => {
    antiSpam.saveBannedIPs();
});

process.on('SIGTERM', () => {
    antiSpam.saveBannedIPs();
});

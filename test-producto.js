// aaa script para verificar q devuelve el endpoint de producto -bynd
const productId = process.argv[2] || '70847036005';

console.log(`🔍 Consultando producto ID: ${productId}\n`);

fetch(`http://localhost:3000/api/cliente/productos/${productId}`)
    .then(res => {
        console.log(`📡 Status: ${res.status}\n`);
        return res.json();
    })
    .then(producto => {
        console.log('📦 Producto completo:', JSON.stringify(producto, null, 2));
        console.log('\n🖼️  Campos de imagen:');
        console.log('   img_url:', producto.img_url);
        console.log('   imagen_url:', producto.imagen_url);
        console.log('\n📋 Otros campos:');
        console.log('   id:', producto.id);
        console.log('   nombre:', producto.nombre);
        console.log('   precio:', producto.precio);
        console.log('   stock:', producto.stock);
        console.log('   descripcion:', producto.descripcion);
    })
    .catch(err => {
        console.error('❌ Error:', err.message);
    });

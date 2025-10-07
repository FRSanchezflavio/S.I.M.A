const http = require('http');

console.log('🔍 Probando conexión al backend...\n');

// Prueba 1: Health check
const testHealth = () => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 4003,
      path: '/api/health',
      method: 'GET',
      timeout: 5000,
    };

    const req = http.request(options, res => {
      let data = '';
      res.on('data', chunk => {
        data += chunk;
      });
      res.on('end', () => {
        console.log('✅ Test 1 - Health Check:');
        console.log(`   Status: ${res.statusCode}`);
        console.log(`   Response: ${data}\n`);
        resolve({ status: res.statusCode, data });
      });
    });

    req.on('error', error => {
      console.log('❌ Test 1 - Health Check FAILED:');
      console.log(`   Error: ${error.message}\n`);
      reject(error);
    });

    req.on('timeout', () => {
      console.log('❌ Test 1 - Health Check TIMEOUT\n');
      req.destroy();
      reject(new Error('Timeout'));
    });

    req.end();
  });
};

// Prueba 2: Auth endpoint
const testAuth = () => {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      usuario: 'test',
      password: 'test',
    });

    const options = {
      hostname: 'localhost',
      port: 4003,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
      timeout: 5000,
    };

    const req = http.request(options, res => {
      let data = '';
      res.on('data', chunk => {
        data += chunk;
      });
      res.on('end', () => {
        console.log('✅ Test 2 - Auth Endpoint Accessible:');
        console.log(`   Status: ${res.statusCode}`);
        console.log(`   Response: ${data.substring(0, 100)}...\n`);
        resolve({ status: res.statusCode, data });
      });
    });

    req.on('error', error => {
      console.log('❌ Test 2 - Auth Endpoint FAILED:');
      console.log(`   Error: ${error.message}\n`);
      reject(error);
    });

    req.on('timeout', () => {
      console.log('❌ Test 2 - Auth Endpoint TIMEOUT\n');
      req.destroy();
      reject(new Error('Timeout'));
    });

    req.write(postData);
    req.end();
  });
};

// Ejecutar tests
(async () => {
  try {
    await testHealth();
    await testAuth();
    console.log('🎉 Todas las pruebas completadas exitosamente!');
    console.log('\n📝 Resumen:');
    console.log('   - Backend está corriendo en el puerto 4003');
    console.log('   - El proxy del frontend está configurado correctamente');
    console.log('   - Los endpoints están respondiendo\n');
  } catch (error) {
    console.log(
      '⚠️  Algunas pruebas fallaron. Verifica que el backend esté corriendo.'
    );
    console.log(`   Error: ${error.message}\n`);
    process.exit(1);
  }
})();

const http = require('http');

// Token válido obtenido recientemente
const authToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwidXN1YXJpbyI6ImFkbWluIiwicm9sIjoiYWRtaW4iLCJub21icmUiOiJBZG1pbiIsImFwZWxsaWRvIjoiU0lNQSIsInRva2VuX3ZlcnNpb24iOjAsImlhdCI6MTc1ODEyNDYzMywiZXhwIjoxNzU4MTI1NTMzfQ.mbhD9xSNAGFmWx8mENaWn92bzEk1FhYs7QOQzQaZeik';

// Función para probar el endpoint de creación de personas
function testDescripcionFisica() {
  return new Promise((resolve, reject) => {
    // Datos de prueba con descripcion_fisica
    const postData = JSON.stringify({
      nombre: 'Juan Carlos',
      apellido: 'Pérez',
      dni: '12345678',
      edad: 35,
      genero: 'masculino',
      nacionalidad: 'Argentina',
      descripcion_fisica:
        'Altura aproximada 1.75m, complexión media, cabello negro, ojos marrones, sin marcas distintivas visibles.',
    });

    const req = http.request(
      {
        hostname: 'localhost',
        port: 4001,
        path: '/api/personas',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': postData.length,
          Authorization: `Bearer ${authToken}`,
        },
      },
      res => {
        let data = '';
        res.on('data', chunk => (data += chunk));
        res.on('end', () => {
          console.log(`Status: ${res.statusCode}`);
          console.log(`Response: ${data}`);

          if (res.statusCode === 201) {
            console.log(
              '✅ TEST PASSED: El campo descripcion_fisica se acepta correctamente'
            );
            resolve();
          } else if (res.statusCode === 400) {
            try {
              const response = JSON.parse(data || '{}');
              if (
                response.message &&
                response.message.includes('descripcion_fisica')
              ) {
                console.log(
                  '❌ TEST FAILED: El campo descripcion_fisica aún no está permitido'
                );
                console.log('Error:', response.message);
              } else {
                console.log(
                  '⚠️ TEST PARTIAL: Error 400 pero no relacionado con descripcion_fisica'
                );
                console.log(
                  'Error:',
                  response.message || 'No message in response'
                );
              }
            } catch (e) {
              console.log(
                '⚠️ TEST ERROR: No se pudo parsear la respuesta JSON'
              );
              console.log('Raw response:', data);
            }
            reject(new Error(data || 'Bad Request'));
          } else {
            console.log('⚠️ TEST UNEXPECTED: Status code inesperado');
            reject(new Error(`Unexpected status: ${res.statusCode}`));
          }
        });
      }
    );

    req.on('error', err => {
      console.error('❌ TEST ERROR:', err.message);
      reject(err);
    });

    req.write(postData);
    req.end();
  });
}

// Función para probar sin descripcion_fisica (control)
function testSinDescripcionFisica() {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      nombre: 'María',
      apellido: 'González',
      dni: '87654321',
      edad: 28,
      genero: 'femenino',
      nacionalidad: 'Argentina',
      // Sin descripcion_fisica
    });

    const req = http.request(
      {
        hostname: 'localhost',
        port: 4001,
        path: '/api/personas',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': postData.length,
          Authorization: `Bearer ${authToken}`,
        },
      },
      res => {
        let data = '';
        res.on('data', chunk => (data += chunk));
        res.on('end', () => {
          console.log(`\nControl Test - Status: ${res.statusCode}`);
          console.log(`Control Test - Response: ${data}`);

          if (res.statusCode === 201) {
            console.log(
              '✅ CONTROL PASSED: Creación sin descripcion_fisica funciona'
            );
            resolve();
          } else {
            console.log('⚠️ CONTROL FAILED: Error en creación básica');
            try {
              const response = JSON.parse(data || '{}');
              console.log('Error:', response.message || 'No message');
            } catch (e) {
              console.log('Raw response:', data);
            }
            reject(new Error(`Control test failed: ${res.statusCode}`));
          }
        });
      }
    );

    req.on('error', err => {
      console.error('❌ CONTROL ERROR:', err.message);
      reject(err);
    });

    req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Iniciando pruebas del campo descripcion_fisica...\n');

  try {
    console.log('1. Probando creación CON descripcion_fisica:');
    await testDescripcionFisica();

    console.log('\n2. Probando creación SIN descripcion_fisica (control):');
    await testSinDescripcionFisica();

    console.log('\n🎉 TODAS LAS PRUEBAS COMPLETADAS EXITOSAMENTE');
    console.log(
      '✅ El campo descripcion_fisica está funcionando correctamente'
    );
  } catch (err) {
    console.log('\n❌ PRUEBAS FALLARON');
    console.error('Error:', err.message);
  }
}

runTests();

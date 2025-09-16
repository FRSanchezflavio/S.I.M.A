const http = require('http');

// Probar endpoint de salud
function testHealth() {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: 'localhost',
        port: 4001,
        path: '/api/health',
        method: 'GET',
      },
      res => {
        let data = '';
        res.on('data', chunk => (data += chunk));
        res.on('end', () => {
          console.log(`Health Status: ${res.statusCode}`);
          console.log(`Health Response: ${data}`);
          resolve();
        });
      }
    );

    req.on('error', err => {
      console.error('Health Error:', err.message);
      reject(err);
    });

    req.end();
  });
}

// Probar endpoint de login
function testLogin() {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      usuario: 'admin',
      password: 'admin123',
    });

    const req = http.request(
      {
        hostname: 'localhost',
        port: 4001,
        path: '/api/auth/login',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': postData.length,
        },
      },
      res => {
        let data = '';
        res.on('data', chunk => (data += chunk));
        res.on('end', () => {
          console.log(`Login Status: ${res.statusCode}`);
          console.log(`Login Response: ${data}`);
          resolve();
        });
      }
    );

    req.on('error', err => {
      console.error('Login Error:', err.message);
      reject(err);
    });

    req.write(postData);
    req.end();
  });
}

async function runTests() {
  try {
    await testHealth();
    await testLogin();
  } catch (err) {
    console.error('Test failed:', err.message);
  }
}

runTests();

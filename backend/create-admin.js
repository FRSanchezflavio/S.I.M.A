require('dotenv').config();
const db = require('./src/db/knex');
const { hashPassword } = require('./src/utils/hash');

async function createAdminUser() {
  try {
    // Eliminar usuario admin existente si existe
    await db('usuarios').where({ usuario: 'admin' }).del();

    // Crear nuevo hash para "admin123"
    const password = 'admin123';
    const passwordHash = await hashPassword(password);

    // Insertar nuevo usuario admin
    await db('usuarios').insert({
      usuario: 'admin',
      password_hash: passwordHash,
      nombre: 'Admin',
      apellido: 'SIMA',
      rol: 'admin',
      activo: true,
    });

    console.log('✓ Usuario admin creado con contraseña:', password);

    // Verificar que funciona
    const { comparePassword } = require('./src/utils/hash');
    const user = await db('usuarios').where({ usuario: 'admin' }).first();
    const match = await comparePassword(password, user.password_hash);

    console.log('✓ Verificación de contraseña:', match ? 'OK' : 'ERROR');

    await db.destroy();
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

createAdminUser();

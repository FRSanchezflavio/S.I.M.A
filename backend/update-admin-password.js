require('dotenv').config();
const db = require('./src/db/knex');
const { hashPassword } = require('./src/utils/hash');

async function updateAdminPassword() {
  try {
    // Crear nuevo hash para "admin123"
    const password = 'admin123';
    const passwordHash = await hashPassword(password);

    // Actualizar contraseña del usuario admin existente
    await db('usuarios').where({ usuario: 'admin' }).update({
      password_hash: passwordHash,
      activo: true,
    });

    console.log('✓ Contraseña del usuario admin actualizada:', password);

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

updateAdminPassword();

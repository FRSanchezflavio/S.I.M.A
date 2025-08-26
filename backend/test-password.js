require('dotenv').config();
const db = require('./src/db/knex');
const { comparePassword } = require('./src/utils/hash');

async function testPasswords() {
  try {
    const user = await db('usuarios').where({ usuario: 'admin' }).first();
    if (!user) {
      console.log('Usuario no encontrado');
      return process.exit(1);
    }

    console.log(
      'Hash almacenado:',
      user.password_hash.substring(0, 20) + '...'
    );

    const passwords = ['admin123', 'admin', '123456', 'password'];
    for (const pwd of passwords) {
      const match = await comparePassword(pwd, user.password_hash);
      console.log(`Password '${pwd}': ${match ? 'MATCH ✓' : 'NO MATCH ✗'}`);
    }

    await db.destroy();
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

testPasswords();

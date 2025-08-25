// Realiza backup de la base de datos y del directorio de uploads.
// Requiere tener instalados pg_dump y zip (o 7z si se adapta) en el PATH.
const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const now = new Date();
const stamp = now.toISOString().replace(/[:.]/g, '-');
const BACKUP_DIR =
  process.env.BACKUP_DIR || path.join(process.cwd(), 'backups');
const DB_HOST = process.env.DB_HOST || '127.0.0.1';
const DB_PORT = process.env.DB_PORT || '5432';
const DB_USER = process.env.DB_USER || 'postgres';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'sima';
const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR || 'uploads');

if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });

const dumpFile = path.join(BACKUP_DIR, `${DB_NAME}_${stamp}.sql`);
const uploadsTarGz = path.join(BACKUP_DIR, `uploads_${stamp}.tar.gz`);

function run(cmd, args, env = {}, options = {}) {
  return new Promise((resolve, reject) => {
    const child = execFile(
      cmd,
      args,
      {
        env: { ...process.env, ...env },
        cwd: options.cwd || process.cwd(),
        shell: true,
      },
      (err, stdout, stderr) => {
        if (err) return reject(new Error(stderr || err.message));
        resolve(stdout);
      }
    );
  });
}

async function resolvePgDump() {
  const isWin = process.platform === 'win32';
  const hint =
    '\nSugerencia: define PG_DUMP_PATH o PG_BIN en .env, o agrega la carpeta bin de PostgreSQL al PATH.';
  // 1) PG_DUMP_PATH
  if (process.env.PG_DUMP_PATH) {
    const p = process.env.PG_DUMP_PATH;
    if (fs.existsSync(p)) return p;
  }
  // 2) PG_BIN
  if (process.env.PG_BIN) {
    const candidate = path.join(
      process.env.PG_BIN,
      isWin ? 'pg_dump.exe' : 'pg_dump'
    );
    if (fs.existsSync(candidate)) return candidate;
  }
  // 3) Windows: buscar en Program Files
  if (isWin) {
    const roots = [
      'C\\\\Program Files\\\\PostgreSQL',
      'C:\\Program Files\\PostgreSQL',
      'C:\\Program Files (x86)\\PostgreSQL',
    ];
    for (const root of roots) {
      try {
        const versions = fs
          .readdirSync(root, { withFileTypes: true })
          .filter(d => d.isDirectory())
          .map(d => d.name)
          .sort()
          .reverse();
        for (const v of versions) {
          const candidate = path.join(root, v, 'bin', 'pg_dump.exe');
          if (fs.existsSync(candidate)) return candidate;
        }
      } catch (_) {}
    }
  }
  // 4) PATH
  try {
    await run(isWin ? 'where' : 'which', ['pg_dump']);
    return 'pg_dump';
  } catch (_) {
    throw new Error(
      'pg_dump no encontrado en PATH ni en rutas conocidas.' + hint
    );
  }
}

async function backup() {
  try {
    // pg_dump
    const pgDump = await resolvePgDump();
    console.log(`Dumping database with ${pgDump}...`);
    await run(
      pgDump,
      [
        `-h`,
        DB_HOST,
        `-p`,
        String(DB_PORT),
        `-U`,
        DB_USER,
        `-F`,
        'p', // plain SQL
        `-f`,
        dumpFile,
        DB_NAME,
      ],
      { PGPASSWORD: DB_PASSWORD }
    );
    console.log('Database dump created at', dumpFile);

    // Archivar uploads (preferir tar, fallback zip)
    if (fs.existsSync(UPLOAD_DIR)) {
      console.log('Archiving uploads...');
      const parent = path.dirname(UPLOAD_DIR);
      const base = path.basename(UPLOAD_DIR);
      try {
        // Intentar tar primero (Windows 10+ trae tar)
        await run('tar', ['-czf', uploadsTarGz, base], {}, { cwd: parent });
        console.log('Uploads archived at', uploadsTarGz);
      } catch (e) {
        // Fallback a zip
        const uploadsZip = path.join(BACKUP_DIR, `uploads_${stamp}.zip`);
        await run('zip', ['-r', uploadsZip, base], {}, { cwd: parent });
        console.log('Uploads archived at', uploadsZip);
      }
    } else {
      console.log('No uploads directory found, skipping.');
    }

    console.log('Backup completed.');
  } catch (e) {
    console.error('Backup failed:', e.message);
    process.exit(1);
  }
}

backup();

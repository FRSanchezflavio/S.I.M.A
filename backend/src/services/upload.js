const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.resolve(process.env.UPLOAD_DIR || 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname || '').toLowerCase();
    cb(null, `${unique}${ext}`);
  },
});

function fileFilter(_, file, cb) {
  const allowedExt = ['.jpg', '.jpeg', '.png', '.webp'];
  const ext = path.extname(file.originalname || '').toLowerCase();
  const type = (file.mimetype || '').toLowerCase();
  const allowedMime = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedExt.includes(ext) && allowedMime.includes(type)) cb(null, true);
  else cb(new Error('Tipo de archivo no permitido'));
}

module.exports = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// util opcional para borrar archivos físicos (usado en limpiezas futuras)
module.exports.deleteIfExists = function deleteIfExists(filePath) {
  try {
    const full = path.isAbsolute(filePath)
      ? filePath
      : path.join(uploadDir, path.basename(filePath));
    if (fs.existsSync(full)) fs.unlinkSync(full);
  } catch (_) {}
};

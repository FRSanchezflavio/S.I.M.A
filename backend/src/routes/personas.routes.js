const router = require('express').Router();
const controller = require('../controllers/personas.controller');
const { requireAuth } = require('../security/authz');
const upload = require('../services/upload');

router.get('/', requireAuth, controller.search);
router.post('/', requireAuth, upload.array('fotos', 10), controller.create);
router.get('/:id', requireAuth, controller.get);
router.put('/:id', requireAuth, upload.array('fotos', 10), controller.update);
router.delete('/:id', requireAuth, controller.remove);

module.exports = router;

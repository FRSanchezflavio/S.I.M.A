const router = require('express').Router({ mergeParams: true });
const controller = require('../controllers/registros.controller');
const { requireAuth } = require('../security/authz');

router.get('/', requireAuth, controller.list);
router.post('/', requireAuth, controller.create);
router.get('/:id', requireAuth, controller.get);
router.put('/:id', requireAuth, controller.update);
router.delete('/:id', requireAuth, controller.remove);
router.post('/:id/duplicate', requireAuth, controller.duplicate);

module.exports = router;

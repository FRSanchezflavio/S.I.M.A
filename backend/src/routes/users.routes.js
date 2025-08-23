const router = require('express').Router();
const controller = require('../controllers/users.controller');
const { requireAuth, requireAdmin } = require('../security/authz');

router.get('/', requireAuth, requireAdmin, controller.list);
router.post('/', requireAuth, requireAdmin, controller.create);
router.get('/:id', requireAuth, requireAdmin, controller.get);
router.put('/:id', requireAuth, requireAdmin, controller.update);
router.delete('/:id', requireAuth, requireAdmin, controller.remove);

module.exports = router;

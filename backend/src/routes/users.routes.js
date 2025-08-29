const router = require('express').Router();
const controller = require('../controllers/users.controller');
const { requireAuth, requireAdmin } = require('../security/authz');
const { passwordLimiter } = require('../middlewares/rate-limit');

// User management (admin only)
router.get('/', requireAuth, requireAdmin, controller.list);
router.post('/', requireAuth, requireAdmin, controller.create);
router.get('/:id', requireAuth, requireAdmin, controller.get);
router.put('/:id', requireAuth, requireAdmin, controller.update);
router.delete('/:id', requireAuth, requireAdmin, controller.remove);

// Token management (admin only)
router.post('/:id/revoke-tokens', requireAuth, requireAdmin, controller.revokeTokens);

// Password management
router.post('/me/password', requireAuth, passwordLimiter, controller.changeOwnPassword);
router.post('/:id/password', requireAuth, requireAdmin, passwordLimiter, controller.adminChangePassword);

// Profile management
router.get('/me/profile', requireAuth, controller.getProfile);
router.put('/me/profile', requireAuth, controller.updateProfile);

module.exports = router;

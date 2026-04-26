const router = require('express').Router();
const { getProfile, updatePreferredLanguage } = require('../controllers/users');

router.get('/users/me', getProfile);
router.patch('/users/me/language', updatePreferredLanguage);

module.exports = router;

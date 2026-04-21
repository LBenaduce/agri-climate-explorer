const router = require('express').Router();
const { getProfile } = require('../controllers/users');

router.get('/users/me', getProfile);

module.exports = router;

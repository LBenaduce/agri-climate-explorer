const router = require('express').Router();
const { login, register } = require('../controllers/users');
const { validateSignup, validateSignin } = require('../middleware/validate');

router.post('/signup', validateSignup, register);
router.post('/signin', validateSignin, login);

module.exports = router;

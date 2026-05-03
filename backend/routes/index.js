const router = require('express').Router();
const auth = require('../middleware/auth');
const authRoutes = require('./auth');
const usersRoutes = require('./users');
const weatherRoutes = require('./weather');
const ndviRoutes = require('./ndvi');
const locationsRoutes = require('./locations');

router.use(authRoutes);
router.use(weatherRoutes);
router.use(ndviRoutes);
router.use(auth);
router.use(usersRoutes);
router.use(locationsRoutes);

module.exports = router;

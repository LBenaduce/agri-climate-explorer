const router = require('express').Router();
const { getNdvi } = require('../controllers/ndvi');

router.get('/ndvi', getNdvi);

module.exports = router;

const router = require('express').Router();
const { getWeather } = require('../controllers/weather');
const { validateWeatherQuery } = require('../middleware/validate');

router.get('/weather', validateWeatherQuery, getWeather);

module.exports = router;

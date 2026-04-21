const router = require('express').Router();
const { getLocations, createLocation, deleteLocation } = require('../controllers/locations');
const { validateLocation } = require('../middleware/validate');

router.get('/locations', getLocations);
router.post('/locations', validateLocation, createLocation);
router.delete('/locations/:id', deleteLocation);

module.exports = router;

const { buildClimatePayload } = require('../services/climateService');

module.exports.getWeather = async (req, res, next) => {
  try {
    const city = req.query.city.trim();
    const climatePayload = await buildClimatePayload(city);
    res.send(climatePayload);
  } catch (error) {
    next(error);
  }
};

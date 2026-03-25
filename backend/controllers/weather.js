function buildInsight(temperature, humidity, rainfall, wind) {
  if (rainfall > 20) return "High rainfall may delay field operations and increase disease pressure.";
  if (humidity > 80) return "High humidity can elevate fungal disease risk in sensitive crops.";
  if (temperature >= 20 && temperature <= 30 && rainfall < 10) {
    return "Conditions look favorable for many field activities and general crop development.";
  }
  if (wind > 25) return "Strong winds may affect spraying conditions and plant stress.";
  return "Monitor field conditions closely and combine this data with local crop-specific recommendations.";
}

module.exports.getWeather = (req, res) => {
  const city = req.query.city;

  if (!city) {
    return res.status(400).send({ message: "City is required" });
  }

  const temperature = 18 + Math.floor(Math.random() * 15);
  const humidity = 45 + Math.floor(Math.random() * 45);
  const rainfall = Math.floor(Math.random() * 25);
  const wind = 5 + Math.floor(Math.random() * 30);

  return res.send({
    city,
    country: "BR",
    temperature,
    humidity,
    rainfall,
    wind,
    summary: rainfall > 12 ? "Rain showers" : "Partly cloudy",
    insight: buildInsight(temperature, humidity, rainfall, wind)
  });
};
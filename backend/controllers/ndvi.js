function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function estimateNdvi({ rainfall = 0, humidity = 0, temperature = 0, wind = 0 }) {
  let ndvi = 0.52;

  if (humidity >= 55 && humidity <= 85) ndvi += 0.08;
  if (rainfall > 0 && rainfall <= 20) ndvi += 0.06;
  if (temperature >= 18 && temperature <= 30) ndvi += 0.06;
  if (temperature > 34 || wind > 28) ndvi -= 0.12;
  if (rainfall > 45) ndvi -= 0.08;

  return Number(clamp(ndvi, 0.15, 0.82).toFixed(2));
}

function buildHistory(currentNdvi, { rainfall = 0, temperature = 0, humidity = 0 }) {
  const stressSignal = rainfall < 5 || temperature > 33 || humidity < 35 ? -0.035 : 0.018;

  return Array.from({ length: 6 }, (_, index) => {
    const reverseIndex = 5 - index;
    const seasonalCurve = Math.sin(index / 1.7) * 0.025;
    const ndvi = index === 5
      ? currentNdvi
      : clamp(currentNdvi - reverseIndex * stressSignal + seasonalCurve, 0.12, 0.88);

    return {
      period: reverseIndex === 0 ? 'current' : `T-${reverseIndex}`,
      ndvi: Number(ndvi.toFixed(2)),
    };
  });
}

function buildAlerts({ crop, currentNdvi, previousNdvi, rainfall, humidity, temperature }) {
  const alerts = [];

  if (currentNdvi < previousNdvi - 0.03) {
    alerts.push({ code: 'NDVI_DECLINE', level: 'medium' });
  }

  if (rainfall < 5 && currentNdvi < 0.5) {
    alerts.push({ code: 'WATER_STRESS', level: 'high' });
  }

  if (crop === 'soybean' && humidity >= 70 && temperature >= 18 && temperature <= 28) {
    alerts.push({ code: 'SOYBEAN_RUST_RISK', level: 'high' });
  }

  if (crop === 'rice' && humidity >= 75 && temperature >= 20 && temperature <= 30) {
    alerts.push({ code: 'RICE_FUNGAL_RISK', level: 'high' });
  }

  return alerts;
}

module.exports.getNdvi = (req, res) => {
  const crop = req.query.crop === 'rice' ? 'rice' : 'soybean';
  const weather = {
    rainfall: Number(req.query.rainfall || 0),
    humidity: Number(req.query.humidity || 0),
    temperature: Number(req.query.temperature || 0),
    wind: Number(req.query.wind || 0),
  };

  const currentNdvi = estimateNdvi(weather);
  const history = buildHistory(currentNdvi, weather);
  const previousNdvi = history[history.length - 2]?.ndvi || currentNdvi;

  res.send({
    source: 'agronomic-fallback-ready-for-sentinel-hub',
    crop,
    latitude: Number(req.query.latitude || 0),
    longitude: Number(req.query.longitude || 0),
    currentNdvi,
    history,
    alerts: buildAlerts({ crop, currentNdvi, previousNdvi, ...weather }),
  });
};

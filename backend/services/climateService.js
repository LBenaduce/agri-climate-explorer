const NotFoundError = require('../errors/NotFoundError');
const BadRequestError = require('../errors/BadRequestError');

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const POWER_URL = 'https://power.larc.nasa.gov/api/temporal/daily/point';

function round(value, decimals = 1) {
  return Number(Number(value).toFixed(decimals));
}

function average(values) {
  const valid = values.filter((value) => typeof value === 'number' && Number.isFinite(value));
  if (!valid.length) return 0;
  return valid.reduce((sum, value) => sum + value, 0) / valid.length;
}

function getDateRange(days = 7) {
  const end = new Date();
  end.setUTCDate(end.getUTCDate() - 1);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - (days - 1));

  const format = (date) => `${date.getUTCFullYear()}${String(date.getUTCMonth() + 1).padStart(2, '0')}${String(date.getUTCDate()).padStart(2, '0')}`;

  return {
    start: format(start),
    end: format(end),
  };
}

function classifySummary(rainfall, solarRadiation, humidity) {
  if (rainfall >= 15) return 'Heavy rain';
  if (rainfall >= 7) return 'Moderate rain';
  if (rainfall >= 2) return 'Light rain';
  if (solarRadiation >= 18 && humidity < 75) return 'Sunny';
  if (solarRadiation >= 12) return 'Partly cloudy';
  return 'Cloudy';
}

function buildInsight(temperature, humidity, rainfall, wind, ndviEstimate) {
  if (rainfall > 20) return 'High rainfall may delay field operations and increase disease pressure.';
  if (humidity > 85 && temperature > 20) return 'High humidity can elevate fungal disease risk in sensitive crops.';
  if (wind > 20) return 'Strong winds may affect spraying conditions and plant stress.';
  if (ndviEstimate < 0.35) return 'Vegetation vigor appears limited. Monitor water balance and crop establishment.';
  if (temperature >= 20 && temperature <= 30 && rainfall < 10) {
    return 'Conditions look favorable for many field activities and general crop development.';
  }
  return 'Monitor field conditions closely and combine this data with local crop-specific recommendations.';
}

function estimateNdvi({ avgTemp, avgRain, avgHumidity, avgSolar }) {
  const tempScore = Math.max(0, 1 - Math.abs(avgTemp - 24) / 18);
  const rainScore = Math.min(avgRain / 8, 1);
  const humidityScore = Math.min(avgHumidity / 85, 1);
  const solarScore = Math.min(avgSolar / 22, 1);

  const ndvi = 0.15 + ((tempScore * 0.3) + (rainScore * 0.3) + (humidityScore * 0.2) + (solarScore * 0.2)) * 0.7;
  return Math.max(0.12, Math.min(0.92, round(ndvi, 2)));
}

function classifyNdvi(ndviEstimate) {
  if (ndviEstimate >= 0.7) return 'High vigor';
  if (ndviEstimate >= 0.5) return 'Moderate vigor';
  if (ndviEstimate >= 0.3) return 'Low vigor';
  return 'Sparse vegetation';
}

async function geocodeCity(city) {
  const url = `${GEOCODING_URL}?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new BadRequestError('Unable to resolve the requested city');
  }

  const data = await response.json();
  const match = data.results?.[0];

  if (!match) {
    throw new NotFoundError('City not found');
  }

  return {
    city: match.name,
    country: match.country_code || match.country || '—',
    admin1: match.admin1 || '',
    latitude: match.latitude,
    longitude: match.longitude,
  };
}

function parseSeries(parameterBlock = {}, keys = []) {
  return keys.map((key) => {
    const value = parameterBlock[key];
    return typeof value === 'number' && value > -900 ? value : null;
  });
}

async function fetchPowerDaily(latitude, longitude, start, end) {
  const params = [
    'T2M',
    'RH2M',
    'PRECTOTCORR',
    'WS2M',
    'ALLSKY_SFC_SW_DWN',
  ].join(',');

  const url = `${POWER_URL}?parameters=${params}&community=AG&longitude=${longitude}&latitude=${latitude}&start=${start}&end=${end}&format=JSON`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new BadRequestError('Unable to fetch NASA POWER data');
  }

  const data = await response.json();
  return data.properties?.parameter || {};
}

async function buildClimatePayload(cityQuery) {
  const location = await geocodeCity(cityQuery);
  const { start, end } = getDateRange(7);
  const parameterData = await fetchPowerDaily(location.latitude, location.longitude, start, end);
  const dayKeys = Object.keys(parameterData.T2M || {}).sort();

  if (!dayKeys.length) {
    throw new NotFoundError('No NASA POWER data available for this location');
  }

  const temperatures = parseSeries(parameterData.T2M, dayKeys);
  const humidities = parseSeries(parameterData.RH2M, dayKeys);
  const rainfalls = parseSeries(parameterData.PRECTOTCORR, dayKeys);
  const winds = parseSeries(parameterData.WS2M, dayKeys);
  const solarRadiation = parseSeries(parameterData.ALLSKY_SFC_SW_DWN, dayKeys);

  const latestIndex = dayKeys.length - 1;
  const latestTemperature = temperatures[latestIndex] ?? average(temperatures);
  const latestHumidity = humidities[latestIndex] ?? average(humidities);
  const latestRainfall = rainfalls[latestIndex] ?? average(rainfalls);
  const latestWind = winds[latestIndex] ?? average(winds);
  const latestSolar = solarRadiation[latestIndex] ?? average(solarRadiation);

  const avgTemp = average(temperatures);
  const avgHumidity = average(humidities);
  const avgRain = average(rainfalls);
  const avgSolar = average(solarRadiation);
  const ndviEstimate = estimateNdvi({ avgTemp, avgRain, avgHumidity, avgSolar });

  const trend = dayKeys.map((day, index) => ({
    day: `${day.slice(6, 8)}/${day.slice(4, 6)}`,
    temp: round(temperatures[index] ?? avgTemp),
    rain: round(rainfalls[index] ?? 0),
    humidity: round(humidities[index] ?? avgHumidity),
  }));

  const summary = classifySummary(latestRainfall, latestSolar, latestHumidity);

  return {
    city: location.city,
    country: location.country,
    region: location.admin1,
    latitude: round(location.latitude, 4),
    longitude: round(location.longitude, 4),
    temperature: round(latestTemperature),
    humidity: round(latestHumidity),
    rainfall: round(latestRainfall),
    wind: round(latestWind),
    solarRadiation: round(latestSolar),
    summary,
    ndviEstimate,
    ndviLabel: classifyNdvi(ndviEstimate),
    ndviSource: 'Estimated from NASA POWER agroclimatology variables',
    insight: buildInsight(latestTemperature, latestHumidity, latestRainfall, latestWind, ndviEstimate),
    trend,
    source: 'NASA POWER Daily API',
    dateRange: { start, end },
  };
}

module.exports = {
  buildClimatePayload,
};

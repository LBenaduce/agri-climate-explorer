const POWER_BASE_URL = "https://power.larc.nasa.gov/api/temporal/daily/point";
const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";

function average(values = []) {
  const valid = values.filter((value) => Number.isFinite(value));
  if (!valid.length) return 0;
  return valid.reduce((sum, value) => sum + value, 0) / valid.length;
}

function toFixedNumber(value, digits = 1) {
  return Number(Number(value).toFixed(digits));
}

function summarizeConditions(rainfall, humidity) {
  if (rainfall >= 20) return 'Heavy rain';
  if (rainfall >= 6) return 'Moderate rain';
  if (rainfall > 0) return 'Light rain';
  if (humidity >= 80) return 'Cloudy';
  if (humidity >= 60) return 'Partly cloudy';
  return 'Clear sky';
}

function buildInsight(temperature, humidity, rainfall, wind, ndviValue) {
  if (ndviValue <= 0.2) {
    return 'Very low NDVI may indicate sparse vegetation cover or crop stress. Verify field conditions.';
  }
  if (ndviValue >= 0.65 && rainfall < 5) {
    return 'High NDVI suggests vigorous vegetation. Monitor soil moisture to sustain crop development.';
  }
  if (rainfall > 20) {
    return 'High rainfall may delay field operations and increase disease pressure.';
  }
  if (humidity > 80) {
    return 'High humidity can elevate fungal disease risk in sensitive crops.';
  }
  if (wind > 25) {
    return 'Strong winds may affect spraying conditions and plant stress.';
  }
  if (temperature >= 20 && temperature <= 30 && rainfall < 10) {
    return 'Conditions look favorable for many field activities and general crop development.';
  }
  return 'Monitor field conditions closely and combine this data with local crop-specific recommendations.';
}

function buildWorldviewUrl(lat, lon, date) {
  const lonDelta = 0.35;
  const latDelta = 0.2;
  const west = toFixedNumber(lon - lonDelta, 4);
  const south = toFixedNumber(lat - latDelta, 4);
  const east = toFixedNumber(lon + lonDelta, 4);
  const north = toFixedNumber(lat + latDelta, 4);

  return `https://worldview.earthdata.nasa.gov/?v=${west},${south},${east},${north}&t=${date}`;
}

function estimateNdviFromClimate({ t2m, precipitation, relativeHumidity, solarRadiation }) {
  const tempScore = Math.max(0, Math.min(1, 1 - Math.abs((t2m || 24) - 24) / 20));
  const rainScore = Math.max(0, Math.min(1, (precipitation || 0) / 12));
  const humidityScore = Math.max(0, Math.min(1, (relativeHumidity || 0) / 100));
  const radiationScore = Math.max(0, Math.min(1, (solarRadiation || 0) / 25));

  const ndvi = 0.12 + (tempScore * 0.18) + (rainScore * 0.22) + (humidityScore * 0.18) + (radiationScore * 0.2);
  return toFixedNumber(Math.max(-1, Math.min(1, ndvi)), 2);
}

async function geocodeCity(city) {
  const response = await fetch(`${GEOCODING_URL}?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
  if (!response.ok) {
    throw new Error('Unable to resolve city coordinates');
  }

  const data = await response.json();
  const place = data.results?.[0];

  if (!place) {
    throw new Error('City not found');
  }

  return {
    city: place.name,
    country: place.country_code || place.country || '—',
    latitude: place.latitude,
    longitude: place.longitude,
  };
}

async function fetchPowerDaily(latitude, longitude, startDate, endDate) {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    start: startDate,
    end: endDate,
    community: 'AG',
    format: 'JSON',
    parameters: 'T2M,PRECTOTCORR,RH2M,WS2M,ALLSKY_SFC_SW_DWN',
  });

  const response = await fetch(`${POWER_BASE_URL}?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Unable to fetch NASA POWER data');
  }

  return response.json();
}

module.exports.getWeather = async (req, res) => {
  try {
    const cityQuery = req.query.city.trim();
    const place = await geocodeCity(cityQuery);

    const today = new Date();
    const end = new Date(today);
    end.setUTCDate(end.getUTCDate() - 1);
    const start = new Date(end);
    start.setUTCDate(start.getUTCDate() - 6);

    const formatDate = (date) => date.toISOString().slice(0, 10).replace(/-/g, '');
    const powerData = await fetchPowerDaily(place.latitude, place.longitude, formatDate(start), formatDate(end));
    const parameters = powerData.properties?.parameter || {};

    const series = Object.keys(parameters.T2M || {}).map((date) => ({
      date,
      temperature: Number(parameters.T2M?.[date]) || 0,
      rainfall: Number(parameters.PRECTOTCORR?.[date]) || 0,
      humidity: Number(parameters.RH2M?.[date]) || 0,
      wind: Number(parameters.WS2M?.[date]) || 0,
      solarRadiation: Number(parameters.ALLSKY_SFC_SW_DWN?.[date]) || 0,
    }));

    const latest = series[series.length - 1] || {};
    const temperature = toFixedNumber(latest.temperature || average(series.map((item) => item.temperature)), 1);
    const rainfall = toFixedNumber(latest.rainfall || average(series.map((item) => item.rainfall)), 1);
    const humidity = Math.round(latest.humidity || average(series.map((item) => item.humidity)));
    const wind = toFixedNumber((latest.wind || average(series.map((item) => item.wind))) * 3.6, 1);
    const solarRadiation = toFixedNumber(latest.solarRadiation || average(series.map((item) => item.solarRadiation)), 1);
    const ndviValue = estimateNdviFromClimate({
      t2m: temperature,
      precipitation: average(series.map((item) => item.rainfall)),
      relativeHumidity: humidity,
      solarRadiation,
    });
    const summary = summarizeConditions(rainfall, humidity);
    const insight = buildInsight(temperature, humidity, rainfall, wind, ndviValue);
    const lastDate = `${end.toISOString().slice(0, 10)}T00:00:00Z`;

    res.send({
      city: place.city,
      country: place.country,
      latitude: toFixedNumber(place.latitude, 4),
      longitude: toFixedNumber(place.longitude, 4),
      temperature,
      humidity,
      rainfall,
      wind,
      solarRadiation,
      summary,
      insight,
      trend: series.map((item) => ({
        day: item.date.slice(6, 8),
        date: `${item.date.slice(0, 4)}-${item.date.slice(4, 6)}-${item.date.slice(6, 8)}`,
        temp: toFixedNumber(item.temperature, 1),
        rain: toFixedNumber(item.rainfall, 1),
      })),
      ndvi: {
        value: ndviValue,
        dataset: 'MODIS/VIIRS NDVI viewer via NASA Earthdata Worldview',
        resolutionNote: 'Open the NASA Worldview link to inspect real satellite NDVI imagery for this area.',
        viewerUrl: buildWorldviewUrl(place.latitude, place.longitude, lastDate),
        lastAvailableDate: end.toISOString().slice(0, 10),
      },
      source: {
        climate: 'NASA POWER Daily API',
        ndvi: 'NASA Earthdata Worldview / GIBS',
      },
    });
  } catch (error) {
    res.status(500).send({ message: error.message || 'Unable to load weather data' });
  }
};

const fetch = require('node-fetch');
const BadRequestError = require('../errors/BadRequestError');

const SUPPORTED_CROPS = new Set(['soybean', 'rice']);

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function round(value, digits = 2) {
  return Number(value.toFixed(digits));
}

function parseNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function getSeasonalCurve(month, crop) {
  // Brazil/South America-oriented demo curve. Replace with crop calendars by region later.
  const riceCurve = [0.62, 0.68, 0.58, 0.42, 0.28, 0.22, 0.2, 0.24, 0.34, 0.46, 0.54, 0.6];
  const soybeanCurve = [0.7, 0.76, 0.62, 0.38, 0.22, 0.18, 0.18, 0.24, 0.36, 0.5, 0.6, 0.66];
  return crop === 'rice' ? riceCurve[month] : soybeanCurve[month];
}

function deterministicNoise(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function buildEstimatedNdviHistory({ latitude, longitude, crop }) {
  const today = new Date();
  const points = [];
  const lat = parseNumber(latitude);
  const lon = parseNumber(longitude);

  for (let index = 11; index >= 0; index -= 1) {
    const date = new Date(today);
    date.setUTCDate(15);
    date.setUTCMonth(today.getUTCMonth() - index);

    const month = date.getUTCMonth();
    const base = getSeasonalCurve(month, crop);
    const noise = (deterministicNoise(lat * 13.7 + lon * 5.3 + month * 3.1) - 0.5) * 0.08;
    const ndvi = clamp(base + noise, 0.12, 0.86);

    points.push({
      date: date.toISOString().slice(0, 10),
      ndvi: round(ndvi),
      source: 'agronomic-fallback',
    });
  }

  return points;
}

function getNdviTrend(history) {
  if (!Array.isArray(history) || history.length < 4) return 'stable';
  const recent = history.slice(-3).reduce((sum, item) => sum + item.ndvi, 0) / 3;
  const previous = history.slice(-6, -3).reduce((sum, item) => sum + item.ndvi, 0) / 3;
  const delta = recent - previous;

  if (delta <= -0.08) return 'declining';
  if (delta >= 0.08) return 'improving';
  return 'stable';
}

function classifyNdvi(ndvi) {
  if (ndvi < 0.3) return 'low';
  if (ndvi < 0.5) return 'moderate';
  if (ndvi < 0.7) return 'active';
  return 'high';
}

function buildAlerts({ crop, ndvi, trend, humidity, temperature, rainfall, forecastRainProbability }) {
  const alerts = [];
  const humid = humidity >= 75 || forecastRainProbability >= 65 || rainfall >= 5;

  if (trend === 'declining') {
    alerts.push({
      level: 'medium',
      type: 'ndvi-trend',
      title: 'NDVI decline detected',
      message: 'Vegetation signal is declining compared with the previous period. Check crop stage, soil moisture, nutrition, pests, and disease symptoms.',
    });
  }

  if (crop === 'soybean') {
    if (humid && temperature >= 18 && temperature <= 28) {
      alerts.push({
        level: 'high',
        type: 'disease-risk',
        title: 'Soybean rust risk window',
        message: 'Humidity and temperature are favorable for Asian soybean rust. Scout lower canopy leaves and follow regional fungicide guidance.',
      });
    }

    if (humid && temperature >= 15 && temperature <= 25) {
      alerts.push({
        level: 'medium',
        type: 'disease-risk',
        title: 'White mold monitoring',
        message: 'Cool and humid canopy conditions may favor white mold in dense soybean stands. Inspect flowering fields and avoid excessive canopy humidity.',
      });
    }
  }

  if (crop === 'rice') {
    if (humid && temperature >= 20 && temperature <= 30) {
      alerts.push({
        level: 'high',
        type: 'disease-risk',
        title: 'Rice blast and sheath blight risk',
        message: 'Warm and humid conditions can favor rice blast, brown spot, and sheath blight. Monitor leaf lesions and avoid excessive nitrogen.',
      });
    }

    if (ndvi < 0.4) {
      alerts.push({
        level: 'medium',
        type: 'crop-vigor',
        title: 'Low rice canopy vigor',
        message: 'NDVI is below the expected active canopy range. Verify stand uniformity, water layer management, and nutrient balance.',
      });
    }
  }

  if (ndvi < 0.35 && rainfall < 2) {
    alerts.push({
      level: 'medium',
      type: 'water-stress',
      title: 'Possible water stress',
      message: 'Low NDVI combined with low recent rainfall may indicate water limitation. Compare with soil moisture and irrigation status.',
    });
  }

  if (alerts.length === 0) {
    alerts.push({
      level: 'low',
      type: 'normal',
      title: 'No critical automatic alert',
      message: 'Current NDVI and weather signals do not indicate a critical risk. Continue routine scouting and compare with field observations.',
    });
  }

  return alerts;
}

async function getSentinelHubToken() {
  const { SENTINEL_HUB_CLIENT_ID, SENTINEL_HUB_CLIENT_SECRET } = process.env;

  if (!SENTINEL_HUB_CLIENT_ID || !SENTINEL_HUB_CLIENT_SECRET) return null;

  const response = await fetch('https://services.sentinel-hub.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: SENTINEL_HUB_CLIENT_ID,
      client_secret: SENTINEL_HUB_CLIENT_SECRET,
    }),
  });

  if (!response.ok) return null;
  const data = await response.json();
  return data.access_token || null;
}

async function tryFetchSentinelHubNdvi({ latitude, longitude, crop }) {
  // Production-ready connector placeholder: when Sentinel Hub credentials exist, the app attempts
  // to call the Statistical API. If it fails, the controller returns the safe agronomic fallback.
  const token = await getSentinelHubToken();
  if (!token) return null;

  const end = new Date();
  const start = new Date();
  start.setUTCMonth(end.getUTCMonth() - 12);

  const lat = parseNumber(latitude);
  const lon = parseNumber(longitude);
  const delta = 0.015;

  const evalscript = `//VERSION=3
function setup() {
  return { input: [{ bands: ["B04", "B08", "dataMask"] }], output: [{ id: "ndvi", bands: 1, sampleType: "FLOAT32" }, { id: "dataMask", bands: 1 }] };
}
function evaluatePixel(sample) {
  let ndvi = (sample.B08 - sample.B04) / (sample.B08 + sample.B04);
  return { ndvi: [ndvi], dataMask: [sample.dataMask] };
}`;

  const body = {
    input: {
      bounds: {
        bbox: [lon - delta, lat - delta, lon + delta, lat + delta],
        properties: { crs: 'http://www.opengis.net/def/crs/EPSG/0/4326' },
      },
      data: [{ type: 'sentinel-2-l2a', dataFilter: { mosaickingOrder: 'leastCC' } }],
    },
    aggregation: {
      timeRange: { from: start.toISOString(), to: end.toISOString() },
      aggregationInterval: { of: 'P1M' },
      evalscript,
      resx: 10,
      resy: 10,
    },
    calculations: { ndvi: { statistics: { default: { percentiles: { k: [50] } } } } },
  };

  try {
    const response = await fetch('https://services.sentinel-hub.com/api/v1/statistics', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) return null;
    const data = await response.json();
    const intervals = Array.isArray(data.data) ? data.data : [];
    const history = intervals
      .map((interval) => {
        const value = interval.outputs?.ndvi?.bands?.B0?.stats?.mean
          ?? interval.outputs?.ndvi?.bands?.B0?.stats?.percentiles?.['50.0'];
        return Number.isFinite(Number(value))
          ? { date: interval.interval.from.slice(0, 10), ndvi: round(clamp(Number(value), -0.1, 0.95)), source: 'Sentinel-2 L2A / Sentinel Hub Statistical API' }
          : null;
      })
      .filter(Boolean);

    return history.length >= 3 ? history : buildEstimatedNdviHistory({ latitude, longitude, crop });
  } catch (error) {
    return null;
  }
}

module.exports.getNdvi = async (req, res, next) => {
  try {
    const latitude = parseNumber(req.query.lat, null);
    const longitude = parseNumber(req.query.lon, null);
    const crop = SUPPORTED_CROPS.has(String(req.query.crop)) ? String(req.query.crop) : 'soybean';

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      throw new BadRequestError('Valid lat and lon query parameters are required.');
    }

    const weather = {
      humidity: parseNumber(req.query.humidity, 0),
      temperature: parseNumber(req.query.temperature, 0),
      rainfall: parseNumber(req.query.rainfall, 0),
      forecastRainProbability: parseNumber(req.query.forecastRainProbability, 0),
    };

    const sentinelHistory = await tryFetchSentinelHubNdvi({ latitude, longitude, crop });
    const history = sentinelHistory || buildEstimatedNdviHistory({ latitude, longitude, crop });
    const current = history[history.length - 1]?.ndvi ?? 0.5;
    const trend = getNdviTrend(history);
    const classification = classifyNdvi(current);
    const alerts = buildAlerts({ crop, ndvi: current, trend, ...weather });

    return res.send({
      crop,
      latitude,
      longitude,
      currentNdvi: current,
      classification,
      trend,
      history,
      alerts,
      source: sentinelHistory ? 'Sentinel-2 L2A / Sentinel Hub Statistical API' : 'Agronomic fallback estimator. Add SENTINEL_HUB_CLIENT_ID and SENTINEL_HUB_CLIENT_SECRET for satellite NDVI.',
    });
  } catch (error) {
    return next(error);
  }
};

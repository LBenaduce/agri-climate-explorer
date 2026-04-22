const fetch = require('node-fetch');
const BadRequestError = require('../errors/BadRequestError');
const NotFoundError = require('../errors/NotFoundError');
const COUNTRY_ALIASES = {
  US: 'US',
  USA: 'US',
  'UNITED STATES': 'US',
  'UNITED STATES OF AMERICA': 'US',
  BR: 'BR',
  BRAZIL: 'BR',
  BRASIL: 'BR',
  CA: 'CA',
  CANADA: 'CA',
  AU: 'AU',
  AUSTRALIA: 'AU',
  GB: 'GB',
  UK: 'GB',
  'UNITED KINGDOM': 'GB',
  FR: 'FR',
  FRANCE: 'FR',
  DE: 'DE',
  GERMANY: 'DE',
  IT: 'IT',
  ITALY: 'IT',
  ES: 'ES',
  SPAIN: 'ES',
  AR: 'AR',
  ARGENTINA: 'AR',
  MX: 'MX',
  MEXICO: 'MX',
};

const REGION_ALIASES = {
  US: {
    AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
    CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', FL: 'Florida', GA: 'Georgia',
    HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa', KS: 'Kansas',
    KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland', MA: 'Massachusetts',
    MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri', MT: 'Montana',
    NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey', NM: 'New Mexico',
    NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio', OK: 'Oklahoma',
    OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina',
    SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont',
    VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming',
    DC: 'District of Columbia',
  },
  BR: {
    AC: 'Acre', AL: 'Alagoas', AP: 'Amapa', AM: 'Amazonas', BA: 'Bahia', CE: 'Ceara',
    DF: 'Distrito Federal', ES: 'Espirito Santo', GO: 'Goias', MA: 'Maranhao', MT: 'Mato Grosso',
    MS: 'Mato Grosso do Sul', MG: 'Minas Gerais', PA: 'Para', PB: 'Paraiba', PR: 'Parana',
    PE: 'Pernambuco', PI: 'Piaui', RJ: 'Rio de Janeiro', RN: 'Rio Grande do Norte',
    RS: 'Rio Grande do Sul', RO: 'Rondonia', RR: 'Roraima', SC: 'Santa Catarina',
    SP: 'Sao Paulo', SE: 'Sergipe', TO: 'Tocantins',
  },
  CA: {
    AB: 'Alberta', BC: 'British Columbia', MB: 'Manitoba', NB: 'New Brunswick',
    NL: 'Newfoundland and Labrador', NS: 'Nova Scotia', NT: 'Northwest Territories',
    NU: 'Nunavut', ON: 'Ontario', PE: 'Prince Edward Island', QC: 'Quebec',
    SK: 'Saskatchewan', YT: 'Yukon',
  },
  AU: {
    ACT: 'Australian Capital Territory', NSW: 'New South Wales', NT: 'Northern Territory',
    QLD: 'Queensland', SA: 'South Australia', TAS: 'Tasmania', VIC: 'Victoria', WA: 'Western Australia',
  },
};

const BRAZIL_HINTS = new Set([
  'acre', 'alagoas', 'amapa', 'amazonas', 'bahia', 'brasil', 'brazil', 'ceara',
  'distrito federal', 'espirito santo', 'goias', 'maranhao', 'mato grosso',
  'mato grosso do sul', 'minas gerais', 'para', 'paraiba', 'parana', 'pernambuco',
  'piaui', 'rio de janeiro', 'rio grande do norte', 'rio grande do sul', 'rondonia',
  'roraima', 'santa catarina', 'sao paulo', 'sergipe', 'tocantins',
]);

function normalizeText(value = '') {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\./g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function normalizeCountry(value = '') {
  const key = normalizeText(value).toUpperCase();
  return COUNTRY_ALIASES[key] || key;
}

function normalizeRegion(value = '', countryCode = '') {
  const trimmed = String(value).trim();
  if (!trimmed) return '';
  const key = trimmed.toUpperCase();
  return REGION_ALIASES[countryCode]?.[key] || trimmed;
}

function parseLocationInput(rawCity = '') {
  const parts = String(rawCity)
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

  const city = parts[0] || '';
  let region = '';
  let countryCode = '';

  if (parts.length === 2) {
    const maybeCountryAliasKey = normalizeText(parts[1]).toUpperCase();
    const maybeCountry = normalizeCountry(parts[1]);

    if (COUNTRY_ALIASES[maybeCountryAliasKey]) {
      countryCode = maybeCountry;
    } else {
      region = parts[1];
    }
  } else if (parts.length >= 3) {
    countryCode = normalizeCountry(parts[2]);
    region = parts[1];
  }

  region = normalizeRegion(region, countryCode);

  return { city, region, countryCode };
}

function detectPreferredCountries(parsed, req) {
  if (parsed.countryCode) return [parsed.countryCode];

  const candidates = [];
  const normalizedInput = normalizeText(`${parsed.city}, ${parsed.region}`);
  const preferredCountryHeader = normalizeCountry(req.headers['x-country-code'] || '');
  const acceptLanguage = String(req.headers['accept-language'] || '').toLowerCase();
  const hasAccents = /[\u00C0-\u017F]/.test(`${parsed.city} ${parsed.region}`);

  if (preferredCountryHeader) candidates.push(preferredCountryHeader);

  if (
    hasAccents ||
    acceptLanguage.includes('pt-br') ||
    acceptLanguage.includes('pt') ||
    BRAZIL_HINTS.has(normalizedInput) ||
    BRAZIL_HINTS.has(normalizeText(parsed.region))
  ) {
    candidates.push('BR');
  }

  if (acceptLanguage.includes('en-us')) candidates.push('US');
  if (acceptLanguage.includes('en-gb')) candidates.push('GB');
  if (acceptLanguage.includes('es-ar')) candidates.push('AR');

  candidates.push('');

  return [...new Set(candidates)];
}

function matchesExactCity(resultName, requestedCity) {
  return normalizeText(resultName) === normalizeText(requestedCity);
}

function matchesCloseCity(resultName, requestedCity) {
  const result = normalizeText(resultName);
  const requested = normalizeText(requestedCity);
  return result === requested || result.startsWith(requested) || requested.startsWith(result);
}

function matchesCountry(result, countryCode) {
  if (!countryCode) return true;
  const resultCode = normalizeCountry(result.country_code || result.country || '');
  return resultCode === countryCode;
}

function matchesRegion(result, region, countryCode) {
  if (!region) return true;
  const target = normalizeText(normalizeRegion(region, countryCode));
  return [result.admin1, result.admin2, result.admin3, result.admin4]
    .filter(Boolean)
    .some((part) => normalizeText(part) === target);
}

function chooseBestResult(results, parsed, countryCode) {
  const exactCityMatches = results.filter((result) => matchesExactCity(result.name, parsed.city));
  const closeCityMatches = exactCityMatches.length > 0
    ? exactCityMatches
    : results.filter((result) => matchesCloseCity(result.name, parsed.city));

  if (closeCityMatches.length === 0) return null;

  const countryMatches = closeCityMatches.filter((result) => matchesCountry(result, countryCode));
  if (countryMatches.length === 0) return null;

  const narrowed = parsed.region
    ? countryMatches.filter((result) => matchesRegion(result, parsed.region, countryCode))
    : countryMatches;

  if (parsed.region && narrowed.length === 0) return null;

  return narrowed
    .sort((a, b) => (b.population || 0) - (a.population || 0))[0] || null;
}

async function geocodeCity(rawCity, req) {
  const parsed = parseLocationInput(rawCity);

  if (!parsed.city || normalizeText(parsed.city).length < 2) {
    throw new BadRequestError('City is required.');
  }

  const response = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(parsed.city)}&count=100&language=en&format=json`
  );

  if (!response.ok) {
    throw new Error('Unable to reach geocoding service.');
  }

  const data = await response.json();
  const results = Array.isArray(data.results) ? data.results : [];

  if (results.length === 0) {
    throw new NotFoundError('City not found.');
  }

  const countryCandidates = detectPreferredCountries(parsed, req);

  for (const countryCode of countryCandidates) {
    const match = chooseBestResult(results, parsed, countryCode);
    if (match) return match;
  }

  throw new NotFoundError('City not found with the provided location details.');
}

async function getOpenMeteoWeather(latitude, longitude) {
  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,rain,apparent_temperature,cloud_cover,precipitation_probability&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,et0_fao_evapotranspiration&timezone=auto&forecast_days=3`
  );

  if (!response.ok) {
    throw new Error('Unable to fetch weather data.');
  }

  const data = await response.json();
  const current = data.current || {};
  const daily = data.daily || {};

  return {
    temperature: Number(current.temperature_2m ?? 0),
    apparentTemperature: Number(current.apparent_temperature ?? current.temperature_2m ?? 0),
    humidity: Number(current.relative_humidity_2m ?? 0),
    rainfall: Number(current.rain ?? 0),
    wind: Number(current.wind_speed_10m ?? 0),
    cloudCover: Number(current.cloud_cover ?? 0),
    precipitationProbability: Number(current.precipitation_probability ?? 0),
    forecastRainTotal: Number(daily.precipitation_sum?.[0] ?? 0),
    forecastRainProbability: Number(daily.precipitation_probability_max?.[0] ?? 0),
    forecastMaxTemp: Number(daily.temperature_2m_max?.[0] ?? current.temperature_2m ?? 0),
    forecastMinTemp: Number(daily.temperature_2m_min?.[0] ?? current.temperature_2m ?? 0),
    evapotranspiration: Number(daily.et0_fao_evapotranspiration?.[0] ?? 0),
  };
}

function buildInsight(weather) {
  const insights = [];
  const actions = [];

  if (weather.forecastRainTotal >= 20 || weather.forecastRainProbability >= 70) {
    insights.push('Wet conditions are likely over the next 24 hours, which may slow machinery access and raise fungal pressure.');
    actions.push('Avoid spraying or harvesting during the wettest window and review drainage-sensitive fields.');
  } else if (weather.rainfall <= 0.5 && weather.evapotranspiration >= 4) {
    insights.push('Moisture loss is elevated relative to rainfall, suggesting rising short-term water stress risk.');
    actions.push('Check irrigation timing, soil moisture, and young plants with shallow root systems.');
  }

  if (weather.humidity >= 85 && weather.temperature >= 18 && weather.temperature <= 30) {
    insights.push('Warm and humid weather can favor foliar disease development in sensitive crops.');
    actions.push('Increase scouting frequency for fungal symptoms and avoid creating extra canopy humidity.');
  }

  if (weather.wind >= 25) {
    insights.push('Strong wind may reduce spray accuracy and increase lodging or mechanical stress in taller crops.');
    actions.push('Postpone spraying and inspect exposed fields, trellised crops, and windbreaks.');
  } else if (weather.wind >= 15) {
    insights.push('Moderate wind may still affect pesticide drift and application uniformity.');
    actions.push('Use caution with spraying and verify nozzle setup and field direction.');
  }

  if (weather.forecastMaxTemp >= 32) {
    insights.push('Heat stress risk is rising for crops, livestock, and recently transplanted seedlings.');
    actions.push('Prioritize irrigation, shade, and field work in cooler hours where possible.');
  } else if (weather.forecastMinTemp <= 5) {
    insights.push('Cool overnight temperatures may slow growth and increase stress in cold-sensitive crops.');
    actions.push('Monitor vulnerable crops and protect nurseries, seedlings, and high-value horticulture.');
  }

  if (insights.length === 0) {
    insights.push('Current conditions look relatively manageable for routine field operations in many cropping systems.');
    actions.push('Keep monitoring local forecasts, field trafficability, and crop-specific thresholds before major operations.');
  }

  return {
    headline: insights[0],
    details: insights.slice(1),
    recommendations: actions,
    riskLevel:
      weather.forecastRainTotal >= 20 || weather.wind >= 25 || weather.forecastMaxTemp >= 32
        ? 'high'
        : (weather.humidity >= 85 || weather.evapotranspiration >= 4 || weather.wind >= 15)
          ? 'moderate'
          : 'low',
  };
}

function buildSummary(weather) {
  if (weather.rainfall > 0 || weather.forecastRainProbability >= 60) return 'Rain likely';
  if (weather.cloudCover >= 70) return 'Mostly cloudy';
  if (weather.wind >= 20) return 'Windy';
  return 'Partly cloudy';
}

module.exports.getWeather = async (req, res, next) => {
  try {
    const location = await geocodeCity(req.query.city, req);
    const weather = await getOpenMeteoWeather(location.latitude, location.longitude);
    const agriculturalInsight = buildInsight(weather);

    return res.send({
      city: location.name,
      state: location.admin1 || '',
      country: normalizeCountry(location.country_code || location.country || ''),
      latitude: location.latitude,
      longitude: location.longitude,
      temperature: weather.temperature,
      apparentTemperature: weather.apparentTemperature,
      humidity: weather.humidity,
      rainfall: weather.rainfall,
      wind: weather.wind,
      cloudCover: weather.cloudCover,
      precipitationProbability: weather.precipitationProbability,
      forecastRainTotal: weather.forecastRainTotal,
      forecastRainProbability: weather.forecastRainProbability,
      forecastMaxTemp: weather.forecastMaxTemp,
      forecastMinTemp: weather.forecastMinTemp,
      evapotranspiration: weather.evapotranspiration,
      summary: buildSummary(weather),
      insight: agriculturalInsight.headline,
      insightDetails: agriculturalInsight.details,
      recommendations: agriculturalInsight.recommendations,
      riskLevel: agriculturalInsight.riskLevel,
      source: 'Open-Meteo Geocoding + Open-Meteo Current Weather + 3-day forecast',
    });
  } catch (error) {
    return next(error);
  }
};

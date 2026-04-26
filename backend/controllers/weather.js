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

const SUPPORTED_LANGUAGES = ['en', 'pt', 'es', 'fr', 'de', 'it', 'ru', 'zh', 'ja', 'ar', 'hi'];

const localizedText = {
  en: {
    rainLikely: 'Rain likely',
    mostlyCloudy: 'Mostly cloudy',
    windy: 'Windy',
    partlyCloudy: 'Partly cloudy',
    wetHeadline: 'Wet conditions are likely over the next 24 hours, which may slow machinery access and raise fungal pressure.',
    wetAction: 'Avoid spraying or harvesting during the wettest window and review drainage-sensitive fields.',
    waterStressHeadline: 'Moisture loss is elevated relative to rainfall, suggesting rising short-term water stress risk.',
    waterStressAction: 'Check irrigation timing, soil moisture, and young plants with shallow root systems.',
    diseaseHeadline: 'Warm and humid weather can favor foliar disease development in sensitive crops.',
    diseaseAction: 'Increase scouting frequency for fungal symptoms and avoid creating extra canopy humidity.',
    strongWindHeadline: 'Strong wind may reduce spray accuracy and increase lodging or mechanical stress in taller crops.',
    strongWindAction: 'Postpone spraying and inspect exposed fields, trellised crops, and windbreaks.',
    moderateWindHeadline: 'Moderate wind may still affect pesticide drift and application uniformity.',
    moderateWindAction: 'Use caution with spraying and verify nozzle setup and field direction.',
    heatHeadline: 'Heat stress risk is rising for crops, livestock, and recently transplanted seedlings.',
    heatAction: 'Prioritize irrigation, shade, and field work in cooler hours where possible.',
    coldHeadline: 'Cool overnight temperatures may slow growth and increase stress in cold-sensitive crops.',
    coldAction: 'Monitor vulnerable crops and protect nurseries, seedlings, and high-value horticulture.',
    manageableHeadline: 'Current conditions look relatively manageable for routine field operations in many cropping systems.',
    manageableAction: 'Keep monitoring local forecasts, field trafficability, and crop-specific thresholds before major operations.',
  },
  pt: {
    rainLikely: 'Chuva provável',
    mostlyCloudy: 'Predominantemente nublado',
    windy: 'Ventoso',
    partlyCloudy: 'Parcialmente nublado',
    wetHeadline: 'Condições úmidas são prováveis nas próximas 24 horas, podendo dificultar o acesso de máquinas e aumentar a pressão de fungos.',
    wetAction: 'Evite pulverizar ou colher na janela mais úmida e revise áreas sensíveis à drenagem.',
    waterStressHeadline: 'A perda de umidade está elevada em relação à chuva, indicando maior risco de estresse hídrico no curto prazo.',
    waterStressAction: 'Verifique o manejo da irrigação, a umidade do solo e plantas jovens com raízes rasas.',
    diseaseHeadline: 'Clima quente e úmido pode favorecer doenças foliares em culturas sensíveis.',
    diseaseAction: 'Aumente a frequência de monitoramento para sintomas fúngicos e evite elevar a umidade do dossel.',
    strongWindHeadline: 'Vento forte pode reduzir a precisão da pulverização e aumentar estresse mecânico em culturas mais altas.',
    strongWindAction: 'Adie pulverizações e inspecione áreas expostas, culturas tutoradas e quebra-ventos.',
    moderateWindHeadline: 'Vento moderado ainda pode afetar deriva de defensivos e uniformidade de aplicação.',
    moderateWindAction: 'Tenha cautela com pulverizações e verifique bicos, pressão e direção do vento.',
    heatHeadline: 'O risco de estresse por calor está aumentando para culturas, animais e mudas recém-transplantadas.',
    heatAction: 'Priorize irrigação, sombra e trabalhos de campo em horários mais frescos quando possível.',
    coldHeadline: 'Temperaturas baixas durante a noite podem desacelerar o crescimento e aumentar estresse em culturas sensíveis ao frio.',
    coldAction: 'Monitore culturas vulneráveis e proteja viveiros, mudas e horticultura de alto valor.',
    manageableHeadline: 'As condições atuais parecem relativamente manejáveis para operações de rotina em muitos sistemas de cultivo.',
    manageableAction: 'Continue monitorando previsões locais, trafegabilidade do solo e limites específicos da cultura antes de operações importantes.',
  },
  es: {
    rainLikely: 'Lluvia probable', mostlyCloudy: 'Mayormente nublado', windy: 'Ventoso', partlyCloudy: 'Parcialmente nublado',
    wetHeadline: 'Es probable que haya condiciones húmedas en las próximas 24 horas, lo que puede retrasar el acceso de maquinaria y aumentar la presión fúngica.',
    wetAction: 'Evita pulverizar o cosechar durante la ventana más húmeda y revisa los campos sensibles al drenaje.',
    waterStressHeadline: 'La pérdida de humedad es elevada respecto a la lluvia, lo que sugiere mayor riesgo de estrés hídrico a corto plazo.',
    waterStressAction: 'Revisa el riego, la humedad del suelo y las plantas jóvenes con raíces superficiales.',
    diseaseHeadline: 'El clima cálido y húmedo puede favorecer enfermedades foliares en cultivos sensibles.',
    diseaseAction: 'Aumenta el monitoreo de síntomas fúngicos y evita crear más humedad en el dosel.',
    strongWindHeadline: 'El viento fuerte puede reducir la precisión de la pulverización y aumentar el estrés mecánico.',
    strongWindAction: 'Pospón pulverizaciones e inspecciona campos expuestos y cortinas rompeviento.',
    moderateWindHeadline: 'El viento moderado aún puede afectar la deriva y la uniformidad de aplicación.',
    moderateWindAction: 'Usa cautela al pulverizar y verifica boquillas, presión y dirección del viento.',
    heatHeadline: 'El riesgo de estrés térmico está aumentando para cultivos, ganado y plántulas.',
    heatAction: 'Prioriza riego, sombra y trabajo de campo en horas más frescas.',
    coldHeadline: 'Las bajas temperaturas nocturnas pueden ralentizar el crecimiento de cultivos sensibles.',
    coldAction: 'Monitorea cultivos vulnerables y protege viveros y plántulas.',
    manageableHeadline: 'Las condiciones actuales parecen manejables para operaciones de rutina en muchos sistemas de cultivo.',
    manageableAction: 'Sigue monitoreando pronósticos locales y umbrales específicos del cultivo antes de operaciones importantes.',
  },
};

function getLanguage(req) {
  const requested = String(req.query.lang || req.headers['accept-language'] || 'en')
    .split(',')[0]
    .split('-')[0]
    .toLowerCase();

  return SUPPORTED_LANGUAGES.includes(requested) ? requested : 'en';
}

function textFor(language) {
  return localizedText[language] || localizedText.en;
}

function buildInsight(weather, language = 'en') {
  const text = textFor(language);
  const insights = [];
  const actions = [];

  if (weather.forecastRainTotal >= 20 || weather.forecastRainProbability >= 70) {
    insights.push(text.wetHeadline);
    actions.push(text.wetAction);
  } else if (weather.rainfall <= 0.5 && weather.evapotranspiration >= 4) {
    insights.push(text.waterStressHeadline);
    actions.push(text.waterStressAction);
  }

  if (weather.humidity >= 85 && weather.temperature >= 18 && weather.temperature <= 30) {
    insights.push(text.diseaseHeadline);
    actions.push(text.diseaseAction);
  }

  if (weather.wind >= 25) {
    insights.push(text.strongWindHeadline);
    actions.push(text.strongWindAction);
  } else if (weather.wind >= 15) {
    insights.push(text.moderateWindHeadline);
    actions.push(text.moderateWindAction);
  }

  if (weather.forecastMaxTemp >= 32) {
    insights.push(text.heatHeadline);
    actions.push(text.heatAction);
  } else if (weather.forecastMinTemp <= 5) {
    insights.push(text.coldHeadline);
    actions.push(text.coldAction);
  }

  if (insights.length === 0) {
    insights.push(text.manageableHeadline);
    actions.push(text.manageableAction);
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

function buildSummary(weather, language = 'en') {
  const text = textFor(language);

  if (weather.rainfall > 0 || weather.forecastRainProbability >= 60) return text.rainLikely;
  if (weather.cloudCover >= 70) return text.mostlyCloudy;
  if (weather.wind >= 20) return text.windy;
  return text.partlyCloudy;
}

module.exports.getWeather = async (req, res, next) => {
  try {
    const language = getLanguage(req);
    const location = await geocodeCity(req.query.city, req);
    const weather = await getOpenMeteoWeather(location.latitude, location.longitude);
    const agriculturalInsight = buildInsight(weather, language);

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
      summary: buildSummary(weather, language),
      insight: agriculturalInsight.headline,
      insightDetails: agriculturalInsight.details,
      recommendations: agriculturalInsight.recommendations,
      riskLevel: agriculturalInsight.riskLevel,
      language,
      source: 'Open-Meteo Geocoding + Open-Meteo Current Weather + 3-day forecast',
    });
  } catch (error) {
    return next(error);
  }
};

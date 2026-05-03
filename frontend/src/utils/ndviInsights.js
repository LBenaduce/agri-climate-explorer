const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const cropCatalog = {
  soybean: {
    labelKey: "cropSoybean",
    icon: "🌱",
    benchmark: { min: 3.0, max: 3.8, high: 4.5, unit: "t/ha" },
    defaultName: "Soybean",
    descriptionKey: "cropSoybeanDescription",
    defaultDescription:
      "Soybean monitoring should combine NDVI trend, rainfall, canopy humidity, and disease scouting during vegetative and reproductive stages.",
    diseaseRiskTitleKey: "soyDiseaseRiskTitle",
    defaultDiseaseRiskTitle: "Soybean disease monitoring",
    diseaseRiskTextKey: "soyDiseaseRiskText",
    defaultDiseaseRiskText:
      "Track Asian soybean rust, target spot, anthracnose, white mold, powdery mildew, and late-season diseases. Risk increases with leaf wetness, high humidity, closed canopy, and mild temperatures.",
    scoutKey: "soyScoutRecommendation",
    defaultScout:
      "Scout the lower canopy, monitor regional rust alerts, check leaf spots and white mold symptoms, and follow local fungicide recommendations when risk is high.",
    diseases: ["soyDiseaseRust", "soyDiseasePowderyMildew", "soyDiseaseTargetSpot", "soyDiseaseAnthracnose", "soyDiseaseWhiteMold", "soyDiseaseLateSeason"],
    diseaseFallbacks: ["Asian soybean rust", "Powdery mildew", "Target spot", "Anthracnose", "White mold", "Late-season diseases"],
  },
  rice: {
    labelKey: "cropRice",
    icon: "🌾",
    benchmark: { min: 7.0, max: 9.5, high: 10.5, unit: "t/ha" },
    defaultName: "Rice",
    descriptionKey: "cropRiceDescription",
    defaultDescription:
      "Rice depends on water management, nitrogen balance, canopy development, and continuous monitoring of fungal diseases.",
    diseaseRiskTitleKey: "riceDiseaseRiskTitle",
    defaultDiseaseRiskTitle: "Rice disease monitoring",
    diseaseRiskTextKey: "riceDiseaseRiskText",
    defaultDiseaseRiskText:
      "Track blast, brown spot, sheath blight, leaf scald, and grain spots. Risk increases with high humidity, warm temperatures, dense canopy, and excessive nitrogen.",
    scoutKey: "riceScoutRecommendation",
    defaultScout:
      "Scout leaves and panicles, verify water uniformity, avoid excessive nitrogen, and follow local fungicide recommendations when symptoms or alerts are present.",
    diseases: ["riceDiseaseBlast", "riceDiseaseBrownSpot", "riceDiseaseLeafScald", "riceDiseaseSheathBlight", "riceDiseaseGrainSpot"],
    diseaseFallbacks: ["Rice blast", "Brown spot", "Leaf scald", "Sheath blight", "Grain spots"],
  },
  corn: {
    labelKey: "cropCorn",
    icon: "🌽",
    benchmark: { min: 6.0, max: 10.0, high: 12.0, unit: "t/ha" },
    defaultName: "Corn / Maize",
    descriptionKey: "cropCornDescription",
    defaultDescription:
      "Corn monitoring should focus on NDVI uniformity, water availability, nitrogen status, heat stress, and foliar disease pressure.",
    diseaseRiskTitleKey: "cornDiseaseRiskTitle",
    defaultDiseaseRiskTitle: "Corn disease monitoring",
    diseaseRiskTextKey: "cornDiseaseRiskText",
    defaultDiseaseRiskText:
      "Track gray leaf spot, common rust, northern corn leaf blight, leaf spots, and stalk rots. Risk increases with humidity, dense canopy, residue, and warm weather.",
    scoutKey: "cornScoutRecommendation",
    defaultScout:
      "Scout lower and middle leaves, check plant uniformity, evaluate nitrogen status, and monitor humid areas after rain or long dew periods.",
    diseases: ["cornDiseaseGrayLeafSpot", "cornDiseaseRust", "cornDiseaseNorthernBlight", "cornDiseaseLeafSpot", "cornDiseaseStalkRot"],
    diseaseFallbacks: ["Gray leaf spot", "Common rust", "Northern corn leaf blight", "Leaf spots", "Stalk rots"],
  },
  wheat: {
    labelKey: "cropWheat",
    icon: "🌾",
    benchmark: { min: 2.5, max: 4.5, high: 5.5, unit: "t/ha" },
    defaultName: "Wheat",
    descriptionKey: "cropWheatDescription",
    defaultDescription:
      "Wheat monitoring should combine NDVI, rainfall, humidity, temperature, and disease checks from tillering through grain filling.",
    diseaseRiskTitleKey: "wheatDiseaseRiskTitle",
    defaultDiseaseRiskTitle: "Wheat disease monitoring",
    diseaseRiskTextKey: "wheatDiseaseRiskText",
    defaultDiseaseRiskText:
      "Track rusts, powdery mildew, leaf spots, Fusarium head blight, and root diseases. Risk increases with humidity, rain during flowering, and mild temperatures.",
    scoutKey: "wheatScoutRecommendation",
    defaultScout:
      "Scout flag leaves and heads, monitor flowering conditions, evaluate lodging risk, and follow regional fungicide guidance when pressure increases.",
    diseases: ["wheatDiseaseRust", "wheatDiseasePowderyMildew", "wheatDiseaseLeafSpot", "wheatDiseaseFusarium", "wheatDiseaseRootRot"],
    diseaseFallbacks: ["Rusts", "Powdery mildew", "Leaf spots", "Fusarium head blight", "Root rots"],
  },
  cotton: {
    labelKey: "cropCotton",
    icon: "🧵",
    benchmark: { min: 1.5, max: 3.5, high: 4.0, unit: "t/ha" },
    defaultName: "Cotton",
    descriptionKey: "cropCottonDescription",
    defaultDescription:
      "Cotton monitoring should combine NDVI, heat stress, water availability, boll development, pests, and foliar disease pressure.",
    diseaseRiskTitleKey: "cottonDiseaseRiskTitle",
    defaultDiseaseRiskTitle: "Cotton disease monitoring",
    diseaseRiskTextKey: "cottonDiseaseRiskText",
    defaultDiseaseRiskText:
      "Track ramularia, bacterial blight, target spot, boll rot, and seedling diseases. Risk increases with humid canopy and warm conditions.",
    scoutKey: "cottonScoutRecommendation",
    defaultScout:
      "Scout lower canopy, monitor defoliation, check boll retention and pest pressure, and follow local disease-management recommendations.",
    diseases: ["cottonDiseaseRamularia", "cottonDiseaseBacterialBlight", "cottonDiseaseTargetSpot", "cottonDiseaseBollRot", "cottonDiseaseSeedling"],
    diseaseFallbacks: ["Ramularia leaf spot", "Bacterial blight", "Target spot", "Boll rot", "Seedling diseases"],
  },
  sugarcane: {
    labelKey: "cropSugarcane",
    icon: "🎋",
    benchmark: { min: 65, max: 90, high: 110, unit: "t/ha" },
    defaultName: "Sugarcane",
    descriptionKey: "cropSugarcaneDescription",
    defaultDescription:
      "Sugarcane monitoring should focus on canopy vigor, water stress, ratoon uniformity, nutrient balance, and disease symptoms.",
    diseaseRiskTitleKey: "sugarcaneDiseaseRiskTitle",
    defaultDiseaseRiskTitle: "Sugarcane disease monitoring",
    diseaseRiskTextKey: "sugarcaneDiseaseRiskText",
    defaultDiseaseRiskText:
      "Track rusts, smut, leaf scald, ratoon stunting, and red rot. Risk varies by cultivar, humidity, and crop stage.",
    scoutKey: "sugarcaneScoutRecommendation",
    defaultScout:
      "Check ratoon gaps, stalk symptoms, leaf lesions, and cultivar susceptibility; compare NDVI variability with field history.",
    diseases: ["sugarcaneDiseaseRust", "sugarcaneDiseaseSmut", "sugarcaneDiseaseLeafScald", "sugarcaneDiseaseRatoon", "sugarcaneDiseaseRedRot"],
    diseaseFallbacks: ["Rusts", "Smut", "Leaf scald", "Ratoon stunting", "Red rot"],
  },
  coffee: {
    labelKey: "cropCoffee",
    icon: "☕",
    benchmark: { min: 1.2, max: 2.5, high: 3.2, unit: "t/ha" },
    defaultName: "Coffee",
    descriptionKey: "cropCoffeeDescription",
    defaultDescription:
      "Coffee monitoring should consider canopy vigor, drought stress, flowering/fruiting stage, leaf wetness, and disease pressure.",
    diseaseRiskTitleKey: "coffeeDiseaseRiskTitle",
    defaultDiseaseRiskTitle: "Coffee disease monitoring",
    diseaseRiskTextKey: "coffeeDiseaseRiskText",
    defaultDiseaseRiskText:
      "Track coffee leaf rust, cercospora leaf spot, anthracnose, phoma blight, and root diseases. Risk increases with humidity and susceptible varieties.",
    scoutKey: "coffeeScoutRecommendation",
    defaultScout:
      "Scout leaf underside, fruit clusters, shaded/humid zones, and drought-affected areas; adjust management to phenological stage.",
    diseases: ["coffeeDiseaseRust", "coffeeDiseaseCercospora", "coffeeDiseaseAnthracnose", "coffeeDiseasePhoma", "coffeeDiseaseRoot"],
    diseaseFallbacks: ["Coffee leaf rust", "Cercospora leaf spot", "Anthracnose", "Phoma blight", "Root diseases"],
  },
  barley: {
    labelKey: "cropBarley",
    icon: "🌾",
    benchmark: { min: 3.0, max: 6.0, high: 7.0, unit: "t/ha" },
    defaultName: "Barley",
    descriptionKey: "cropBarleyDescription",
    defaultDescription:
      "Barley monitoring should focus on stand uniformity, NDVI trend, humidity, heading conditions, and foliar diseases.",
    diseaseRiskTitleKey: "barleyDiseaseRiskTitle",
    defaultDiseaseRiskTitle: "Barley disease monitoring",
    diseaseRiskTextKey: "barleyDiseaseRiskText",
    defaultDiseaseRiskText:
      "Track net blotch, scald, powdery mildew, rusts, and Fusarium head blight. Risk rises with wet and mild conditions.",
    scoutKey: "barleyScoutRecommendation",
    defaultScout:
      "Scout lower leaves and heads, monitor wet periods, and protect upper canopy when disease pressure increases.",
    diseases: ["barleyDiseaseNetBlotch", "barleyDiseaseScald", "barleyDiseasePowderyMildew", "barleyDiseaseRust", "barleyDiseaseFusarium"],
    diseaseFallbacks: ["Net blotch", "Scald", "Powdery mildew", "Rusts", "Fusarium head blight"],
  },
  potato: {
    labelKey: "cropPotato",
    icon: "🥔",
    benchmark: { min: 25, max: 45, high: 55, unit: "t/ha" },
    defaultName: "Potato",
    descriptionKey: "cropPotatoDescription",
    defaultDescription:
      "Potato monitoring should combine NDVI, canopy closure, rainfall, humidity, tuber bulking stage, and disease alerts.",
    diseaseRiskTitleKey: "potatoDiseaseRiskTitle",
    defaultDiseaseRiskTitle: "Potato disease monitoring",
    diseaseRiskTextKey: "potatoDiseaseRiskText",
    defaultDiseaseRiskText:
      "Track late blight, early blight, blackleg, scab, and soft rot. Risk increases with high humidity, wet canopy, and moderate temperatures.",
    scoutKey: "potatoScoutRecommendation",
    defaultScout:
      "Scout field edges and humid low spots, inspect lower canopy, and protect crops during prolonged wet periods.",
    diseases: ["potatoDiseaseLateBlight", "potatoDiseaseEarlyBlight", "potatoDiseaseBlackleg", "potatoDiseaseScab", "potatoDiseaseSoftRot"],
    diseaseFallbacks: ["Late blight", "Early blight", "Blackleg", "Common scab", "Soft rot"],
  },
  grape: {
    labelKey: "cropGrape",
    icon: "🍇",
    benchmark: { min: 8, max: 18, high: 25, unit: "t/ha" },
    defaultName: "Grape",
    descriptionKey: "cropGrapeDescription",
    defaultDescription:
      "Grape monitoring should consider canopy vigor, humidity, rainfall, phenological stage, and disease pressure in vineyard blocks.",
    diseaseRiskTitleKey: "grapeDiseaseRiskTitle",
    defaultDiseaseRiskTitle: "Grape disease monitoring",
    diseaseRiskTextKey: "grapeDiseaseRiskText",
    defaultDiseaseRiskText:
      "Track downy mildew, powdery mildew, botrytis, anthracnose, and black rot. Risk increases with wet canopy, humidity, and dense vegetation.",
    scoutKey: "grapeScoutRecommendation",
    defaultScout:
      "Scout bunch zones, shaded areas, and dense canopy; improve ventilation and follow local spray programs when disease pressure is high.",
    diseases: ["grapeDiseaseDownyMildew", "grapeDiseasePowderyMildew", "grapeDiseaseBotrytis", "grapeDiseaseAnthracnose", "grapeDiseaseBlackRot"],
    diseaseFallbacks: ["Downy mildew", "Powdery mildew", "Botrytis", "Anthracnose", "Black rot"],
  },
  pasture: {
    labelKey: "cropPasture",
    icon: "🐄",
    benchmark: { min: 4, max: 12, high: 18, unit: "t DM/ha" },
    defaultName: "Pasture / Forage",
    descriptionKey: "cropPastureDescription",
    defaultDescription:
      "Pasture monitoring should focus on forage biomass, regrowth, water stress, grazing pressure, and seasonal productivity.",
    diseaseRiskTitleKey: "pastureDiseaseRiskTitle",
    defaultDiseaseRiskTitle: "Pasture and forage monitoring",
    diseaseRiskTextKey: "pastureDiseaseRiskText",
    defaultDiseaseRiskText:
      "Track foliar rusts, leaf spots, root decline, pest damage, and drought stress. NDVI drops often indicate overgrazing or water limitation.",
    scoutKey: "pastureScoutRecommendation",
    defaultScout:
      "Check grazing intensity, regrowth, soil moisture, bare soil patches, and pest/disease symptoms before adjusting stocking rate.",
    diseases: ["pastureDiseaseRust", "pastureDiseaseLeafSpot", "pastureDiseaseRootDecline", "pastureDiseasePestDamage", "pastureDiseaseDrought"],
    diseaseFallbacks: ["Foliar rusts", "Leaf spots", "Root decline", "Pest damage", "Drought stress"],
  },
  canola: {
    labelKey: "cropCanola",
    icon: "🌼",
    benchmark: { min: 1.5, max: 3.0, high: 4.0, unit: "t/ha" },
    defaultName: "Canola / Rapeseed",
    descriptionKey: "cropCanolaDescription",
    defaultDescription:
      "Canola monitoring should combine NDVI, flowering conditions, soil moisture, canopy density, and disease scouting.",
    diseaseRiskTitleKey: "canolaDiseaseRiskTitle",
    defaultDiseaseRiskTitle: "Canola disease monitoring",
    diseaseRiskTextKey: "canolaDiseaseRiskText",
    defaultDiseaseRiskText:
      "Track sclerotinia stem rot, blackleg, alternaria, clubroot, and downy mildew. Risk rises with humid canopy and flowering wetness.",
    scoutKey: "canolaScoutRecommendation",
    defaultScout:
      "Scout stems and flowers, monitor wet conditions during flowering, and evaluate field history for sclerotinia and blackleg risk.",
    diseases: ["canolaDiseaseSclerotinia", "canolaDiseaseBlackleg", "canolaDiseaseAlternaria", "canolaDiseaseClubroot", "canolaDiseaseDownyMildew"],
    diseaseFallbacks: ["Sclerotinia stem rot", "Blackleg", "Alternaria", "Clubroot", "Downy mildew"],
  },
};

const globalCropSets = {
  default: ["corn", "wheat", "rice", "soybean", "barley", "potato"],
  brazil: ["soybean", "corn", "sugarcane", "coffee", "cotton", "wheat"],
  brazilSouth: ["soybean", "rice", "corn", "wheat", "pasture", "grape"],
  usa: ["corn", "soybean", "wheat", "cotton", "rice", "potato"],
  canada: ["wheat", "canola", "barley", "soybean", "corn", "potato"],
  argentina: ["soybean", "corn", "wheat", "barley", "pasture", "grape"],
  china: ["rice", "wheat", "corn", "soybean", "cotton", "potato"],
  india: ["rice", "wheat", "cotton", "sugarcane", "corn", "soybean"],
  europe: ["wheat", "corn", "barley", "potato", "grape", "canola"],
  australia: ["wheat", "barley", "canola", "cotton", "grape", "pasture"],
  southAfrica: ["corn", "wheat", "grape", "sugarcane", "cotton", "pasture"],
};

function normalize(value = "") {
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function detectCropSetKey(weather = {}) {
  const country = normalize(weather.country || weather.countryCode || "");
  const state = normalize(weather.state || weather.region || "");
  const city = normalize(weather.city || "");
  const location = `${city} ${state} ${country}`;

  if (country.includes("brazil") || country === "br" || country.includes("brasil")) {
    if (
      state.includes("rio grande do sul") ||
      state === "rs" ||
      location.includes("santa maria") ||
      location.includes("sao martinho") ||
      location.includes("porto alegre")
    ) {
      return "brazilSouth";
    }
    return "brazil";
  }
  if (country.includes("united states") || country === "us" || country === "usa" || country.includes("america")) return "usa";
  if (country.includes("canada") || country === "ca") return "canada";
  if (country.includes("argentina") || country === "ar") return "argentina";
  if (country.includes("china") || country === "cn") return "china";
  if (country.includes("india") || country === "in") return "india";
  if (country.includes("australia") || country === "au") return "australia";
  if (country.includes("south africa") || country === "za") return "southAfrica";

  const europeanCountries = [
    "italy", "it", "france", "fr", "germany", "de", "spain", "es", "portugal", "pt", "netherlands", "nl",
    "ireland", "ie", "poland", "pl", "ukraine", "ua", "united kingdom", "uk", "great britain", "gb",
  ];
  if (europeanCountries.some((item) => country.includes(item))) return "europe";

  return "default";
}

export function getRegionalCropOptions(weather, t = {}) {
  const key = detectCropSetKey(weather);
  const cropIds = globalCropSets[key] || globalCropSets.default;
  return cropIds.map((value) => ({
    value,
    labelKey: cropCatalog[value].labelKey,
    icon: cropCatalog[value].icon,
    label: t[cropCatalog[value].labelKey] || cropCatalog[value].defaultName,
  }));
}

export function getRegionProfile(weather, t = {}) {
  const key = detectCropSetKey(weather);
  const city = weather?.city || "";
  const state = weather?.state || "";
  const country = weather?.country || "";
  const location = [city, state, country].filter(Boolean).join(", ");

  const fallback = t.regionProfileFallback || "Most relevant crops for the searched location";
  const labels = {
    brazilSouth: t.regionProfileBrazilSouth || "Major crops for Southern Brazil / Rio Grande do Sul",
    brazil: t.regionProfileBrazil || "Major crops for Brazil",
    usa: t.regionProfileUsa || "Major crops for the United States",
    canada: t.regionProfileCanada || "Major crops for Canada",
    argentina: t.regionProfileArgentina || "Major crops for Argentina",
    china: t.regionProfileChina || "Major crops for China",
    india: t.regionProfileIndia || "Major crops for India",
    europe: t.regionProfileEurope || "Major crops for Europe",
    australia: t.regionProfileAustralia || "Major crops for Australia",
    southAfrica: t.regionProfileSouthAfrica || "Major crops for South Africa",
    default: fallback,
  };

  return {
    key,
    label: labels[key] || fallback,
    location,
  };
}

export function getCropProfile(crop, t = {}) {
  const profile = cropCatalog[crop] || cropCatalog.soybean;
  return {
    icon: profile.icon,
    name: t[profile.labelKey] || profile.defaultName,
    description: t[profile.descriptionKey] || profile.defaultDescription,
    diseasesTitle: t.monitoredDiseases || "Monitored diseases",
    diseases: profile.diseases.map((key, index) => t[key] || profile.diseaseFallbacks[index]),
    diseaseRiskTitle: t[profile.diseaseRiskTitleKey] || profile.defaultDiseaseRiskTitle,
    diseaseRiskText: t[profile.diseaseRiskTextKey] || profile.defaultDiseaseRiskText,
    scoutRecommendation: t[profile.scoutKey] || profile.defaultScout,
  };
}

export function estimateNdviFromWeather(weather) {
  if (!weather) return 0.55;

  const rainfall = Number(weather.rainfall || 0);
  const humidity = Number(weather.humidity || 0);
  const temperature = Number(weather.temperature || 0);
  const wind = Number(weather.wind || 0);

  let ndvi = 0.52;

  if (humidity >= 55 && humidity <= 85) ndvi += 0.08;
  if (rainfall > 0 && rainfall <= 20) ndvi += 0.06;
  if (temperature >= 18 && temperature <= 30) ndvi += 0.06;
  if (temperature > 34 || wind > 28) ndvi -= 0.12;
  if (rainfall > 45) ndvi -= 0.08;

  return Number(clamp(ndvi, 0.15, 0.82).toFixed(2));
}

export function buildNdviHistory(weather) {
  const current = estimateNdviFromWeather(weather);
  const rainfall = Number(weather?.rainfall || 0);
  const temperature = Number(weather?.temperature || 0);
  const humidity = Number(weather?.humidity || 0);

  const stressSignal = rainfall < 5 || temperature > 33 || humidity < 35 ? -0.035 : 0.018;
  const values = Array.from({ length: 6 }, (_, index) => {
    const reverseIndex = 5 - index;
    const seasonalCurve = Math.sin(index / 1.7) * 0.025;
    const ndvi = current - reverseIndex * stressSignal + seasonalCurve;

    return {
      label: `T-${reverseIndex}`,
      ndvi: Number(clamp(ndvi, 0.12, 0.88).toFixed(2)),
    };
  });

  values[5] = { label: "Now", ndvi: current };
  return values;
}

export function getNdviStatus(ndvi, t = {}) {
  if (ndvi >= 0.65) return t.ndviStatusHigh || "High biomass / healthy crop canopy";
  if (ndvi >= 0.5) return t.ndviStatusActive || "Active crop development";
  if (ndvi >= 0.3) return t.ndviStatusModerate || "Moderate vegetation signal";
  return t.ndviStatusLow || "Low vegetation / possible stress";
}

export function getNdviColor(ndvi) {
  if (ndvi >= 0.6) return "#22c55e";
  if (ndvi >= 0.4) return "#eab308";
  return "#ef4444";
}

function getYieldBenchmark(crop) {
  return (cropCatalog[crop] || cropCatalog.soybean).benchmark;
}

export function estimateYieldPotential(crop, ndvi) {
  const benchmark = getYieldBenchmark(crop);
  const normalized = clamp((ndvi - 0.25) / 0.45, 0.45, 1.18);
  const expectedAverage = (benchmark.min + benchmark.max) / 2;
  const estimate = expectedAverage * normalized;

  return {
    value: Number(estimate.toFixed(1)),
    benchmark,
  };
}

function cropName(crop, t = {}) {
  const profile = cropCatalog[crop] || cropCatalog.soybean;
  return t[profile.labelKey] || profile.defaultName;
}

function pushDiseaseWatch(alerts, crop, humidity, temperature, t = {}) {
  const highFungalRisk = humidity >= 70 && temperature >= 18 && temperature <= 30;
  const name = cropName(crop, t);

  const diseaseKeys = {
    soybean: ["soyRustTitle", "soyDiseaseWatchTitle"],
    rice: ["riceBlastTitle", "riceDiseaseWatchTitle"],
    corn: ["cornDiseaseAlertTitle", "cornDiseaseWatchTitle"],
    wheat: ["wheatDiseaseAlertTitle", "wheatDiseaseWatchTitle"],
    cotton: ["cottonDiseaseAlertTitle", "cottonDiseaseWatchTitle"],
    sugarcane: ["sugarcaneDiseaseAlertTitle", "sugarcaneDiseaseWatchTitle"],
    coffee: ["coffeeDiseaseAlertTitle", "coffeeDiseaseWatchTitle"],
    barley: ["barleyDiseaseAlertTitle", "barleyDiseaseWatchTitle"],
    potato: ["potatoDiseaseAlertTitle", "potatoDiseaseWatchTitle"],
    grape: ["grapeDiseaseAlertTitle", "grapeDiseaseWatchTitle"],
    pasture: ["pastureDiseaseAlertTitle", "pastureDiseaseWatchTitle"],
    canola: ["canolaDiseaseAlertTitle", "canolaDiseaseWatchTitle"],
  };
  const [alertKey, watchKey] = diseaseKeys[crop] || diseaseKeys.soybean;

  alerts.push({
    level: highFungalRisk ? "high" : "medium",
    title: t[highFungalRisk ? alertKey : watchKey] || (highFungalRisk ? `${name} disease risk` : `${name} disease watch`),
    message: highFungalRisk
      ? (t.cropDiseaseRiskMessage || "Humidity and temperature are favorable for fungal disease pressure in this crop.")
      : (t.cropDiseaseWatchMessage || "Keep monitoring crop-specific diseases as canopy develops and weather conditions change."),
    recommendation: t.cropDiseaseRecommendation || "Scout representative field zones, check humid and dense-canopy areas, and follow local agronomic recommendations when risk increases.",
  });
}

export function buildCropAlerts({ crop, weather, history, t = {} }) {
  const alerts = [];
  const latest = history?.[history.length - 1]?.ndvi || estimateNdviFromWeather(weather);
  const previous = history?.[history.length - 2]?.ndvi || latest;
  const rainfall = Number(weather?.rainfall || 0);
  const humidity = Number(weather?.humidity || 0);
  const temperature = Number(weather?.temperature || 0);
  const yieldPotential = estimateYieldPotential(crop, latest);
  const benchmark = yieldPotential.benchmark;
  const name = cropName(crop, t);

  if (latest < previous - 0.03) {
    alerts.push({
      level: "medium",
      title: t.ndviDeclineTitle || "NDVI decline detected",
      message: t.ndviDeclineMessage || "Vegetation signal is declining compared with the previous period.",
      recommendation: t.ndviDeclineRecommendation || "Check crop stage, soil moisture, nutrition, pests, and disease symptoms.",
    });
  }

  if (rainfall < 5 && latest < 0.5) {
    alerts.push({
      level: "high",
      title: t.waterStressTitle || "Possible water stress",
      message: t.waterStressMessage || "Low NDVI combined with low recent rainfall may indicate water limitation.",
      recommendation: t.waterStressRecommendation || "Compare with soil moisture, irrigation status, and the next rainfall forecast.",
    });
  }

  pushDiseaseWatch(alerts, crop, humidity, temperature, t);

  if (latest < 0.48) {
    alerts.push({
      level: "medium",
      title: t.yieldBelowTitle || "Yield potential below regional benchmark",
      message: `${name}: ${(t.yieldBelowGenericMessage || "NDVI suggests possible yield below the regional benchmark of")} ${benchmark.min}–${benchmark.max} ${benchmark.unit}.`,
      recommendation: t.yieldBelowGenericRecommendation || "Check water stress, soil fertility, stand uniformity, weed competition, pests, and crop-specific diseases.",
    });
  }

  if (!alerts.length) {
    alerts.push({
      level: "low",
      title: t.noCriticalAlertTitle || "No critical alert detected",
      message: t.noCriticalAlertMessage || "NDVI and weather do not indicate severe crop stress at this moment.",
      recommendation: t.noCriticalAlertRecommendation || "Keep monitoring NDVI trend, rainfall, crop stage, and local disease alerts.",
    });
  }

  return { alerts, yieldPotential };
}

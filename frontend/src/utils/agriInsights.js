import {
  BASE_RISK_SCORE,
  EMPTY_RECOMMENDATIONS,
  EXTREME_TEMPERATURE_HIGH,
  EXTREME_TEMPERATURE_LOW,
  EXTREME_TEMPERATURE_PENALTY,
  HIGH_HUMIDITY_RAIN_PENALTY,
  HIGH_HUMIDITY_THRESHOLD,
  HIGH_RAINFALL_THRESHOLD,
  HIGH_RISK_THRESHOLD,
  HIGH_WIND_PENALTY,
  HIGH_WIND_THRESHOLD,
  HUMIDITY_WEIGHT,
  IDEAL_TEMPERATURE_MAX,
  IDEAL_TEMPERATURE_MIN,
  IRRIGATION_RAIN_THRESHOLD,
  LOW_HUMIDITY_THRESHOLD,
  MAX_HUMIDITY_SCORE,
  MAX_RAINFALL_SCORE,
  MAX_RISK_SCORE,
  MAX_WIND_SCORE,
  MEDIUM_RISK_THRESHOLD,
  MIN_TREND_TEMPERATURE,
  PLANTING_RAIN_THRESHOLD,
  RAINFALL_WEIGHT,
  SPRAYING_WIND_THRESHOLD,
  TREND_BASE_RAINFALL,
  TREND_BASE_TEMPERATURE,
  TREND_DATA_OFFSETS,
  WIND_WEIGHT,
} from "../config/agriConstants";

export function calculateRisk(weather) {
  if (!weather) return { score: 0, level: "low" };

  let score = BASE_RISK_SCORE;
  score += Math.min(weather.humidity || 0, MAX_HUMIDITY_SCORE) * HUMIDITY_WEIGHT;
  score += Math.min(weather.rainfall || 0, MAX_RAINFALL_SCORE) * RAINFALL_WEIGHT;
  score += Math.min(weather.wind || 0, MAX_WIND_SCORE) * WIND_WEIGHT;

  const temperature = weather.temperature || 0;
  if (temperature < EXTREME_TEMPERATURE_LOW || temperature > EXTREME_TEMPERATURE_HIGH) {
    score += EXTREME_TEMPERATURE_PENALTY;
  }

  if ((weather.humidity || 0) > HIGH_HUMIDITY_THRESHOLD && (weather.rainfall || 0) > HIGH_RAINFALL_THRESHOLD) {
    score += HIGH_HUMIDITY_RAIN_PENALTY;
  }

  if ((weather.wind || 0) > HIGH_WIND_THRESHOLD) {
    score += HIGH_WIND_PENALTY;
  }

  score = Math.max(0, Math.min(MAX_RISK_SCORE, Math.round(score)));

  let level = "low";
  if (score >= HIGH_RISK_THRESHOLD) level = "high";
  else if (score >= MEDIUM_RISK_THRESHOLD) level = "medium";

  return { score, level };
}

export function getRecommendations(weather, t) {
  if (!weather) {
    return {
      planting: t?.recommendationFallback || EMPTY_RECOMMENDATIONS.planting,
      irrigation: t?.recommendationFallback || EMPTY_RECOMMENDATIONS.irrigation,
      disease: t?.recommendationFallback || EMPTY_RECOMMENDATIONS.disease,
      spraying: t?.recommendationFallback || EMPTY_RECOMMENDATIONS.spraying,
    };
  }

  const planting =
    weather.rainfall > PLANTING_RAIN_THRESHOLD
      ? t?.plantingDelay || "Delay sensitive field operations until rainfall decreases."
      : weather.temperature >= IDEAL_TEMPERATURE_MIN && weather.temperature <= IDEAL_TEMPERATURE_MAX
        ? t?.plantingGood || "Good window for many planting activities."
        : t?.plantingCareful || "Use crop-specific timing before planting.";

  const irrigation =
    weather.rainfall > IRRIGATION_RAIN_THRESHOLD
      ? t?.irrigationReduced || "Irrigation demand may be reduced in the short term."
      : weather.humidity < LOW_HUMIDITY_THRESHOLD
        ? t?.irrigationMonitor || "Monitor soil moisture and consider supplemental irrigation."
        : t?.irrigationRegular || "Maintain regular irrigation monitoring.";

  const disease =
    weather.humidity > HIGH_HUMIDITY_THRESHOLD
      ? t?.diseaseHigh || "Higher fungal pressure is possible. Increase monitoring."
      : t?.diseaseModerate || "Disease pressure appears more moderate right now.";

  const spraying =
    weather.wind > SPRAYING_WIND_THRESHOLD
      ? t?.sprayingAvoid || "Avoid spraying in stronger wind conditions."
      : t?.sprayingGood || "Spraying conditions look more favorable.";

  return { planting, irrigation, disease, spraying };
}

export function buildTrendData(weather) {
  const baseTemp = weather?.temperature || TREND_BASE_TEMPERATURE;
  const baseRain = weather?.rainfall || TREND_BASE_RAINFALL;

  return TREND_DATA_OFFSETS.map(({ day, tempOffset, rainOffset }) => ({
    day,
    temp: Math.max(MIN_TREND_TEMPERATURE, baseTemp + tempOffset),
    rain: Math.max(0, baseRain + rainOffset),
  }));
}

export function calculateRisk(weather) {
  if (!weather) return { score: 0, level: "low" };

  let score = 18;
  score += Math.min(weather.humidity || 0, 100) * 0.22;
  score += Math.min(weather.rainfall || 0, 40) * 1.3;
  score += Math.min(weather.wind || 0, 50) * 0.7;

  const temperature = weather.temperature || 0;
  if (temperature < 10 || temperature > 34) score += 12;
  if ((weather.humidity || 0) > 80 && (weather.rainfall || 0) > 10) score += 10;
  if ((weather.wind || 0) > 25) score += 8;

  score = Math.max(0, Math.min(100, Math.round(score)));

  let level = "low";
  if (score >= 67) level = "high";
  else if (score >= 40) level = "medium";

  return { score, level };
}

export function getRecommendations(weather) {
  if (!weather) {
    return { planting: "-", irrigation: "-", disease: "-", spraying: "-" };
  }

  const planting =
    weather.rainfall > 18
      ? "Delay sensitive field operations until rainfall decreases."
      : weather.temperature >= 18 && weather.temperature <= 30
      ? "Good window for many planting activities."
      : "Use crop-specific timing before planting.";

  const irrigation =
    weather.rainfall > 10
      ? "Irrigation demand may be reduced in the short term."
      : weather.humidity < 55
      ? "Monitor soil moisture and consider supplemental irrigation."
      : "Maintain regular irrigation monitoring.";

  const disease =
    weather.humidity > 80
      ? "Higher fungal pressure is possible. Increase monitoring."
      : "Disease pressure appears more moderate right now.";

  const spraying =
    weather.wind > 22
      ? "Avoid spraying in stronger wind conditions."
      : "Spraying conditions look more favorable.";

  return { planting, irrigation, disease, spraying };
}

export function buildTrendData(weather) {
  const baseTemp = weather?.temperature || 24;
  const baseRain = weather?.rainfall || 6;

  return [
    { day: "Mon", temp: Math.max(8, baseTemp - 2), rain: Math.max(0, baseRain - 2) },
    { day: "Tue", temp: Math.max(8, baseTemp - 1), rain: Math.max(0, baseRain - 1) },
    { day: "Wed", temp: baseTemp, rain: baseRain },
    { day: "Thu", temp: Math.max(8, baseTemp + 1), rain: Math.max(0, baseRain + 2) },
    { day: "Fri", temp: Math.max(8, baseTemp + 2), rain: Math.max(0, baseRain + 1) }
  ];
}

export const CROPS = [
  { value: "soybean", labelKey: "cropSoybean" },
  { value: "rice", labelKey: "cropRice" },
];

export function getNdviColor(ndvi) {
  if (ndvi >= 0.7) return "#16a34a";
  if (ndvi >= 0.5) return "#22c55e";
  if (ndvi >= 0.3) return "#eab308";
  return "#ef4444";
}

export function getNdviStatus(ndvi, t = {}) {
  if (ndvi >= 0.7) return t.ndviVeryHigh || "Very high biomass";
  if (ndvi >= 0.5) return t.ndviActive || "Active crop development";
  if (ndvi >= 0.3) return t.ndviModerate || "Moderate vegetation";
  return t.ndviLow || "Low vegetation / possible stress";
}

export function getAlertClass(level) {
  if (level === "high") return "coverage-card__alert_high";
  if (level === "medium") return "coverage-card__alert_medium";
  return "coverage-card__alert_low";
}

export function buildLocalNdviFallback(weather, crop = "soybean") {
  const rainfall = Number(weather?.rainfall || 0);
  const humidity = Number(weather?.humidity || 0);
  const temperature = Number(weather?.temperature || 0);
  const forecastRainProbability = Number(weather?.forecastRainProbability || 0);
  const now = new Date();
  const cropBase = crop === "rice" ? 0.55 : 0.58;
  const history = [];

  for (let index = 11; index >= 0; index -= 1) {
    const date = new Date(now);
    date.setDate(15);
    date.setMonth(now.getMonth() - index);

    const seasonal = Math.sin(((date.getMonth() + 1) / 12) * Math.PI * 2) * 0.12;
    const weatherBoost =
      (humidity >= 55 && humidity <= 85 ? 0.04 : 0) +
      (rainfall > 0 && rainfall <= 25 ? 0.04 : 0) +
      (forecastRainProbability >= 55 ? 0.02 : 0) +
      (temperature >= 18 && temperature <= 30 ? 0.04 : -0.04);

    const ndvi = Math.max(0.18, Math.min(0.84, cropBase + seasonal + weatherBoost - index * 0.004));
    history.push({ date: date.toISOString().slice(0, 10), ndvi: Number(ndvi.toFixed(2)), source: "frontend-fallback" });
  }

  const currentNdvi = history[history.length - 1].ndvi;

  return {
    crop,
    currentNdvi,
    classification: currentNdvi < 0.3 ? "low" : currentNdvi < 0.5 ? "moderate" : currentNdvi < 0.7 ? "active" : "high",
    trend: "stable",
    history,
    alerts: [
      {
        level: "low",
        title: "Local NDVI fallback active",
        message: "The backend NDVI service did not respond, so the dashboard is using a local agronomic estimate.",
      },
    ],
    source: "Local agronomic fallback",
  };
}

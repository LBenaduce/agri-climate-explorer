export function getAgroInsights({ crop, ndvi, rainfall, t }) {
  const insights = [];

  if (ndvi < 0.4) {
    insights.push({
      title: t.ndviDrop,
      message: "Vegetation signal is declining.",
      recommendation: "Check soil moisture and crop health.",
    });
  }

  if (rainfall < 5 && ndvi < 0.5) {
    insights.push({
      title: t.waterStress,
      message: "Low rainfall and NDVI indicate stress.",
      recommendation: "Monitor irrigation and soil moisture.",
    });
  }

  if (crop === "soybean" && ndvi < 0.45) {
    insights.push({
      title: t.lowProductivity,
      message: "Yield may be below regional average.",
      recommendation: "Check nutrients and disease.",
    });
  }

  return insights;
}

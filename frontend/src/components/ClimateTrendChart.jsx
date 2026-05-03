import { buildTrendData } from "../utils/agriInsights";
import { buildNdviHistory, estimateNdviFromWeather, getNdviColor, getNdviStatus } from "../utils/ndviInsights";
import { formatWeatherValue } from "../utils/userPreferences";
import "./ClimateTrendChart.css";

function getAverage(values) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function getClimateTrendInsight({ data, weather, latestNdvi, ndviDelta, t }) {
  const first = data[0] || { temp: weather?.temperature || 0, rain: weather?.rainfall || 0 };
  const last = data[data.length - 1] || first;
  const avgRain = getAverage(data.map((item) => item.rain));
  const avgTemp = getAverage(data.map((item) => item.temp));
  const humidity = weather?.humidity || 0;

  const isDrying = last.rain < first.rain || avgRain < 4;
  const isWet = avgRain >= 8 || humidity >= 78;
  const isWarming = last.temp > first.temp + 1.5 || avgTemp >= 30;
  const isCooling = last.temp < first.temp - 1.5;
  const ndviIsLow = latestNdvi < 0.45;
  const ndviIsDeclining = ndviDelta < -0.03;

  if (isDrying && (ndviIsLow || ndviIsDeclining)) {
    return {
      level: "high",
      label: t?.climateTrendDrying || "Drying trend with crop stress signal",
      explanation:
        t?.climateTrendDryingText ||
        "Rainfall is trending low while NDVI is weak or declining. This combination may indicate increasing water limitation in the crop canopy.",
      impact: t?.climateTrendDryingImpact || "Higher probability of water stress, slower vegetative growth, and reduced yield potential if dry conditions persist.",
      recommendation:
        t?.climateTrendDryingRecommendation ||
        "Check soil moisture, irrigation status, rooting depth, and rainfall forecast before making field decisions.",
    };
  }

  if (isWet && avgTemp >= 18 && avgTemp <= 30) {
    return {
      level: "medium",
      label: t?.climateTrendDisease || "Humid trend with disease-pressure conditions",
      explanation:
        t?.climateTrendDiseaseText ||
        "Humidity and rainfall are favorable for leaf wetness. Under mild-to-warm temperatures, fungal disease pressure may increase.",
      impact: t?.climateTrendDiseaseImpact || "Higher risk of foliar diseases, especially in dense canopies or fields with previous disease history.",
      recommendation:
        t?.climateTrendDiseaseRecommendation ||
        "Increase field scouting, inspect lower canopy and humid zones, and compare with local disease alerts before spraying.",
    };
  }

  if (isWarming) {
    return {
      level: "medium",
      label: t?.climateTrendWarming || "Warming trend",
      explanation:
        t?.climateTrendWarmingText ||
        "Temperatures are rising through the week. Heat may increase crop water demand and accelerate development.",
      impact: t?.climateTrendWarmingImpact || "Possible increase in evapotranspiration, heat stress during flowering/grain filling, and faster soil drying.",
      recommendation:
        t?.climateTrendWarmingRecommendation ||
        "Monitor crop stage, soil moisture, and heat-sensitive periods. Avoid stressful operations during the hottest hours.",
    };
  }

  if (isCooling) {
    return {
      level: "low",
      label: t?.climateTrendCooling || "Cooling trend",
      explanation:
        t?.climateTrendCoolingText ||
        "Temperatures are decreasing through the week. Crop development may slow under cooler conditions.",
      impact: t?.climateTrendCoolingImpact || "Lower evapotranspiration, slower growth, and possible delay in field operations depending on crop stage.",
      recommendation:
        t?.climateTrendCoolingRecommendation ||
        "Adjust field operations to crop stage and avoid decisions based only on one-day weather conditions.",
    };
  }

  return {
    level: "low",
    label: t?.climateTrendStable || "Stable short-term climate trend",
    explanation:
      t?.climateTrendStableText ||
      "Temperature and rainfall signals are relatively stable for the week. No severe climate stress signal is dominant right now.",
    impact: t?.climateTrendStableImpact || "Lower short-term climate risk, but NDVI and field scouting should continue to guide crop decisions.",
    recommendation:
      t?.climateTrendStableRecommendation ||
      "Continue monitoring NDVI trend, rainfall forecast, soil moisture, and crop-specific disease alerts.",
  };
}

function ClimateTrendChart({ weather, t, language, units = "metric" }) {
  const data = buildTrendData(weather);
  const history = buildNdviHistory(weather);
  const latestNdvi = history[history.length - 1]?.ndvi || estimateNdviFromWeather(weather);
  const previousNdvi = history[history.length - 2]?.ndvi || latestNdvi;
  const ndviDelta = latestNdvi - previousNdvi;
  const insight = getClimateTrendInsight({ data, weather, latestNdvi, ndviDelta, t });
  const weekDays = t.weekDays || ["Mon", "Tue", "Wed", "Thu", "Fri"];

  return (
    <article className="card trend-card">
      <div className="trend-card__header">
        <div>
          <span className="trend-card__eyebrow">{t?.climateTrendEyebrow || "Climate + NDVI interpretation"}</span>
          <h3 className="card__title">{t.trendTitle}</h3>
          <p className="trend-card__intro">
            {t?.climateTrendIntro ||
              "This panel explains whether the week is becoming drier, wetter, warmer or more stable, and what that means for crop management."}
          </p>
        </div>
        <div className={`trend-card__badge trend-card__badge_${insight.level}`}>{insight.label}</div>
      </div>

      <div className="trend-card__content">
        <div className="trend-card__bars" aria-label={t.trendTitle}>
          {data.map((item, index) => (
            <div key={weekDays[index] || item.day} className="trend-card__column">
              <div className="trend-card__bar-group">
                <div
                  className="trend-card__bar trend-card__bar_temp"
                  style={{ height: `${Math.max(18, item.temp * 3)}px` }}
                  title={formatWeatherValue(item.temp, "temperature", units)}
                />
                <div
                  className="trend-card__bar trend-card__bar_rain"
                  style={{ height: `${Math.max(10, item.rain * 5)}px` }}
                  title={formatWeatherValue(item.rain, "rainfall", units)}
                />
              </div>
              <span className="trend-card__label">{weekDays[index] || item.day}</span>
            </div>
          ))}
        </div>

        <div className="trend-card__analysis">
          <div className="trend-card__ndvi-line">
            <i style={{ backgroundColor: getNdviColor(latestNdvi) }} />
            <div>
              <strong>{t?.ndviClimateSignal || "NDVI-linked signal"}</strong>
              <p>
                {latestNdvi.toFixed(2)} · {getNdviStatus(latestNdvi, t)}
                {ndviDelta < -0.03 ? ` · ${t?.ndviDecliningShort || "declining"}` : ""}
              </p>
            </div>
          </div>

          <div className={`trend-card__insight trend-card__insight_${insight.level}`}>
            <h4>{insight.label}</h4>
            <p>{insight.explanation}</p>
          </div>

          <div className="trend-card__decision-grid">
            <div>
              <span>{t?.agronomicImpact || "Agronomic impact"}</span>
              <p>{insight.impact}</p>
            </div>
            <div>
              <span>{t?.recommendation || "Recommendation"}</span>
              <p>{insight.recommendation}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="trend-card__legend" aria-label="Legend">
        <span><i className="trend-card__legend-temp" />{t?.temperature || "Temperature"}</span>
        <span><i className="trend-card__legend-rain" />{t?.rainfall || "Rainfall"}</span>
      </div>
    </article>
  );
}

export default ClimateTrendChart;

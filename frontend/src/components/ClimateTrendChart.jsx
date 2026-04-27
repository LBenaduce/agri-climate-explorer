import { buildTrendData } from "../utils/agriInsights";
import { formatWeatherValue } from "../utils/userPreferences";
import "./ClimateTrendChart.css";

function ClimateTrendChart({ weather, t, language, units = "metric" }) {
  const data = buildTrendData(weather);
  const weekDays = t.weekDays || ["Mon", "Tue", "Wed", "Thu", "Fri"];

  return (
    <article className="card trend-card">
      <h3 className="card__title">{t.trendTitle}</h3>

      <div className="trend-card__bars">
        {data.map((item, index) => (
          <div key={weekDays[index] || item.day} className="trend-card__column">
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
            <span className="trend-card__label">{weekDays[index] || item.day}</span>
          </div>
        ))}
      </div>
    </article>
  );
}

export default ClimateTrendChart;

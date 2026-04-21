import { buildTrendData } from "../utils/agriInsights";
import "./ClimateTrendChart.css";

function ClimateTrendChart({ weather, t }) {
  const data = buildTrendData(weather);

  return (
    <article className="card trend-card">
      <h3 className="card__title">{t.trendTitle}</h3>

      <div className="trend-card__bars">
        {data.map((item) => (
          <div key={item.date || item.day} className="trend-card__column">
            <div
              className="trend-card__bar trend-card__bar_temp"
              style={{ height: `${Math.max(18, item.temp * 3)}px` }}
              title={`${item.temp}°C`}
            />
            <div
              className="trend-card__bar trend-card__bar_rain"
              style={{ height: `${Math.max(10, item.rain * 5)}px` }}
              title={`${item.rain} mm`}
            />
            <span className="trend-card__label">{item.day}</span>
          </div>
        ))}
      </div>
    </article>
  );
}

export default ClimateTrendChart;

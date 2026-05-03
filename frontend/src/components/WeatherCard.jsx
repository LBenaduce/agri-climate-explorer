import { formatWeatherValue } from "../utils/userPreferences";
import { translateSummaryAndInsight } from "../utils/weatherTranslations";
import "./WeatherCard.css";

function WeatherCard({ weather, isLoggedIn, onSave, t, language, units = "metric" }) {
  if (!weather) return null;

  const { summary, insight } = translateSummaryAndInsight(weather, language);
  const locationParts = [weather.city, weather.state, weather.country].filter(Boolean);

  return (
    <article className="card">
      <h2 className="card__title">{locationParts.join(", ")}</h2>

      <ul className="card__meta">
        <li>{t.temperature}: {formatWeatherValue(weather.temperature, "temperature", units)}</li>
        <li>{t.humidity}: {weather.humidity}%</li>
        <li>{t.rainfall}: {formatWeatherValue(weather.rainfall, "rainfall", units)}</li>
        <li>{t.wind}: {formatWeatherValue(weather.wind, "wind", units)}</li>
        <li>{t.conditions}: {summary}</li>
      </ul>

      <div className="card__insight">
        <strong>{t.agriculturalInsight}:</strong> {insight}
      </div>

      {isLoggedIn && (
        <div className="card__actions">
          <button type="button" className="secondary-button" onClick={onSave}>
            {t.saveLocation}
          </button>
        </div>
      )}
    </article>
  );
}

export default WeatherCard;

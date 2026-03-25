import { translateSummaryAndInsight } from "../utils/weatherTranslations";

function WeatherCard({ weather, isLoggedIn, onSave, t, language }) {
  if (!weather) return null;

  const { summary, insight } = translateSummaryAndInsight(weather, language);

  return (
    <article className="card">
      <h2 className="card__title">
        {weather.city}, {weather.country}
      </h2>

      <div className="card__meta">
        <span>{t.temperature}: {weather.temperature}°C</span>
        <span>{t.humidity}: {weather.humidity}%</span>
        <span>{t.rainfall}: {weather.rainfall} mm</span>
        <span>{t.wind}: {weather.wind} km/h</span>
        <span>{t.conditions}: {summary}</span>
      </div>

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

import { translateSummaryAndInsight } from '../utils/weatherTranslations';
import './WeatherCard.css';

function WeatherCard({ weather, isLoggedIn, onSave, t, language }) {
  if (!weather) return null;

  const { summary, insight } = translateSummaryAndInsight(weather, language);
  const ndviLabel = t.ndviEstimate || 'Estimated NDVI';
  const sourceLabel = t.dataSource || 'Data source';
  const coordinatesLabel = t.coordinates || 'Coordinates';
  const solarLabel = t.solarRadiation || 'Solar radiation';

  return (
    <article className="card">
      <h2 className="card__title">
        {weather.city}, {weather.country}
      </h2>

      <ul className="card__meta">
        <li>{t.temperature}: {weather.temperature}°C</li>
        <li>{t.humidity}: {weather.humidity}%</li>
        <li>{t.rainfall}: {weather.rainfall} mm</li>
        <li>{t.wind}: {weather.wind} km/h</li>
        <li>{solarLabel}: {weather.solarRadiation} kWh/m²/day</li>
        <li>{t.conditions}: {summary}</li>
        <li>{ndviLabel}: {weather.ndviEstimate} ({weather.ndviLabel})</li>
        <li>{coordinatesLabel}: {weather.latitude}, {weather.longitude}</li>
        <li>{sourceLabel}: {weather.source}</li>
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

import { formatWeatherValue } from "../utils/userPreferences";
import { translateSummaryAndInsight } from "../utils/weatherTranslations";
import "./SavedLocationCard.css";

function SavedLocationCard({ item, onDelete, t, language, units = "metric" }) {
  const { summary, insight } = translateSummaryAndInsight(item, language);

  return (
    <article className="saved-card">
      <h3 className="saved-card__title">
        {item.city}, {item.country}
      </h3>
      <ul className="saved-card__meta">
        <li>{t.temperature}: {formatWeatherValue(item.temperature, "temperature", units)}</li>
        <li>{t.humidity}: {item.humidity}%</li>
        <li>{t.rainfall}: {formatWeatherValue(item.rainfall, "rainfall", units)}</li>
        <li>{t.wind}: {formatWeatherValue(item.wind, "wind", units)}</li>
        <li>{summary}</li>
        <li>{insight}</li>
      </ul>
      <div className="saved-card__actions">
        <button className="ghost-button" type="button" onClick={() => onDelete(item._id)}>
          {t.remove}
        </button>
      </div>
    </article>
  );
}

export default SavedLocationCard;

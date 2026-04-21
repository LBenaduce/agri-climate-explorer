import { translateSummaryAndInsight } from "../utils/weatherTranslations";
import "./SavedLocationCard.css";

function SavedLocationCard({ item, onDelete, t, language }) {
  const { summary, insight } = translateSummaryAndInsight(item, language);

  return (
    <article className="saved-card">
      <h3 className="saved-card__title">
        {item.city}, {item.country}
      </h3>
      <ul className="saved-card__meta">
        <li>{t.temperature}: {item.temperature}°C</li>
        <li>{t.humidity}: {item.humidity}%</li>
        <li>{t.rainfall}: {item.rainfall} mm</li>
        <li>{t.wind}: {item.wind} km/h</li>
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

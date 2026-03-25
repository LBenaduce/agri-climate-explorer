import { translateSummaryAndInsight } from "../utils/weatherTranslations";

function SavedLocationCard({ item, onDelete, t, language }) {
  const { summary, insight } = translateSummaryAndInsight(item, language);

  return (
    <article className="saved-card">
      <h3 className="saved-card__title">
        {item.city}, {item.country}
      </h3>
      <div className="saved-card__meta">
        <span>{t.temperature}: {item.temperature}°C</span>
        <span>{t.humidity}: {item.humidity}%</span>
        <span>{t.rainfall}: {item.rainfall} mm</span>
        <span>{t.wind}: {item.wind} km/h</span>
        <span>{summary}</span>
        <span>{insight}</span>
      </div>
      <div className="saved-card__actions">
        <button className="ghost-button" type="button" onClick={() => onDelete(item._id)}>
          {t.remove}
        </button>
      </div>
    </article>
  );
}

export default SavedLocationCard;

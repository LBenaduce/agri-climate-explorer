import { translateSummaryAndInsight } from '../utils/weatherTranslations';
import './SavedLocationCard.css';

function SavedLocationCard({ item, onDelete, t, language }) {
  const { summary, insight } = translateSummaryAndInsight(item, language);
  const ndviLabel = t.ndviEstimate || 'Estimated NDVI';
  const sourceLabel = t.dataSource || 'Data source';

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
        {typeof item.ndviEstimate === 'number' ? <li>{ndviLabel}: {item.ndviEstimate}</li> : null}
        {item.source ? <li>{sourceLabel}: {item.source}</li> : null}
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

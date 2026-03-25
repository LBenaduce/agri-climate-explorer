import { getRecommendations } from "../utils/agriInsights";

function RecommendationsCard({ weather, t }) {
  const items = getRecommendations(weather);

  return (
    <article className="card">
      <h3 className="card__title">{t.recommendationsTitle}</h3>
      <ul className="saved-card__meta">
        <li><strong>{t.recommendationsPlanting}:</strong> {items.planting}</li>
        <li><strong>{t.recommendationsIrrigation}:</strong> {items.irrigation}</li>
        <li><strong>{t.recommendationsDisease}:</strong> {items.disease}</li>
        <li><strong>{t.recommendationsSpraying}:</strong> {items.spraying}</li>
      </ul>
    </article>
  );
}

export default RecommendationsCard;

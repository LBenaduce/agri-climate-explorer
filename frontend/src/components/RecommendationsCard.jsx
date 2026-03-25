import { getRecommendations } from "../utils/agriInsights";

function RecommendationsCard({ weather, t }) {
  const items = getRecommendations(weather);

  return (
    <article className="card">
      <h3 className="card__title">{t.recommendationsTitle}</h3>
      <div className="saved-card__meta">
        <span><strong>{t.recommendationsPlanting}:</strong> {items.planting}</span>
        <span><strong>{t.recommendationsIrrigation}:</strong> {items.irrigation}</span>
        <span><strong>{t.recommendationsDisease}:</strong> {items.disease}</span>
        <span><strong>{t.recommendationsSpraying}:</strong> {items.spraying}</span>
      </div>
    </article>
  );
}

export default RecommendationsCard;

import { calculateRisk } from "../utils/agriInsights";

function RiskScoreCard({ weather, t }) {
  const { score, level } = calculateRisk(weather);
  const levelLabel =
    level === "high" ? t.highRisk : level === "medium" ? t.mediumRisk : t.lowRisk;

  return (
    <article className={`card risk-card risk-card_level_${level}`}>
      <div className="risk-card__header">
        <h3 className="card__title">{t.riskScore}</h3>
        <span className="risk-card__badge">{levelLabel}</span>
      </div>

      <div className="risk-card__gauge">
        <div className="risk-card__ring">
          <div className="risk-card__value">{score}</div>
        </div>
      </div>
    </article>
  );
}

export default RiskScoreCard;

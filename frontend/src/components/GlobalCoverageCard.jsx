import "./GlobalCoverageCard.css";
function GlobalCoverageCard({ weather, t }) {
  const city = weather?.city || "—";
  const country = weather?.country || "—";

  return (
    <article className="card coverage-card">
      <h3 className="card__title">{t.mapTitle}</h3>
      <p className="page-subtext coverage-card__text">{t.mapText}</p>

      <div className="coverage-card__map">
        <svg viewBox="0 0 600 280" className="coverage-card__svg" aria-hidden="true">
          <path d="M55 90l40-28 60 9 18 28-6 26-32 12-20 24-26-8-20-28z" />
          <path d="M210 60l40-12 60 14 38 24-6 42-34 8-20 34-48-10-24-26-10-34z" />
          <path d="M330 70l40-22 88 8 40 22 20 40-16 32-42 8-36 34-60-12-28-30-8-38z" />
          <path d="M214 176l38 12 18 34-16 30-28 8-30-18-6-26z" />
          <circle cx="355" cy="110" r="8" className="coverage-card__dot" />
        </svg>
      </div>

      <div className="card__insight">
        <strong>{city}</strong>, {country}
      </div>
      {weather?.latitude && weather?.longitude ? (
        <div className="card__insight">
          <strong>{t.coordinates}:</strong> {weather.latitude}, {weather.longitude}
        </div>
      ) : null}
    </article>
  );
}

export default GlobalCoverageCard;

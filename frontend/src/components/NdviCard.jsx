import "./NdviCard.css";

function getNdviLabel(value) {
  if (value >= 0.7) return 'Very high vegetation vigor';
  if (value >= 0.5) return 'Healthy vegetation';
  if (value >= 0.3) return 'Moderate vegetation signal';
  if (value >= 0.15) return 'Low vegetation signal';
  return 'Very sparse vegetation';
}

function NdviCard({ weather, t }) {
  const ndvi = weather?.ndvi;
  if (!ndvi) return null;

  return (
    <article className="card ndvi-card">
      <h3 className="card__title">{t.ndviTitle}</h3>
      <p className="ndvi-card__value">{ndvi.value}</p>
      <p className="page-subtext ndvi-card__text">{getNdviLabel(ndvi.value)}</p>
      <p className="page-subtext ndvi-card__text">{ndvi.resolutionNote}</p>
      <p className="page-subtext ndvi-card__text">{t.lastAvailableDate}: {ndvi.lastAvailableDate}</p>
      <a className="secondary-button ndvi-card__link" href={ndvi.viewerUrl} target="_blank" rel="noreferrer">
        {t.openNasaNdvi}
      </a>
    </article>
  );
}

export default NdviCard;

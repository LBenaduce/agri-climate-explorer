import { useEffect, useMemo, useState } from "react";
import {
  buildCropAlerts,
  buildNdviHistory,
  estimateNdviFromWeather,
  getCropProfile,
  getRegionalCropOptions,
  getRegionProfile,
  getNdviColor,
  getNdviStatus,
} from "../utils/ndviInsights";
import "./NdviDecisionSupport.css";

function NdviSparkline({ history }) {
  const width = 320;
  const height = 96;
  const padding = 12;
  const min = 0.15;
  const max = 0.85;
  const points = history
    .map((item, index) => {
      const x = padding + (index * (width - padding * 2)) / Math.max(history.length - 1, 1);
      const y = height - padding - ((item.ndvi - min) / (max - min)) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg className="ndvi-dss__chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="NDVI temporal trend">
      <polyline className="ndvi-dss__chart-line" points={points} fill="none" />
      {history.map((item, index) => {
        const x = padding + (index * (width - padding * 2)) / Math.max(history.length - 1, 1);
        const y = height - padding - ((item.ndvi - min) / (max - min)) * (height - padding * 2);
        return <circle key={item.label} cx={x} cy={y} r="4" style={{ fill: getNdviColor(item.ndvi) }} />;
      })}
    </svg>
  );
}

function NdviDecisionSupport({ weather, t }) {
  const regionalCropOptions = useMemo(() => getRegionalCropOptions(weather, t), [weather, t]);
  const regionProfile = useMemo(() => getRegionProfile(weather, t), [weather, t]);
  const [crop, setCrop] = useState(regionalCropOptions[0]?.value || "soybean");

  useEffect(() => {
    setCrop((currentCrop) => {
      const isAvailable = regionalCropOptions.some((option) => option.value === currentCrop);
      return isAvailable ? currentCrop : regionalCropOptions[0]?.value || "soybean";
    });
  }, [regionalCropOptions]);

  const history = useMemo(() => buildNdviHistory(weather), [weather]);
  const latestNdvi = history[history.length - 1]?.ndvi || estimateNdviFromWeather(weather);
  const cropProfile = useMemo(() => getCropProfile(crop, t), [crop, t]);
  const { alerts, yieldPotential } = useMemo(
    () => buildCropAlerts({ crop, weather, history, t }),
    [crop, weather, history, t]
  );

  const benchmark = yieldPotential.benchmark;

  return (
    <article className="card ndvi-dss">
      <div className="ndvi-dss__header">
        <div>
          <span className="ndvi-dss__eyebrow">{t.cropDecisionEyebrow || "Crop decision support"}</span>
          <h3 className="card__title">{t.ndviDssTitle || "Crop-Specific NDVI Decision Support"}</h3>
          <p className="page-subtext ndvi-dss__subtitle">
            {t.ndviDssText || "NDVI trend, yield benchmark, disease monitoring, and automatic agronomic alerts by crop."}
          </p>
        </div>
      </div>

      <section className="ndvi-dss__region-panel" aria-label={t.regionCropProfile || "Regional crop profile"}>
        <span className="ndvi-dss__section-label">{t.regionCropProfile || "Regional crop profile"}</span>
        <h4>{regionProfile.label}</h4>
        {regionProfile.location ? <p>{t.regionCropProfileText || "Crop options are adapted to the searched location:"} <b>{regionProfile.location}</b></p> : null}
      </section>

      <section className="ndvi-dss__crop-panel" aria-label={t.cropLabel || "Crop"}>
        <div className="ndvi-dss__crop-title-row">
          <div>
            <span className="ndvi-dss__section-label">{t.cropLabel || "Crop"}</span>
            <h4>{cropProfile.icon} {cropProfile.name}</h4>
          </div>
          <div className="ndvi-dss__crop-toggle" role="group" aria-label={t.cropLabel || "Crop"}>
            {regionalCropOptions.map((option) => (
              <button
                className={crop === option.value ? "ndvi-dss__crop-button ndvi-dss__crop-button_active" : "ndvi-dss__crop-button"}
                key={option.value}
                onClick={() => setCrop(option.value)}
                type="button"
              >
                <span aria-hidden="true">{option.icon}</span>
                {option.label || t[option.labelKey] || option.value}
              </button>
            ))}
          </div>
        </div>
        <p>{cropProfile.description}</p>
        <span className="ndvi-dss__crop-helper">{t.changeCropHint || "Choose a crop to update diseases, yield benchmark and alerts"}</span>
      </section>

      <section className="ndvi-dss__disease-panel" aria-label={cropProfile.diseasesTitle}>
        <div className="ndvi-dss__disease-copy">
          <span className="ndvi-dss__section-label">{cropProfile.diseasesTitle}</span>
          <h4>{cropProfile.diseaseRiskTitle}</h4>
          <p>{cropProfile.diseaseRiskText}</p>
        </div>
        <ul className="ndvi-dss__disease-list">
          {cropProfile.diseases.map((disease) => (
            <li key={disease}>{disease}</li>
          ))}
        </ul>
        <div className="ndvi-dss__scout-box">
          <b>{t.fieldScouting || "Field scouting"}:</b> {cropProfile.scoutRecommendation}
        </div>
      </section>

      <div className="ndvi-dss__layout">
        <div className="ndvi-dss__left">
          <div className="ndvi-dss__analytics-panel">
      <div className="ndvi-dss__metrics">
        <div>
          <span>{latestNdvi.toFixed(2)}</span>
          <small>{t.currentNdvi || "Current NDVI"}</small>
        </div>
        <div>
          <span>{yieldPotential.value}</span>
          <small>{t.estimatedYield || "Estimated yield"} ({benchmark.unit})</small>
        </div>
        <div>
          <span>{benchmark.min}-{benchmark.max}</span>
          <small>{t.regionalBenchmark || "Regional benchmark"} ({benchmark.unit})</small>
        </div>
      </div>

      <div className="ndvi-dss__status">
        <i style={{ backgroundColor: getNdviColor(latestNdvi) }} />
        <span>{getNdviStatus(latestNdvi, t)}</span>
      </div>

      <NdviSparkline history={history} />

          </div>
        </div>
        <div className="ndvi-dss__right">
      <div className="ndvi-dss__alerts" aria-label={t.automaticCropAlerts || "Automatic crop alerts"}>
        <h4>{t.automaticCropAlerts || "Automatic crop alerts"}</h4>
        {alerts.map((alert) => (
          <div className={`ndvi-dss__alert ndvi-dss__alert_${alert.level}`} key={`${alert.title}-${alert.recommendation}`}>
            <strong>{alert.title}</strong>
            <p>{alert.message}</p>
            <p><b>{t.recommendation || "Recommendation"}:</b> {alert.recommendation}</p>
          </div>
        ))}
      </div>
        </div>
      </div>
    </article>
  );
}

export default NdviDecisionSupport;

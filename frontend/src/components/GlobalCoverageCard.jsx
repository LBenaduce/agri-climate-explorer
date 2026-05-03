import { useEffect, useMemo, useState } from "react";
import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import { ndviApi } from "../utils/api";
import { buildLocalNdviFallback, CROPS, getAlertClass, getNdviColor, getNdviStatus } from "../utils/ndviInsights";
import "./GlobalCoverageCard.css";

const BASE_LOCATIONS = [
  { name: "São Martinho", country: "BR", lat: -27.7117, lon: -53.9683, ndvi: 0.54, note: "Moderate vegetation vigor" },
  { name: "Santa Maria", country: "BR", lat: -29.6842, lon: -53.8069, ndvi: 0.62, note: "Healthy crop canopy" },
  { name: "Des Moines", country: "US", lat: 41.5868, lon: -93.625, ndvi: 0.71, note: "Strong vegetation signal" },
  { name: "Córdoba", country: "AR", lat: -31.4201, lon: -64.1888, ndvi: 0.33, note: "Possible crop stress" },
];

function buildLocations(weather, ndviData) {
  if (!weather?.latitude || !weather?.longitude) return BASE_LOCATIONS;

  const currentLocation = {
    name: weather.city || "Current location",
    country: weather.country || "",
    lat: Number(weather.latitude),
    lon: Number(weather.longitude),
    ndvi: Number(ndviData?.currentNdvi ?? 0.55),
    note: ndviData?.source || "NDVI monitoring point",
    active: true,
  };

  const filteredBase = BASE_LOCATIONS.filter(
    (location) => location.name.toLowerCase() !== String(currentLocation.name).toLowerCase()
  );

  return [currentLocation, ...filteredBase];
}

function TrendSparkline({ history }) {
  const points = useMemo(() => {
    if (!Array.isArray(history) || history.length === 0) return "";

    const width = 240;
    const height = 70;
    const min = 0;
    const max = 0.9;

    return history
      .map((item, index) => {
        const x = history.length === 1 ? width : (index / (history.length - 1)) * width;
        const y = height - ((item.ndvi - min) / (max - min)) * height;
        return `${x.toFixed(1)},${Math.max(0, Math.min(height, y)).toFixed(1)}`;
      })
      .join(" ");
  }, [history]);

  return (
    <div className="coverage-card__trend" aria-label="NDVI temporal history">
      <svg viewBox="0 0 240 70" role="img">
        <polyline points={points} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div className="coverage-card__trend-labels">
        <span>{history?.[0]?.date?.slice(0, 7) || ""}</span>
        <span>{history?.[history.length - 1]?.date?.slice(0, 7) || ""}</span>
      </div>
    </div>
  );
}

function GlobalCoverageCard({ weather, t }) {
  const [crop, setCrop] = useState("soybean");
  const [ndviData, setNdviData] = useState(null);
  const [ndviLoading, setNdviLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (!weather?.latitude || !weather?.longitude) {
      setNdviData(buildLocalNdviFallback(weather, crop));
      return undefined;
    }

    setNdviLoading(true);

    ndviApi
      .getNdviHistory({
        latitude: weather.latitude,
        longitude: weather.longitude,
        crop,
        weather,
      })
      .then((data) => {
        if (!cancelled) setNdviData(data);
      })
      .catch(() => {
        if (!cancelled) setNdviData(buildLocalNdviFallback(weather, crop));
      })
      .finally(() => {
        if (!cancelled) setNdviLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [weather, crop]);

  const locations = buildLocations(weather, ndviData);
  const activeLocation = locations[0];
  const averageNdvi = (
    locations.reduce((total, location) => total + location.ndvi, 0) / locations.length
  ).toFixed(2);
  const stressedAreas = locations.filter((location) => location.ndvi < 0.4).length;
  const center = [activeLocation.lat, activeLocation.lon];
  const sourceIsFallback = String(ndviData?.source || "").toLowerCase().includes("fallback");

  return (
    <article className="card coverage-card coverage-card_map">
      <div className="coverage-card__header">
        <div>
          <p className="coverage-card__eyebrow">{t.ndviEyebrow || "Satellite vegetation monitoring"}</p>
          <h3 className="card__title">{t.mapTitle || "Global Agricultural Intelligence"}</h3>
          <p className="page-subtext coverage-card__text">
            {t.mapText || "Interactive NDVI-based map with temporal trend and automatic crop alerts."}
          </p>
        </div>
        <div className="coverage-card__controls">
          <label className="coverage-card__select-label" htmlFor="crop-select">{t.cropLabel || "Crop"}</label>
          <select id="crop-select" className="coverage-card__select" value={crop} onChange={(event) => setCrop(event.target.value)}>
            {CROPS.map((item) => (
              <option key={item.value} value={item.value}>{t[item.labelKey] || item.value}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="coverage-card__stats" aria-label="NDVI summary">
        <div><span>{locations.length}</span><small>{t.mapLocations || "Locations"}</small></div>
        <div><span>{averageNdvi}</span><small>{t.mapAvgNdvi || "Avg NDVI"}</small></div>
        <div><span>{stressedAreas}</span><small>{t.mapStressAlerts || "Stress alerts"}</small></div>
      </div>

      <div className="coverage-card__map" aria-label="Interactive NDVI map">
        <MapContainer center={center} zoom={weather?.latitude ? 5 : 3} scrollWheelZoom={false} className="coverage-card__leaflet">
          <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {locations.map((location) => (
            <CircleMarker
              key={`${location.name}-${location.country}`}
              center={[location.lat, location.lon]}
              radius={location.active ? 12 : 9}
              pathOptions={{ color: getNdviColor(location.ndvi), fillColor: getNdviColor(location.ndvi), fillOpacity: 0.78, weight: location.active ? 3 : 2 }}
            >
              <Popup>
                <strong>{location.name}</strong>{location.country ? `, ${location.country}` : ""}<br />
                NDVI: {location.ndvi.toFixed(2)}<br />
                {getNdviStatus(location.ndvi, t)}<br />
                <span>{location.note}</span>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      <div className="coverage-card__legend">
        <span><i className="coverage-card__legend-dot coverage-card__legend-dot_very-high" /> {t.legendVeryHigh || "Very high"}</span>
        <span><i className="coverage-card__legend-dot coverage-card__legend-dot_high" /> {t.legendHigh || "Active"}</span>
        <span><i className="coverage-card__legend-dot coverage-card__legend-dot_medium" /> {t.legendMedium || "Moderate"}</span>
        <span><i className="coverage-card__legend-dot coverage-card__legend-dot_low" /> {t.legendLow || "Low / stress"}</span>
      </div>

      <div className="coverage-card__ndvi-panel">
        <div>
          <p className="coverage-card__panel-label">{t.currentNdvi || "Current NDVI"}</p>
          <strong>{Number(ndviData?.currentNdvi ?? activeLocation.ndvi).toFixed(2)}</strong>
          <span>{getNdviStatus(Number(ndviData?.currentNdvi ?? activeLocation.ndvi), t)}</span>
        </div>
        <div>
          <p className="coverage-card__panel-label">{t.ndviTrend || "NDVI trend"}</p>
          <strong>{t[`trend_${ndviData?.trend}`] || ndviData?.trend || "stable"}</strong>
          <span>{ndviLoading ? (t.loading || "Loading...") : (sourceIsFallback ? (t.ndviFallback || "Fallback estimator") : (t.ndviSatellite || "Satellite source"))}</span>
        </div>
      </div>

      <TrendSparkline history={ndviData?.history || []} />

      <div className="coverage-card__alerts">
        <h4>{t.automaticAlerts || "Automatic crop alerts"}</h4>
        {(ndviData?.alerts || []).map((alert, index) => (
          <div className={`coverage-card__alert ${getAlertClass(alert.level)}`} key={`${alert.title}-${index}`}>
            <strong>{alert.title}</strong>
            <p>{alert.message}</p>
          </div>
        ))}
      </div>
    </article>
  );
}

export default GlobalCoverageCard;

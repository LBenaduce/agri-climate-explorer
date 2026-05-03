import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import { getNdviColor, getNdviStatus } from "../utils/ndviInsights";
import "./GlobalCoverageCard.css";

const BASE_LOCATIONS = [
  { name: "São Martinho", country: "BR", lat: -27.7117, lon: -53.9683, ndvi: 0.54, note: "Moderate vegetation vigor" },
  { name: "Santa Maria", country: "BR", lat: -29.6842, lon: -53.8069, ndvi: 0.62, note: "Healthy crop canopy" },
  { name: "Des Moines", country: "US", lat: 41.5868, lon: -93.625, ndvi: 0.71, note: "Strong vegetation signal" },
  { name: "Córdoba", country: "AR", lat: -31.4201, lon: -64.1888, ndvi: 0.33, note: "Possible crop stress" },
];

function estimateCurrentNdvi(weather) {
  if (!weather) return 0.55;

  const rainfall = Number(weather.rainfall || 0);
  const humidity = Number(weather.humidity || 0);
  const temperature = Number(weather.temperature || 0);
  const wind = Number(weather.wind || 0);

  let score = 0.52;

  if (humidity >= 55 && humidity <= 85) score += 0.08;
  if (rainfall > 0 && rainfall <= 20) score += 0.06;
  if (temperature >= 18 && temperature <= 30) score += 0.06;
  if (temperature > 34 || wind > 28) score -= 0.12;
  if (rainfall > 45) score -= 0.08;

  return Math.max(0.15, Math.min(0.82, Number(score.toFixed(2))));
}

function buildLocations(weather) {
  if (!weather?.latitude || !weather?.longitude) return BASE_LOCATIONS;

  const currentLocation = {
    name: weather.city || "Current location",
    country: weather.country || "",
    lat: Number(weather.latitude),
    lon: Number(weather.longitude),
    ndvi: estimateCurrentNdvi(weather),
    note: "Estimated from current agrometeorological conditions",
    active: true,
  };

  const filteredBase = BASE_LOCATIONS.filter(
    (location) => location.name.toLowerCase() !== String(currentLocation.name).toLowerCase()
  );

  return [currentLocation, ...filteredBase];
}

function GlobalCoverageCard({ weather, t }) {
  const locations = buildLocations(weather);
  const activeLocation = locations[0];
  const averageNdvi = (
    locations.reduce((total, location) => total + location.ndvi, 0) / locations.length
  ).toFixed(2);
  const stressedAreas = locations.filter((location) => location.ndvi < 0.4).length;
  const center = [activeLocation.lat, activeLocation.lon];

  return (
    <article className="card coverage-card coverage-card_map">
      <div className="coverage-card__header">
        <div>
          <h3 className="card__title">{t.mapTitle || "Global Agricultural Intelligence"}</h3>
          <p className="page-subtext coverage-card__text">
            {t.mapText || "Interactive NDVI-based map for real-time crop health monitoring."}
          </p>
        </div>
        <div className="coverage-card__badge">{t.liveDemo || "Live demo"}</div>
      </div>

      <div className="coverage-card__stats" aria-label="NDVI summary">
        <div><span>{locations.length}</span><small>{t.locationsLabel || "Locations"}</small></div>
        <div><span>{averageNdvi}</span><small>{t.avgNdvi || "Avg NDVI"}</small></div>
        <div><span>{stressedAreas}</span><small>{t.stressAlerts || "Stress alerts"}</small></div>
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
        <span><i className="coverage-card__legend-dot coverage-card__legend-dot_high" /> {t.legendHigh || "High"}</span>
        <span><i className="coverage-card__legend-dot coverage-card__legend-dot_medium" /> {t.legendMedium || "Moderate"}</span>
        <span><i className="coverage-card__legend-dot coverage-card__legend-dot_low" /> {t.legendLow || "Low / stress"}</span>
      </div>

      <div className="card__insight coverage-card__insight">
        <strong>{activeLocation.name}</strong>{activeLocation.country ? `, ${activeLocation.country}` : ""} · Estimated NDVI {activeLocation.ndvi.toFixed(2)} · {getNdviStatus(activeLocation.ndvi, t)}
      </div>
    </article>
  );
}

export default GlobalCoverageCard;

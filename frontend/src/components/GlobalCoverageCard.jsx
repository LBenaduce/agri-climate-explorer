import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./GlobalCoverageCard.css";

const DEFAULT_CENTER = [-29.6842, -53.8069];

const REFERENCE_LOCATIONS = [
  { name: "São Martinho", country: "BR", lat: -27.7117, lon: -53.9683, ndvi: 0.54 },
  { name: "Des Moines", country: "US", lat: 41.5868, lon: -93.625, ndvi: 0.71 },
  { name: "Wageningen", country: "NL", lat: 51.9692, lon: 5.6654, ndvi: 0.48 },
  { name: "Córdoba", country: "AR", lat: -31.4201, lon: -64.1888, ndvi: 0.31 },
];

function estimateNdvi(weather) {
  if (typeof weather?.ndvi === "number") return weather.ndvi;

  const rainfall = Number(weather?.rainfall || weather?.forecastRainTotal || 0);
  const humidity = Number(weather?.humidity || 0);
  const temperature = Number(weather?.temperature || 22);
  const cloudCover = Number(weather?.cloudCover || 0);

  let ndvi = 0.42;
  if (rainfall > 10) ndvi += 0.12;
  else if (rainfall > 1) ndvi += 0.06;
  if (humidity >= 65) ndvi += 0.08;
  if (temperature >= 18 && temperature <= 30) ndvi += 0.06;
  if (temperature > 35 || humidity < 35) ndvi -= 0.12;
  if (cloudCover > 80) ndvi -= 0.04;

  return Math.min(0.82, Math.max(0.18, Number(ndvi.toFixed(2))));
}

function getNdviColor(ndvi) {
  if (ndvi >= 0.6) return "#22c55e";
  if (ndvi >= 0.35) return "#eab308";
  return "#ef4444";
}

function getNdviStatus(ndvi) {
  if (ndvi >= 0.6) return "High vegetation vigor";
  if (ndvi >= 0.35) return "Moderate vegetation vigor";
  return "Low vegetation vigor / stress risk";
}

function buildLocations(weather) {
  const hasCoordinates = Number.isFinite(Number(weather?.latitude)) && Number.isFinite(Number(weather?.longitude));
  const currentLocation = hasCoordinates
    ? [{
        name: weather?.city || "Current location",
        country: weather?.country || "",
        lat: Number(weather.latitude),
        lon: Number(weather.longitude),
        ndvi: estimateNdvi(weather),
        current: true,
      }]
    : [];

  return [...currentLocation, ...REFERENCE_LOCATIONS];
}

function GlobalCoverageCard({ weather, t }) {
  const locations = buildLocations(weather);
  const selectedLocation = locations[0] || REFERENCE_LOCATIONS[0];
  const center = selectedLocation ? [selectedLocation.lat, selectedLocation.lon] : DEFAULT_CENTER;

  return (
    <article className="card coverage-card">
      <div className="coverage-card__header">
        <div>
          <h3 className="card__title">{t.mapTitle}</h3>
          <p className="page-subtext coverage-card__text">{t.mapText}</p>
        </div>
        <div className="coverage-card__badge">NDVI</div>
      </div>

      <div className="coverage-card__map" aria-label="Real map with NDVI monitoring points">
        <MapContainer center={center} zoom={weather?.latitude ? 5 : 3} scrollWheelZoom={false} className="coverage-card__leaflet">
          <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {locations.map((location) => (
            <CircleMarker
              key={`${location.name}-${location.country}-${location.lat}-${location.lon}`}
              center={[location.lat, location.lon]}
              radius={location.current ? 12 : 9}
              pathOptions={{ color: getNdviColor(location.ndvi), fillColor: getNdviColor(location.ndvi), fillOpacity: 0.78, weight: 2 }}
            >
              <Popup>
                <strong>{location.name}{location.country ? `, ${location.country}` : ""}</strong><br />
                NDVI: {location.ndvi.toFixed(2)}<br />
                {getNdviStatus(location.ndvi)}
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      <div className="coverage-card__legend" aria-label="NDVI color legend">
        <span><i className="coverage-card__legend-dot coverage-card__legend-dot_type_high" /> High</span>
        <span><i className="coverage-card__legend-dot coverage-card__legend-dot_type_medium" /> Medium</span>
        <span><i className="coverage-card__legend-dot coverage-card__legend-dot_type_low" /> Low</span>
      </div>

      <div className="card__insight coverage-card__insight">
        <strong>{selectedLocation.name}</strong>{selectedLocation.country ? `, ${selectedLocation.country}` : ""}
        <span>Estimated NDVI: {selectedLocation.ndvi.toFixed(2)}</span>
      </div>
    </article>
  );
}

export default GlobalCoverageCard;

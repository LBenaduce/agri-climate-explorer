import WeatherCard from "../components/WeatherCard";
import Preloader from "../components/Preloader";
import RiskScoreCard from "../components/RiskScoreCard";
import ClimateTrendChart from "../components/ClimateTrendChart";
import RecommendationsCard from "../components/RecommendationsCard";
import GlobalCoverageCard from "../components/GlobalCoverageCard";
import NdviDecisionSupport from "../components/NdviDecisionSupport";

function WeatherResultsSection({
  weather,
  loading,
  error,
  isLoggedIn,
  onSaveLocation,
  t,
  language,
  userPreferences,
  className = "",
}) {
  const classes = ["weather-results", className].filter(Boolean).join(" ");

  return (
    <section className={classes}>
      {loading ? <Preloader t={t} /> : null}
      {error ? <p className="error-text">{error}</p> : null}
      {!loading && !error && weather ? (
        <>
          <WeatherCard
            weather={weather}
            isLoggedIn={isLoggedIn}
            onSave={onSaveLocation}
            t={t}
            language={language}
            units={userPreferences?.units}
          />
          <div className="grid startup-grid">
            <RiskScoreCard weather={weather} t={t} />
            <ClimateTrendChart weather={weather} t={t} language={language} units={userPreferences?.units} />
            <RecommendationsCard weather={weather} t={t} />
            <GlobalCoverageCard weather={weather} t={t} />
            <NdviDecisionSupport weather={weather} t={t} />
          </div>
        </>
      ) : null}
    </section>
  );
}

export default WeatherResultsSection;

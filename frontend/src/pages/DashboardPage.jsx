import SearchForm from "../components/SearchForm";
import WeatherCard from "../components/WeatherCard";
import Preloader from "../components/Preloader";
import RiskScoreCard from "../components/RiskScoreCard";
import ClimateTrendChart from "../components/ClimateTrendChart";
import RecommendationsCard from "../components/RecommendationsCard";
import GlobalCoverageCard from "../components/GlobalCoverageCard";

function DashboardPage({
  weather,
  onSearch,
  loading,
  error,
  onSaveLocation,
  t,
  language
}) {
  return (
    <section className="section">
      <h1 className="page-heading">{t.dashboardTitle}</h1>
      <p className="page-subtext">{t.dashboardText}</p>

      <SearchForm onSearch={onSearch} t={t} />

      <div style={{ marginTop: "22px" }}>
        {loading ? <Preloader t={t} /> : null}
        {error ? <p className="error-text">{error}</p> : null}
        {!loading && !error && weather ? (
          <>
            <WeatherCard
              weather={weather}
              isLoggedIn={true}
              onSave={onSaveLocation}
              t={t}
              language={language}
            />
            <div className="grid startup-grid">
              <RiskScoreCard weather={weather} t={t} />
              <ClimateTrendChart weather={weather} t={t} />
              <RecommendationsCard weather={weather} t={t} />
              <GlobalCoverageCard weather={weather} t={t} />
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}

export default DashboardPage;

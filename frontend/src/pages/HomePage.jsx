import SearchForm from "../components/SearchForm";
import WeatherCard from "../components/WeatherCard";
import Preloader from "../components/Preloader";
import RiskScoreCard from "../components/RiskScoreCard";
import ClimateTrendChart from "../components/ClimateTrendChart";
import RecommendationsCard from "../components/RecommendationsCard";
import GlobalCoverageCard from "../components/GlobalCoverageCard";

function HomePage({
  weather,
  loading,
  error,
  isLoggedIn,
  onSearch,
  onSaveLocation,
  t,
  language
}) {
  return (
    <>
      <section className="hero">
        <div className="hero__panel">
          <span className="hero__eyebrow">{t.heroEyebrow}</span>
          <h1 className="hero__title">{t.heroTitle}</h1>
          <p className="hero__text">{t.heroText}</p>
        </div>

        <div className="hero__stats">
          <div className="stat">
            <span className="stat__value">{t.statOneValue}</span>
            <span className="stat__label">{t.statOneLabel}</span>
          </div>
          <div className="stat">
            <span className="stat__value">{t.statTwoValue}</span>
            <span className="stat__label">{t.statTwoLabel}</span>
          </div>
          <div className="stat">
            <span className="stat__value">{t.statThreeValue}</span>
            <span className="stat__label">{t.statThreeLabel}</span>
          </div>
        </div>
      </section>

      <section className="section">
        <SearchForm onSearch={onSearch} t={t} />
      </section>

      <section className="section">
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
            />
            <div className="grid startup-grid">
              <RiskScoreCard weather={weather} t={t} />
              <ClimateTrendChart weather={weather} t={t} />
              <RecommendationsCard weather={weather} t={t} />
              <GlobalCoverageCard weather={weather} t={t} />
            </div>
          </>
        ) : null}
      </section>
    </>
  );
}

export default HomePage;

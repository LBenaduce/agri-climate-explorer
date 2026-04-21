import SearchForm from "../components/SearchForm";
import WeatherResultsSection from "./WeatherResultsSection";

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

        <ul className="hero__stats">
          <li className="stat">
            <span className="stat__value">{t.statOneValue}</span>
            <span className="stat__label">{t.statOneLabel}</span>
          </li>
          <li className="stat">
            <span className="stat__value">{t.statTwoValue}</span>
            <span className="stat__label">{t.statTwoLabel}</span>
          </li>
          <li className="stat">
            <span className="stat__value">{t.statThreeValue}</span>
            <span className="stat__label">{t.statThreeLabel}</span>
          </li>
        </ul>
      </section>

      <section className="section">
        <SearchForm onSearch={onSearch} t={t} />
      </section>

      <WeatherResultsSection
        weather={weather}
        loading={loading}
        error={error}
        isLoggedIn={isLoggedIn}
        onSaveLocation={onSaveLocation}
        t={t}
        language={language}
        className="section"
      />
    </>
  );
}

export default HomePage;

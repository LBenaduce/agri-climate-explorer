import SearchForm from "../components/SearchForm";
import WeatherResultsSection from "./WeatherResultsSection";

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

      <WeatherResultsSection
        weather={weather}
        loading={loading}
        error={error}
        isLoggedIn
        onSaveLocation={onSaveLocation}
        t={t}
        language={language}
        className="section section_compact-top"
      />
    </section>
  );
}

export default DashboardPage;

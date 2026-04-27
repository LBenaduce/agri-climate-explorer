import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import Header from "./components/Header";
import Footer from "./components/Footer";

import HomePage from "./pages/HomePage";
import DashboardPage from "./pages/DashboardPage";
import SavedLocationsPage from "./pages/SavedLocationsPage";

import LoginModal from "./components/LoginModal";
import RegisterModal from "./components/RegisterModal";
import ProtectedRoute from "./components/ProtectedRoute";

import { authApi, locationsApi, weatherApi } from "./utils/api";
import { CurrentUserContext } from "./contexts/CurrentUserContext";
import translations, { languageOptions } from "./utils/translations";

function normalizeLanguage(languageCode) {
  if (!languageCode) return "";

  const code = languageCode.toLowerCase();

  if (code.startsWith("zh")) return "zh";
  if (code.startsWith("pt")) return "pt";
  if (code.startsWith("es")) return "es";
  if (code.startsWith("fr")) return "fr";
  if (code.startsWith("de")) return "de";
  if (code.startsWith("it")) return "it";
  if (code.startsWith("ru")) return "ru";
  if (code.startsWith("ja")) return "ja";
  if (code.startsWith("ar")) return "ar";
  if (code.startsWith("hi")) return "hi";

  return code.split("-")[0];
}

function detectInitialLanguage() {
  const supportedLanguages = languageOptions.map((option) => option.code);
  const savedLanguage = localStorage.getItem("language");

  if (savedLanguage && supportedLanguages.includes(savedLanguage)) {
    return savedLanguage;
  }

  const browserLanguages = navigator.languages?.length
    ? navigator.languages
    : [navigator.language || "en"];

  const detectedLanguage = browserLanguages
    .map(normalizeLanguage)
    .find((item) => supportedLanguages.includes(item));

  return detectedLanguage || "en";
}

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [weather, setWeather] = useState(null);
  const [savedLocations, setSavedLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uiError, setUiError] = useState("");
  const [activeModal, setActiveModal] = useState("");
  const [language, setLanguage] = useState(detectInitialLanguage);

  const t = translations[language] || translations.en;
  const isLoggedIn = Boolean(currentUser);

  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (!token) return;

    authApi
      .getProfile(token)
      .then((user) => {
        setCurrentUser(user);

        if (user.preferredLanguage && translations[user.preferredLanguage]) {
          setLanguage(user.preferredLanguage);
        }

        return locationsApi.getSavedLocations(token);
      })
      .then((data) => setSavedLocations(data))
      .catch(() => {
        localStorage.removeItem("jwt");
      });
  }, []);

  function closeModal() {
    setActiveModal("");
    setUiError("");
  }

  function openLogin() {
    setUiError("");
    setActiveModal("login");
  }

  function openRegister() {
    setUiError("");
    setActiveModal("register");
  }

  function handleLanguageChange(nextLanguage) {
    setLanguage(nextLanguage);
    localStorage.setItem("language", nextLanguage);

    const token = localStorage.getItem("jwt");
    if (!token) return;

    authApi
      .updatePreferredLanguage(token, nextLanguage)
      .then((user) => setCurrentUser(user))
      .catch(() => {});
  }

  function handleWeatherSearch(city) {
    setLoading(true);
    setUiError("");
    setWeather(null);

    weatherApi
      .getWeather(city, language)
      .then((data) => {
        setUiError("");
        setWeather(data);
      })
      .catch((error) => {
        setWeather(null);
        setUiError(error.message || t.loadError || "Unable to load data.");
      })
      .finally(() => setLoading(false));
  }

  function handleRegister({ name, email, password, marketingConsent }) {
    setUiError("");

    authApi
      .register({ name, email, password, marketingConsent, preferredLanguage: language })
      .then(() => authApi.login({ email, password }))
      .then(({ token }) => {
        localStorage.setItem("jwt", token);
        return authApi.getProfile(token);
      })
      .then((user) => {
        setCurrentUser(user);
        if (user.preferredLanguage && translations[user.preferredLanguage]) {
          setLanguage(user.preferredLanguage);
        }
        setSavedLocations([]);
        closeModal();
      })
      .catch((error) => {
        setUiError(error.message || t.registrationFailed || "Registration failed.");
      });
  }

  function handleLogin({ email, password }) {
    setUiError("");

    authApi
      .login({ email, password })
      .then(({ token }) => {
        localStorage.setItem("jwt", token);
        return Promise.all([
          authApi.getProfile(token),
          locationsApi.getSavedLocations(token),
        ]);
      })
      .then(([user, locations]) => {
        setCurrentUser(user);
        if (user.preferredLanguage && translations[user.preferredLanguage]) {
          setLanguage(user.preferredLanguage);
        }
        setSavedLocations(locations);
        closeModal();
      })
      .catch((error) => {
        setUiError(error.message || t.loginFailed || "Login failed.");
      });
  }

  function handleLogout() {
    localStorage.removeItem("jwt");
    setCurrentUser(null);
    setSavedLocations([]);
    setWeather(null);
    setUiError("");
  }

  function handleSaveLocation() {
    const token = localStorage.getItem("jwt");
    if (!token || !weather) return;

    locationsApi
      .saveLocation(token, {
        city: weather.city,
        country: weather.country,
        temperature: weather.temperature,
        humidity: weather.humidity,
        rainfall: weather.rainfall,
        wind: weather.wind,
        summary: weather.summary,
        insight: weather.insight,
      })
      .then((item) => {
        setSavedLocations((prev) => [item, ...prev]);
        setUiError("");
      })
      .catch((error) => {
        setUiError(error.message || t.saveFailed || "Could not save location.");
      });
  }

  function handleDeleteLocation(id) {
    const token = localStorage.getItem("jwt");
    if (!token) return;

    locationsApi
      .deleteLocation(token, id)
      .then(() => {
        setSavedLocations((prev) => prev.filter((item) => item._id !== id));
        setUiError("");
      })
      .catch((error) => {
        setUiError(error.message || t.deleteFailed || "Could not delete location.");
      });
  }

  return (
    <CurrentUserContext.Provider value={currentUser}>
      <div className="page">
        <Header
          isLoggedIn={isLoggedIn}
          onLoginClick={openLogin}
          onRegisterClick={openRegister}
          onLogout={handleLogout}
          language={language}
          setLanguage={handleLanguageChange}
          t={t}
        />

        <main className="content">
          <Routes>
            <Route
              path="/"
              element={
                <HomePage
                  weather={weather}
                  loading={loading}
                  error={uiError}
                  isLoggedIn={isLoggedIn}
                  onSearch={handleWeatherSearch}
                  onSaveLocation={handleSaveLocation}
                  t={t}
                  language={language}
                />
              }
            />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute isLoggedIn={isLoggedIn}>
                  <DashboardPage
                    weather={weather}
                    onSearch={handleWeatherSearch}
                    loading={loading}
                    error={uiError}
                    onSaveLocation={handleSaveLocation}
                    t={t}
                    language={language}
                  />
                </ProtectedRoute>
              }
            />

            <Route
              path="/saved"
              element={
                <ProtectedRoute isLoggedIn={isLoggedIn}>
                  <SavedLocationsPage
                    items={savedLocations}
                    onDelete={handleDeleteLocation}
                    t={t}
                    language={language}
                  />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer t={t} />

        <LoginModal
          isOpen={activeModal === "login"}
          onClose={closeModal}
          onSubmit={handleLogin}
          error={uiError}
          t={t}
        />

        <RegisterModal
          isOpen={activeModal === "register"}
          onClose={closeModal}
          onSubmit={handleRegister}
          error={uiError}
          t={t}
        />
      </div>
    </CurrentUserContext.Provider>
  );
}

export default App;

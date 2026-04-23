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
import translations from "./utils/translations";

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [weather, setWeather] = useState(null);
  const [savedLocations, setSavedLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uiError, setUiError] = useState("");
  const [activeModal, setActiveModal] = useState("");

  const [language, setLanguage] = useState(() => {
    const savedLanguage = localStorage.getItem("language");
    const browserLanguage = navigator.language.split("-")[0];
    return savedLanguage || browserLanguage || "en";
  });

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

  function handleWeatherSearch(city) {
    setLoading(true);
    setUiError("");
    setWeather(null);

    weatherApi
      .getWeather(city)
      .then((data) => {
        setUiError("");
        setWeather(data);
      })
      .catch((error) => {
        setWeather(null);
        setUiError(error.message || "Unable to load data.");
      })
      .finally(() => setLoading(false));
  }

  function handleRegister({ name, email, password, marketingConsent }) {
    setUiError("");

    authApi
      .register({ name, email, password, marketingConsent })
      .then(() => authApi.login({ email, password }))
      .then(({ token }) => {
        localStorage.setItem("jwt", token);
        return authApi.getProfile(token);
      })
      .then((user) => {
        setCurrentUser(user);
        setSavedLocations([]);
        closeModal();
      })
      .catch((error) => {
        setUiError(error.message || "Registration failed.");
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
        setSavedLocations(locations);
        closeModal();
      })
      .catch((error) => {
        setUiError(error.message || "Login failed.");
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
        setUiError(error.message || "Could not save location.");
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
        setUiError(error.message || "Could not delete location.");
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
          setLanguage={setLanguage}
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
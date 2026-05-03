const BASE_URL =
  import.meta.env.VITE_API_URL || "https://agri-climate-backend.onrender.com/api";

function handleResponse(response) {
  if (!response.ok) {
    return response
      .json()
      .catch(() => ({}))
      .then((data) => {
        throw new Error(
          data.message || `Request failed with status ${response.status}`
        );
      });
  }

  return response.json();
}

export const weatherApi = {
  getWeather(city, language = "en") {
    const params = new URLSearchParams({ city, lang: language });

    return fetch(`${BASE_URL}/weather?${params.toString()}`, {
      headers: {
        "Accept-Language": language,
      },
    }).then(handleResponse);
  },
};


export const ndviApi = {
  getNdviHistory({ latitude, longitude, crop = "soybean", weather = {} }) {
    const params = new URLSearchParams({
      lat: latitude,
      lon: longitude,
      crop,
      temperature: weather.temperature ?? 0,
      humidity: weather.humidity ?? 0,
      rainfall: weather.rainfall ?? 0,
      forecastRainProbability: weather.forecastRainProbability ?? 0,
    });

    return fetch(`${BASE_URL}/ndvi?${params.toString()}`).then(handleResponse);
  },
};

export const authApi = {
  register(data) {
    return fetch(`${BASE_URL}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(handleResponse);
  },

  login(data) {
    return fetch(`${BASE_URL}/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(handleResponse);
  },

  getProfile(token) {
    return fetch(`${BASE_URL}/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(handleResponse);
  },

  updatePreferredLanguage(token, preferredLanguage) {
    return fetch(`${BASE_URL}/users/me/language`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ preferredLanguage }),
    }).then(handleResponse);
  },
};

export const locationsApi = {
  getSavedLocations(token) {
    return fetch(`${BASE_URL}/locations`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(handleResponse);
  },

  saveLocation(token, payload) {
    return fetch(`${BASE_URL}/locations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    }).then(handleResponse);
  },

  deleteLocation(token, id) {
    return fetch(`${BASE_URL}/locations/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(handleResponse);
  },
};

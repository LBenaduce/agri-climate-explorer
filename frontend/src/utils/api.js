const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

function handleResponse(response) {
  if (!response.ok) {
    return response
      .json()
      .catch(() => ({}))
      .then((data) => {
        throw new Error(data.message || `Request failed with status ${response.status}`);
      });
  }

  return response.json();
}

export const weatherApi = {
  getWeather(city, token) {
    return fetch(`${BASE_URL}/weather?city=${encodeURIComponent(city)}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(handleResponse);
  }
};

export const authApi = {
  register(data) {
    return fetch(`${BASE_URL}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }).then(handleResponse);
  },

  login(data) {
    return fetch(`${BASE_URL}/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }).then(handleResponse);
  },

  getProfile(token) {
    return fetch(`${BASE_URL}/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).then(handleResponse);
  }
};

export const locationsApi = {
  getSavedLocations(token) {
    return fetch(`${BASE_URL}/locations`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).then(handleResponse);
  },

  saveLocation(token, payload) {
    return fetch(`${BASE_URL}/locations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    }).then(handleResponse);
  },

  deleteLocation(token, id) {
    return fetch(`${BASE_URL}/locations/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).then(handleResponse);
  }
};

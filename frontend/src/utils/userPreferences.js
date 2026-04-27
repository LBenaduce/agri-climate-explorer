const IMPERIAL_COUNTRIES = new Set(["US", "LR", "MM"]);

const FALLBACK_PREFERENCES = {
  country: "",
  city: "",
  region: "",
  units: "metric",
};

export function getUnitsForCountry(countryCode = "") {
  return IMPERIAL_COUNTRIES.has(countryCode.toUpperCase()) ? "imperial" : "metric";
}

export function detectBrowserLanguage() {
  if (typeof navigator === "undefined") return ["en"];

  return navigator.languages?.length
    ? navigator.languages
    : [navigator.language || "en"];
}

export async function detectLocationPreferences() {
  try {
    const response = await fetch("https://ipapi.co/json/", {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error("Location lookup failed");
    }

    const data = await response.json();
    const country = data.country_code || data.country || "";

    return {
      country,
      city: data.city || "",
      region: data.region || data.region_code || "",
      units: getUnitsForCountry(country),
    };
  } catch {
    return FALLBACK_PREFERENCES;
  }
}

export function formatWeatherValue(value, type, units = "metric") {
  if (value === null || value === undefined || value === "") return "—";

  const number = Number(value);
  if (Number.isNaN(number)) return value;

  if (type === "temperature") {
    if (units === "imperial") {
      return `${Math.round((number * 9) / 5 + 32)}°F`;
    }

    return `${Math.round(number)}°C`;
  }

  if (type === "rainfall") {
    if (units === "imperial") {
      return `${(number / 25.4).toFixed(2)} in`;
    }

    return `${number} mm`;
  }

  if (type === "wind") {
    if (units === "imperial") {
      return `${Math.round(number * 0.621371)} mph`;
    }

    return `${number} km/h`;
  }

  return number;
}

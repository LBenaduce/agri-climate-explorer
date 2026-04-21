import { useState } from "react";
import "./SearchForm.css";

function SearchForm({ onSearch, t }) {
  const [city, setCity] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    if (!city.trim()) return;
    onSearch(city.trim());
  }

  return (
    <form className="search" onSubmit={handleSubmit}>
      <label className="search__hint" htmlFor="city">
        {t.searchLabel}
      </label>

      <div className="search__row">
        <input
          id="city"
          className="search__input"
          type="text"
          placeholder={t.searchPlaceholder}
          value={city}
          onChange={(event) => setCity(event.target.value)}
          required
        />
        <button className="primary-button" type="submit">
          {t.searchButton}
        </button>
      </div>
    </form>
  );
}

export default SearchForm;

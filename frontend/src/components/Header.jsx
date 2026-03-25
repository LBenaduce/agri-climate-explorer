import { Link, NavLink } from "react-router-dom";
import { languageOptions } from "../utils/translations";

function Header({
  isLoggedIn,
  onLoginClick,
  onRegisterClick,
  onLogout,
  language,
  setLanguage,
  t
}) {
  return (
    <header className="header">
      <Link to="/" className="header__brand">
        Agri<span className="header__brand-accent">Climate</span> Explorer
      </Link>

      <nav className="header__nav">
        <NavLink to="/" className="link-button">
          {t.home}
        </NavLink>

        {isLoggedIn && (
          <>
            <NavLink to="/dashboard" className="link-button">
              {t.dashboard}
            </NavLink>
            <NavLink to="/saved" className="link-button">
              {t.saved}
            </NavLink>
          </>
        )}

        <label className="language-select">
          <span className="language-select__label">{t.language}</span>
          <select
            className="language-select__control"
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
          >
            {languageOptions.map((option) => (
              <option key={option.code} value={option.code}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        {!isLoggedIn ? (
          <>
            <button className="secondary-button" type="button" onClick={onRegisterClick}>
              {t.register}
            </button>
            <button className="primary-button" type="button" onClick={onLoginClick}>
              {t.login}
            </button>
          </>
        ) : (
          <button className="ghost-button" type="button" onClick={onLogout}>
            {t.logout}
          </button>
        )}
      </nav>
    </header>
  );
}

export default Header;

import { useState } from "react";

function RegisterModal({ isOpen, onClose, onSubmit, error, t }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit({ name, email, password });
  }

  return (
    <div className={`auth-modal ${isOpen ? "auth-modal_opened" : ""}`}>
      <div className="auth-modal__content">
        <h2 className="auth-modal__title">{t.registerTitle}</h2>
        <form className="auth-modal__form" onSubmit={handleSubmit}>
          <input
            className="auth-modal__input"
            type="text"
            placeholder={t.name}
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
          <input
            className="auth-modal__input"
            type="email"
            placeholder={t.email}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <input
            className="auth-modal__input"
            type="password"
            placeholder={t.password}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength="6"
            required
          />

          {error ? <span className="error-text">{error}</span> : null}

          <div className="auth-modal__footer">
            <button type="button" className="ghost-button" onClick={onClose}>
              {t.cancel}
            </button>
            <button type="submit" className="primary-button">
              {t.createAccount}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RegisterModal;
import { useState } from "react";
import Modal from "./Modal";
import "./RegisterModal.css";

function RegisterModal({ isOpen, onClose, onSubmit, error, t }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [marketingConsent, setMarketingConsent] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit({ name, email, password, marketingConsent });
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="auth-modal__content" role="dialog" aria-modal="true" aria-labelledby="register-modal-title">
        <h2 className="auth-modal__title" id="register-modal-title">{t.registerTitle}</h2>
        <form className="auth-modal__form" onSubmit={handleSubmit} noValidate>
          <input className="auth-modal__input" type="text" placeholder={t.name} value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" minLength="2" maxLength="40" required />
          <input className="auth-modal__input" type="email" placeholder={t.email} value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required />
          <input className="auth-modal__input" type="password" placeholder={t.password} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" minLength="6" required />

          <label className="auth-modal__checkbox">
            <input type="checkbox" checked={marketingConsent} onChange={(event) => setMarketingConsent(event.target.checked)} />
            <span>{t.marketingConsent}</span>
          </label>

          {error ? <span className="error-text">{error}</span> : null}

          <div className="auth-modal__footer">
            <button type="button" className="ghost-button" onClick={onClose}>{t.cancel}</button>
            <button type="submit" className="primary-button">{t.createAccount}</button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

export default RegisterModal;

import { useEffect, useState } from "react";
import Modal from "./Modal";
import "./LoginModal.css";

function LoginModal({ isOpen, onClose, onSubmit, error, t }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setEmail("");
      setPassword("");
    }
  }, [isOpen]);

  function handleSubmit(event) {
    event.preventDefault();
    event.stopPropagation();
    onSubmit({ email: email.trim(), password });
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div
        className="auth-modal__content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-modal-title"
      >
        <h2 className="auth-modal__title" id="login-modal-title">
          {t.loginTitle}
        </h2>
        <form
          className="auth-modal__form"
          onSubmit={handleSubmit}
          method="post"
          action="#"
          noValidate
        >
          <input
            className="auth-modal__input"
            type="email"
            name="email"
            placeholder={t.email}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />
          <input
            className="auth-modal__input"
            type="password"
            name="password"
            placeholder={t.password}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            minLength="6"
            required
          />

          {error ? <span className="error-text">{error}</span> : null}

          <div className="auth-modal__footer">
            <button type="button" className="ghost-button" onClick={onClose}>
              {t.cancel}
            </button>
            <button type="submit" className="primary-button">
              {t.enter}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

export default LoginModal;

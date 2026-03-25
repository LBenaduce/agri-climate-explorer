import { useEffect } from "react";

function Modal({ isOpen, onClose, children }) {
  useEffect(() => {
    if (!isOpen) return undefined;

    function handleEscape(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  function handleOverlayMouseDown(event) {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  return (
    <div
      className={`auth-modal ${isOpen ? "auth-modal_opened" : ""}`}
      onMouseDown={handleOverlayMouseDown}
      aria-hidden={!isOpen}
    >
      {children}
    </div>
  );
}

export default Modal;

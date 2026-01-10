import React, { useEffect } from 'react';
import './ConfirmDialog.css';

function ConfirmDialog({ show, title, message, onConfirm, onCancel, confirmText = 'Подтвердить', cancelText = 'Отмена', type = 'danger' }) {
  useEffect(() => {
    if (show) {
      const handleEscape = (e) => {
        if (e.key === 'Escape') {
          onCancel();
        }
      };
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = 'unset';
      };
    }
  }, [show, onCancel]);

  if (!show) return null;

  return (
    <div className="confirm-dialog-overlay" onClick={onCancel}>
      <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
        <h3 className="confirm-dialog-title">{title}</h3>
        <p className="confirm-dialog-message">{message}</p>
        <div className="confirm-dialog-actions">
          <button
            className="confirm-dialog-button confirm-dialog-button-cancel"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            className={`confirm-dialog-button confirm-dialog-button-${type}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;


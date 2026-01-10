import React from 'react';
import './Notification.css';

function Notification({ message, type = 'success', onClose, show }) {
  if (!show) return null;

  return (
    <div className={`notification notification-${type}`}>
      <div className="notification-content">
        <div className="notification-icon">
          {type === 'success' && '✓'}
          {type === 'error' && '✗'}
          {type === 'info' && 'ℹ'}
        </div>
        <div className="notification-message">{message}</div>
        {onClose && (
          <button className="notification-close" onClick={onClose}>
            ×
          </button>
        )}
      </div>
    </div>
  );
}

export default Notification;


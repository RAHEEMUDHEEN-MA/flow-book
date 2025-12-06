import React from 'react';
import { getFirebaseErrorInfo } from '../lib/firebase-error-handler';

interface ErrorDisplayProps {
  error: unknown;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, onRetry, onDismiss }) => {
  const errorInfo = getFirebaseErrorInfo(error);

  return (
    <div className="error-display">
      <div className="error-content">
        <div className="error-icon">⚠️</div>
        <h3 className="error-title">{errorInfo.title}</h3>
        <p className="error-message">{errorInfo.message}</p>
        {errorInfo.action && (
          <p className="error-action">
            <strong>Suggested action:</strong> {errorInfo.action}
          </p>
        )}
        <div className="error-buttons">
          {onRetry && (
            <button onClick={onRetry} className="btn-retry">
              Try Again
            </button>
          )}
          {onDismiss && (
            <button onClick={onDismiss} className="btn-dismiss">
              Dismiss
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

interface ErrorToastProps {
  error: unknown;
  duration?: number;
  onClose?: () => void;
}

export const ErrorToast: React.FC<ErrorToastProps> = ({ error, duration = 5000, onClose }) => {
  const errorInfo = getFirebaseErrorInfo(error);

  React.useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <div className="error-toast">
      <div className="error-toast-icon">⚠️</div>
      <div className="error-toast-content">
        <strong>{errorInfo.title}</strong>
        <p>{errorInfo.message}</p>
      </div>
      {onClose && (
        <button onClick={onClose} className="error-toast-close">
          ×
        </button>
      )}
    </div>
  );
};

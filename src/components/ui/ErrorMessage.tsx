import React from 'react';

interface ErrorMessageProps {
  title?: string;
  message: string;
  details?: string;
  type?: 'error' | 'warning' | 'info';
  dismissible?: boolean;
  onDismiss?: () => void;
  actionButton?: {
    text: string;
    onClick: () => void;
  };
  className?: string;
}

const typeStyles = {
  error: {
    container: 'bg-red-50 border-red-200 text-red-800',
    icon: 'text-red-600',
    iconPath: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.966-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z'
  },
  warning: {
    container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    icon: 'text-yellow-600',
    iconPath: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.966-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z'
  },
  info: {
    container: 'bg-blue-50 border-blue-200 text-blue-800',
    icon: 'text-blue-600',
    iconPath: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
  }
};

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title,
  message,
  details,
  type = 'error',
  dismissible = false,
  onDismiss,
  actionButton,
  className = ''
}) => {
  const style = typeStyles[type];

  return (
    <div className={`border rounded-lg p-4 ${style.container} ${className}`} role="alert">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg
            className={`w-5 h-5 ${style.icon}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={style.iconPath}
            />
          </svg>
        </div>
        
        <div className="ml-3 flex-1">
          {title && (
            <h3 className="text-sm font-medium mb-1">{title}</h3>
          )}
          
          <p className="text-sm">{message}</p>
          
          {details && (
            <div className="mt-2">
              <details className="cursor-pointer">
                <summary className="text-xs font-medium hover:underline">
                  View Details
                </summary>
                <pre className="mt-1 text-xs bg-white bg-opacity-50 rounded p-2 overflow-auto">
                  {details}
                </pre>
              </details>
            </div>
          )}
          
          {actionButton && (
            <div className="mt-3">
              <button
                onClick={actionButton.onClick}
                className={`
                  inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded
                  ${type === 'error' ? 'bg-red-100 text-red-800 hover:bg-red-200' : ''}
                  ${type === 'warning' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' : ''}
                  ${type === 'info' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' : ''}
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-opacity-50
                  transition-colors duration-200
                `}
              >
                {actionButton.text}
              </button>
            </div>
          )}
        </div>
        
        {dismissible && onDismiss && (
          <div className="ml-auto pl-3">
            <button
              onClick={onDismiss}
              className={`
                inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2
                ${style.icon} hover:bg-black hover:bg-opacity-10 focus:ring-opacity-50
              `}
              aria-label="Dismiss"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

interface FormErrorProps {
  error: string | null;
  className?: string;
}

export const FormError: React.FC<FormErrorProps> = ({ error, className = '' }) => {
  if (!error) return null;
  
  return (
    <div className={`text-red-600 text-sm mt-1 ${className}`} role="alert">
      {error}
    </div>
  );
};

interface ApiErrorDisplayProps {
  error: any;
  retry?: () => void;
  className?: string;
}

export const ApiErrorDisplay: React.FC<ApiErrorDisplayProps> = ({ 
  error, 
  retry,
  className = '' 
}) => {
  if (!error) return null;

  const getErrorMessage = (error: any): string => {
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
    if (error?.error) return error.error;
    return 'An unexpected error occurred';
  };

  const getErrorDetails = (error: any): string | undefined => {
    if (error?.details && typeof error.details === 'object') {
      return JSON.stringify(error.details, null, 2);
    }
    if (error?.stack && process.env.NODE_ENV === 'development') {
      return error.stack;
    }
    return undefined;
  };

  return (
    <ErrorMessage
      type="error"
      title="Request Failed"
      message={getErrorMessage(error)}
      details={getErrorDetails(error)}
      actionButton={retry ? { text: 'Try Again', onClick: retry } : undefined}
      className={className}
    />
  );
};

export default ErrorMessage;
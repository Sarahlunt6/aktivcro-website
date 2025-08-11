import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'accent' | 'white' | 'gray';
  className?: string;
  label?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12'
};

const colorClasses = {
  primary: 'text-primary border-primary',
  secondary: 'text-secondary border-secondary',
  accent: 'text-accent border-accent',
  white: 'text-white border-white',
  gray: 'text-gray-600 border-gray-600'
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className = '',
  label = 'Loading...'
}) => {
  return (
    <div className={`inline-flex items-center justify-center ${className}`} role="status" aria-label={label}>
      <div
        className={`
          ${sizeClasses[size]}
          ${colorClasses[color]}
          animate-spin
          rounded-full
          border-2
          border-current
          border-t-transparent
        `}
      />
      {label && (
        <span className="sr-only">{label}</span>
      )}
    </div>
  );
};

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading: boolean;
  loadingText?: string;
  spinnerSize?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  loading,
  loadingText,
  spinnerSize = 'sm',
  children,
  disabled,
  className = '',
  ...props
}) => {
  return (
    <button
      {...props}
      disabled={loading || disabled}
      className={`
        relative
        inline-flex
        items-center
        justify-center
        px-4
        py-2
        font-medium
        rounded-lg
        transition-all
        duration-200
        disabled:opacity-60
        disabled:cursor-not-allowed
        ${loading ? 'cursor-wait' : ''}
        ${className}
      `}
    >
      {loading && (
        <LoadingSpinner
          size={spinnerSize}
          color="white"
          className="mr-2"
          label={loadingText}
        />
      )}
      <span className={loading ? 'opacity-80' : ''}>
        {loading && loadingText ? loadingText : children}
      </span>
    </button>
  );
};

interface LoadingOverlayProps {
  loading: boolean;
  children: React.ReactNode;
  className?: string;
  spinnerSize?: 'sm' | 'md' | 'lg' | 'xl';
  label?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  loading,
  children,
  className = '',
  spinnerSize = 'lg',
  label = 'Loading...'
}) => {
  return (
    <div className={`relative ${className}`}>
      {children}
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
          <div className="text-center">
            <LoadingSpinner size={spinnerSize} label={label} />
            {label && (
              <p className="mt-2 text-sm text-gray-600">{label}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height = 20,
  className = '',
  variant = 'text'
}) => {
  const baseClasses = 'animate-pulse bg-gray-200';
  
  const variantClasses = {
    text: 'rounded',
    rectangular: 'rounded-lg',
    circular: 'rounded-full'
  };

  const style: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
      role="presentation"
      aria-label="Loading placeholder"
    />
  );
};

interface SkeletonTextProps {
  lines?: number;
  className?: string;
}

export const SkeletonText: React.FC<SkeletonTextProps> = ({
  lines = 3,
  className = ''
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton
          key={index}
          width={index === lines - 1 ? '75%' : '100%'}
          height={16}
        />
      ))}
    </div>
  );
};

export default LoadingSpinner;
import { memo } from 'react'

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large'
  className?: string
  message?: string
}

export const LoadingSpinner = memo(function LoadingSpinner({
  size = 'medium',
  className = '',
  message
}: LoadingSpinnerProps) {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8', 
    large: 'w-12 h-12'
  }

  return (
    <div 
      className={`flex flex-col items-center justify-center ${className}`}
      data-testid="loading-spinner"
    >
      <div 
        className={`
          ${sizeClasses[size]} 
          border-2 border-gray-200 border-t-blue-500 
          rounded-full animate-spin
        `}
        role="status"
        aria-label="Loading"
      />
      {message && (
        <p className="mt-2 text-sm text-gray-600">{message}</p>
      )}
    </div>
  )
})

export default LoadingSpinner
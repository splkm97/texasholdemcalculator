import { useCallback, useEffect, useState } from 'react'
import { errorHandler, ErrorInfo } from '../utils/errorHandler'

export interface UseErrorHandlerReturn {
  handleError: (error: Error | string, context?: Record<string, any>) => void
  clearErrors: () => void
  errors: ErrorInfo[]
  latestError: ErrorInfo | null
  hasErrors: boolean
}

export function useErrorHandler(): UseErrorHandlerReturn {
  const [errors, setErrors] = useState<ErrorInfo[]>([])
  
  // Update errors when they change
  useEffect(() => {
    const updateErrors = () => {
      setErrors(errorHandler.getErrors())
    }
    
    // Initial load
    updateErrors()
    
    // Set up interval to check for new errors
    const interval = setInterval(updateErrors, 1000)
    
    return () => clearInterval(interval)
  }, [])
  
  const handleError = useCallback((error: Error | string, context?: Record<string, any>) => {
    errorHandler.handleError(error, context)
    setErrors(errorHandler.getErrors())
  }, [])
  
  const clearErrors = useCallback(() => {
    errorHandler.clearErrors()
    setErrors([])
  }, [])
  
  const latestError = errors.length > 0 ? errors[0] : null
  const hasErrors = errors.length > 0
  
  return {
    handleError,
    clearErrors,
    errors,
    latestError,
    hasErrors
  }
}
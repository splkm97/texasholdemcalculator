/**
 * Centralized error handling system for the poker calculator
 */

export interface ErrorInfo {
  code: string
  message: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  context?: Record<string, any>
  timestamp: number
  userAgent?: string
}

export interface ErrorHandler {
  handleError: (error: Error | string, context?: Record<string, any>) => void
  reportError: (errorInfo: ErrorInfo) => void
  getErrorMessage: (error: Error | string) => string
  clearErrors: () => void
  getErrors: () => ErrorInfo[]
}

// Error codes and their user-friendly messages
export const ERROR_MESSAGES: Record<string, { message: string; severity: ErrorInfo['severity'] }> = {
  // Card-related errors
  INVALID_CARD: { message: 'Invalid card selected', severity: 'medium' },
  DUPLICATE_CARD: { message: 'Card already selected', severity: 'medium' },
  INSUFFICIENT_CARDS: { message: 'Need at least 2 hole cards', severity: 'medium' },
  INVALID_SUIT: { message: 'Invalid card suit', severity: 'medium' },
  INVALID_RANK: { message: 'Invalid card rank', severity: 'medium' },
  
  // Calculation errors
  CALCULATION_FAILED: { message: 'Probability calculation failed', severity: 'high' },
  INVALID_CALCULATION_REQUEST: { message: 'Invalid calculation parameters', severity: 'medium' },
  CALCULATION_TIMEOUT: { message: 'Calculation took too long', severity: 'high' },
  WORKER_ERROR: { message: 'Background calculation failed', severity: 'high' },
  
  // Validation errors
  INVALID_HAND: { message: 'Invalid poker hand', severity: 'medium' },
  INVALID_STAGE: { message: 'Invalid game stage', severity: 'medium' },
  INVALID_COMMUNITY_CARDS: { message: 'Invalid community cards', severity: 'medium' },
  
  // Network/Storage errors
  STORAGE_ERROR: { message: 'Failed to save settings', severity: 'low' },
  NETWORK_ERROR: { message: 'Network request failed', severity: 'medium' },
  
  // Generic errors
  UNKNOWN_ERROR: { message: 'An unexpected error occurred', severity: 'medium' },
  FEATURE_NOT_SUPPORTED: { message: 'Feature not supported in this browser', severity: 'medium' }
}

class ErrorHandlerImpl implements ErrorHandler {
  private errors: ErrorInfo[] = []
  private maxErrors = 100 // Keep last 100 errors
  
  handleError(error: Error | string, context?: Record<string, any>): void {
    const errorCode = this.extractErrorCode(error)
    const errorInfo = ERROR_MESSAGES[errorCode] || ERROR_MESSAGES.UNKNOWN_ERROR
    
    const errorInfoObj: ErrorInfo = {
      code: errorCode,
      message: errorInfo.message,
      severity: errorInfo.severity,
      context: {
        originalError: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        ...context
      },
      timestamp: Date.now(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined
    }
    
    this.reportError(errorInfoObj)
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error handled:', errorInfoObj)
    }
  }
  
  reportError(errorInfo: ErrorInfo): void {
    // Add to error list
    this.errors.unshift(errorInfo)
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(0, this.maxErrors)
    }
    
    // In production, you might want to send errors to a monitoring service
    if (process.env.NODE_ENV === 'production') {
      this.sendToMonitoringService(errorInfo)
    }
  }
  
  getErrorMessage(error: Error | string): string {
    const errorCode = this.extractErrorCode(error)
    return ERROR_MESSAGES[errorCode]?.message || ERROR_MESSAGES.UNKNOWN_ERROR.message
  }
  
  clearErrors(): void {
    this.errors = []
  }
  
  getErrors(): ErrorInfo[] {
    return [...this.errors]
  }
  
  private extractErrorCode(error: Error | string): string {
    if (typeof error === 'string') {
      // Check if the string is actually an error code
      if (ERROR_MESSAGES[error]) {
        return error
      }
      return 'UNKNOWN_ERROR'
    }
    
    // Check if the error message contains a known error code
    const message = error.message
    for (const code of Object.keys(ERROR_MESSAGES)) {
      if (message.includes(code)) {
        return code
      }
    }
    
    // Check common error patterns
    if (message.includes('timeout') || message.includes('too long')) {
      return 'CALCULATION_TIMEOUT'
    }
    if (message.includes('network') || message.includes('fetch')) {
      return 'NETWORK_ERROR'
    }
    if (message.includes('storage') || message.includes('localStorage')) {
      return 'STORAGE_ERROR'
    }
    if (message.includes('worker')) {
      return 'WORKER_ERROR'
    }
    
    return 'UNKNOWN_ERROR'
  }
  
  private sendToMonitoringService(errorInfo: ErrorInfo): void {
    // In a real application, you would send errors to a service like Sentry
    // For now, we'll just log them
    if (errorInfo.severity === 'critical' || errorInfo.severity === 'high') {
      console.error('High severity error:', errorInfo)
    }
  }
}

// Global error handler instance
export const errorHandler = new ErrorHandlerImpl()

// Global error handlers for unhandled errors
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    errorHandler.handleError(event.error, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    })
  })
  
  window.addEventListener('unhandledrejection', (event) => {
    errorHandler.handleError(event.reason, {
      type: 'unhandledPromiseRejection'
    })
  })
}

// Utility functions for common error scenarios
export const handleCalculationError = (error: Error | string, request?: any) => {
  errorHandler.handleError(error, {
    type: 'calculation',
    request: request ? JSON.stringify(request) : undefined
  })
}

export const handleCardError = (error: Error | string, cardData?: any) => {
  errorHandler.handleError(error, {
    type: 'card',
    cardData: cardData ? JSON.stringify(cardData) : undefined
  })
}

export const handleUIError = (error: Error | string, component?: string) => {
  errorHandler.handleError(error, {
    type: 'ui',
    component
  })
}

// Error retry utility
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      
      if (attempt === maxRetries) {
        errorHandler.handleError(lastError, { 
          maxRetries, 
          finalAttempt: true 
        })
        throw lastError
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delayMs * attempt))
    }
  }
  
  throw lastError!
}

// Performance monitoring
export function measurePerformance<T>(
  name: string,
  operation: () => T
): T {
  const start = performance.now()
  
  try {
    const result = operation()
    
    const duration = performance.now() - start
    if (duration > 100) { // Log slow operations
      console.warn(`Slow operation detected: ${name} took ${duration.toFixed(2)}ms`)
    }
    
    return result
  } catch (error) {
    const duration = performance.now() - start
    errorHandler.handleError(error as Error, {
      operation: name,
      duration: duration.toFixed(2)
    })
    throw error
  }
}

export async function measureAsyncPerformance<T>(
  name: string,
  operation: () => Promise<T>
): Promise<T> {
  const start = performance.now()
  
  try {
    const result = await operation()
    
    const duration = performance.now() - start
    if (duration > 100) { // Log slow operations
      console.warn(`Slow async operation detected: ${name} took ${duration.toFixed(2)}ms`)
    }
    
    return result
  } catch (error) {
    const duration = performance.now() - start
    errorHandler.handleError(error as Error, {
      operation: name,
      duration: duration.toFixed(2),
      async: true
    })
    throw error
  }
}
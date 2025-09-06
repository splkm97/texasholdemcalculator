import { useCallback, useEffect, useRef, useState } from 'react'
import type { CalculationRequest, CalculationResults } from '../types/poker'

export interface CalculationProgress {
  progress: number
  message: string
}

export interface UseCalculationWorkerReturn {
  calculate: (request: CalculationRequest) => Promise<CalculationResults>
  cancel: () => void
  isCalculating: boolean
  progress: CalculationProgress | null
  error: string | null
}

export function useCalculationWorker(): UseCalculationWorkerReturn {
  const workerRef = useRef<Worker | null>(null)
  const currentCalculationId = useRef<string | null>(null)
  const resolveRef = useRef<((value: CalculationResults) => void) | null>(null)
  const rejectRef = useRef<((reason: any) => void) | null>(null)
  
  const [isCalculating, setIsCalculating] = useState(false)
  const [progress, setProgress] = useState<CalculationProgress | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  // Initialize worker
  useEffect(() => {
    try {
      // Create worker from the calculation worker file
      workerRef.current = new Worker(
        new URL('../workers/calculationWorker.ts', import.meta.url),
        { type: 'module' }
      )
      
      // Handle messages from worker
      workerRef.current.onmessage = (event) => {
        const { id, type, payload } = event.data
        
        if (id !== currentCalculationId.current) {
          return // Ignore messages from cancelled calculations
        }
        
        switch (type) {
          case 'success':
            setIsCalculating(false)
            setProgress(null)
            setError(null)
            if (resolveRef.current) {
              resolveRef.current(payload)
              resolveRef.current = null
            }
            break
            
          case 'error':
            setIsCalculating(false)
            setProgress(null)
            setError(payload.message || 'Calculation failed')
            if (rejectRef.current) {
              rejectRef.current(new Error(payload.message))
              rejectRef.current = null
            }
            break
            
          case 'progress':
            setProgress(payload)
            break
        }
      }
      
      // Handle worker errors
      workerRef.current.onerror = (error) => {
        console.error('Worker error:', error)
        setError('Worker error occurred')
        setIsCalculating(false)
        setProgress(null)
        
        if (rejectRef.current) {
          rejectRef.current(new Error('Worker error'))
          rejectRef.current = null
        }
      }
      
    } catch (error) {
      console.warn('Worker not available, falling back to main thread calculation')
      // Worker creation failed - we'll fallback to main thread calculation
    }
    
    // Cleanup
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate()
        workerRef.current = null
      }
    }
  }, [])
  
  const calculate = useCallback(async (request: CalculationRequest): Promise<CalculationResults> => {
    // Clear previous state
    setError(null)
    setProgress(null)
    
    // If no worker available, fall back to main thread
    if (!workerRef.current) {
      setIsCalculating(true)
      try {
        // Import and use the calculation function directly
        const { calculateProbabilities } = await import('../lib/poker-engine/src/poker-engine')
        const results = await calculateProbabilities(request)
        setIsCalculating(false)
        return results
      } catch (error) {
        setIsCalculating(false)
        const errorMessage = error instanceof Error ? error.message : 'Calculation failed'
        setError(errorMessage)
        throw error
      }
    }
    
    return new Promise((resolve, reject) => {
      const calculationId = `calc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      currentCalculationId.current = calculationId
      resolveRef.current = resolve
      rejectRef.current = reject
      
      setIsCalculating(true)
      
      // Send calculation request to worker
      workerRef.current!.postMessage({
        id: calculationId,
        type: 'calculate',
        payload: request
      })
    })
  }, [])
  
  const cancel = useCallback(() => {
    if (currentCalculationId.current && workerRef.current) {
      // Send cancel message to worker
      workerRef.current.postMessage({
        id: currentCalculationId.current,
        type: 'cancel'
      })
      
      // Clean up local state
      setIsCalculating(false)
      setProgress(null)
      setError(null)
      
      // Reject pending promise
      if (rejectRef.current) {
        rejectRef.current(new Error('Calculation cancelled'))
        rejectRef.current = null
      }
      
      currentCalculationId.current = null
    }
  }, [])
  
  // Auto-cancel on unmount
  useEffect(() => {
    return () => {
      cancel()
    }
  }, [cancel])
  
  return {
    calculate,
    cancel,
    isCalculating,
    progress,
    error
  }
}
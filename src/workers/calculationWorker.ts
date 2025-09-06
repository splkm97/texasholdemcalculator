/**
 * Web Worker for poker probability calculations
 * Handles intensive calculations off the main thread
 */

import { calculateProbabilities } from '../lib/poker-engine/src/poker-engine'
import type { CalculationRequest, CalculationResults } from '../types/poker'

export interface WorkerMessage {
  id: string
  type: 'calculate' | 'cancel'
  payload?: any
}

export interface WorkerResponse {
  id: string
  type: 'success' | 'error' | 'progress'
  payload?: any
}

// Worker state
let currentCalculation: string | null = null
let abortController: AbortController | null = null

// Listen for messages from main thread
self.onmessage = async (event: MessageEvent<WorkerMessage>) => {
  const { id, type, payload } = event.data

  switch (type) {
    case 'calculate':
      await handleCalculationRequest(id, payload)
      break
      
    case 'cancel':
      handleCancelRequest(id)
      break
      
    default:
      postMessage({
        id,
        type: 'error',
        payload: { message: `Unknown message type: ${type}` }
      } as WorkerResponse)
  }
}

async function handleCalculationRequest(id: string, request: CalculationRequest) {
  // Cancel any ongoing calculation
  if (currentCalculation && abortController) {
    abortController.abort()
  }
  
  currentCalculation = id
  abortController = new AbortController()
  
  try {
    // Validate request
    if (!request.playerHand || request.playerHand.length !== 2) {
      throw new Error('INVALID_PLAYER_HAND')
    }
    
    // Send progress update
    postMessage({
      id,
      type: 'progress',
      payload: { progress: 0, message: 'Starting calculation...' }
    } as WorkerResponse)
    
    // Perform calculation with progress updates
    const results = await calculateProbabilitiesWithProgress(request, id)
    
    // Check if calculation was cancelled
    if (abortController?.signal.aborted) {
      return
    }
    
    // Send success response
    postMessage({
      id,
      type: 'success',
      payload: results
    } as WorkerResponse)
    
  } catch (error) {
    // Check if error is due to cancellation
    if (error instanceof Error && error.name === 'AbortError') {
      return
    }
    
    postMessage({
      id,
      type: 'error',
      payload: {
        message: error instanceof Error ? error.message : 'Calculation failed'
      }
    } as WorkerResponse)
  } finally {
    currentCalculation = null
    abortController = null
  }
}

function handleCancelRequest(id: string) {
  if (currentCalculation === id && abortController) {
    abortController.abort()
    currentCalculation = null
    abortController = null
  }
}

async function calculateProbabilitiesWithProgress(
  request: CalculationRequest,
  id: string
): Promise<CalculationResults> {
  // Send progress updates during calculation
  const sendProgress = (progress: number, message: string) => {
    if (abortController?.signal.aborted) return
    
    postMessage({
      id,
      type: 'progress',
      payload: { progress, message }
    } as WorkerResponse)
  }
  
  sendProgress(10, 'Validating input...')
  
  // Small delay to allow for UI updates
  await new Promise(resolve => setTimeout(resolve, 10))
  
  if (abortController?.signal.aborted) {
    throw new Error('Calculation cancelled')
  }
  
  sendProgress(25, 'Determining calculation method...')
  
  // Determine the calculation method based on game state
  const method = request.preferredMethod === 'auto' 
    ? determineOptimalMethod(request)
    : request.preferredMethod
    
  sendProgress(40, `Using ${method} method...`)
  
  if (abortController?.signal.aborted) {
    throw new Error('Calculation cancelled')
  }
  
  sendProgress(60, 'Calculating probabilities...')
  
  // Perform the actual calculation
  const results = await calculateProbabilities({
    ...request,
    preferredMethod: method
  })
  
  if (abortController?.signal.aborted) {
    throw new Error('Calculation cancelled')
  }
  
  sendProgress(90, 'Finalizing results...')
  
  // Add calculation metadata
  const enhancedResults: CalculationResults = {
    ...results,
    metadata: {
      workerCalculated: true,
      calculationId: id,
      timestamp: Date.now()
    }
  }
  
  sendProgress(100, 'Complete')
  
  return enhancedResults
}

function determineOptimalMethod(request: CalculationRequest): 'lookup' | 'simulation' | 'exact' {
  const totalCards = request.playerHand.length + request.communityCards.length
  
  // Pre-flop and flop stages: use lookup tables for speed
  if (totalCards <= 5) {
    return 'lookup'
  }
  
  // Turn and river: use simulation for accuracy
  if (totalCards >= 6) {
    return 'simulation'
  }
  
  // Default fallback
  return 'lookup'
}

// Health check endpoint
function handleHealthCheck(id: string) {
  postMessage({
    id,
    type: 'success',
    payload: {
      status: 'healthy',
      workerVersion: '1.0.0',
      capabilities: ['calculate', 'cancel', 'progress'],
      performanceMetrics: {
        averageCalculationTime: 45, // Would track real metrics
        cacheHitRate: 0.85
      }
    }
  } as WorkerResponse)
}

// Error handler for uncaught errors
self.onerror = (error) => {
  console.error('Worker error:', error)
  postMessage({
    id: 'unknown',
    type: 'error',
    payload: {
      message: 'Unexpected worker error',
      details: error.message
    }
  } as WorkerResponse)
}

// Handle unhandled promise rejections
self.onunhandledrejection = (event) => {
  console.error('Worker unhandled rejection:', event.reason)
  postMessage({
    id: 'unknown',
    type: 'error',
    payload: {
      message: 'Unhandled promise rejection in worker',
      details: event.reason
    }
  } as WorkerResponse)
}

export default self
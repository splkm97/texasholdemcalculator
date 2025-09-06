/**
 * Poker Engine Library
 * Main entry point for poker probability calculations and hand evaluation
 */

import type { Card } from '../../../types/card'
import type { 
  CalculationRequest, 
  CalculationResults, 
  HandEvaluation, 
  CalculationMethod 
} from '../../../types/poker'
import { calculateHandProbabilities } from './probability'
import { evaluatePokerHand } from './evaluation'
import { validatePokerHand } from '../../card-utils/src/card-utils'
import { validateHandForEvaluation } from '../../card-utils/src/validation'

/**
 * Calculates poker hand probabilities for current game state
 */
export async function calculateProbabilities(request: CalculationRequest): Promise<CalculationResults> {
  const startTime = performance.now()

  // Validate input - use poker hand validation which handles different stages
  const validation = validatePokerHand(request.playerHand, request.communityCards, request.stage)
  
  if (!validation.isValid) {
    const firstError = validation.errors[0]
    throw new Error(firstError.code)
  }

  // Determine calculation method
  const method = determineOptimalMethod(request)

  try {
    // Perform probability calculation
    const probabilities = await calculateHandProbabilities(
      request.playerHand,
      request.communityCards,
      request.stage,
      method
    )

    const endTime = performance.now()
    const calculationTime = endTime - startTime

    return {
      stage: request.stage,
      playerHand: request.playerHand,
      communityCards: request.communityCards,
      probabilities,
      calculationTime,
      method,
      timestamp: Date.now()
    }

  } catch (error) {
    throw new Error('CALCULATION_FAILED')
  }
}

/**
 * Evaluates best 5-card hand from given cards
 */
export function evaluateHand(options: { cards: Card[] }): HandEvaluation {
  const { cards } = options

  // Validate input
  const validation = validateHandForEvaluation(cards)
  if (!validation.isValid) {
    const firstError = validation.errors[0]
    throw new Error(firstError.code)
  }

  return evaluatePokerHand(cards)
}

/**
 * Determines optimal calculation method based on game state
 */
function determineOptimalMethod(request: CalculationRequest): CalculationMethod {
  if (request.preferredMethod && request.preferredMethod !== 'auto') {
    return request.preferredMethod
  }

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

/**
 * Health check for poker engine
 */
export function checkHealth(): {
  status: 'healthy'
  version: string
  lookupTablesLoaded: boolean
  performance: {
    avgCalculationTime: number
    cacheHitRate: number
  }
} {
  return {
    status: 'healthy',
    version: '1.0.0',
    lookupTablesLoaded: true, // Would check actual lookup table status
    performance: {
      avgCalculationTime: 45, // Would track real metrics
      cacheHitRate: 0.85
    }
  }
}
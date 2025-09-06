/**
 * Poker Probability Calculations
 * Functions for calculating hand probabilities using various methods
 */

import type { Card } from '../../../types/card'
import type { ProbabilityResult, CalculationMethod } from '../../../types/poker'
import { HandStrength } from '../../../types/poker'
import { evaluatePokerHand } from './evaluation'
import { getRemainingCards, simulateDeal } from '../../card-utils/src/deck'

/**
 * Calculates hand probabilities using optimal method
 */
export async function calculateHandProbabilities(
  playerHand: Card[],
  communityCards: Card[],
  stage: string,
  method: CalculationMethod
): Promise<ProbabilityResult[]> {
  
  switch (method) {
    case 'lookup':
      return calculateUsingLookup(playerHand, communityCards)
    case 'simulation':
      return calculateUsingSimulation(playerHand, communityCards)
    case 'exact':
      return calculateUsingExact(playerHand, communityCards, stage)
    default:
      return calculateUsingLookup(playerHand, communityCards)
  }
}

/**
 * Fast lookup table calculation for common scenarios
 */
function calculateUsingLookup(
  playerHand: Card[],
  communityCards: Card[]
): ProbabilityResult[] {
  // For demo purposes, return estimated probabilities
  // In production, this would use pre-computed lookup tables
  
  const knownCards = [...playerHand, ...communityCards]
  const totalKnownCards = knownCards.length
  
  // Base probabilities adjusted for known cards
  let baseProbabilities = getBaseProbabilities()
  
  // Adjust based on current hand potential
  if (totalKnownCards >= 2) {
    baseProbabilities = adjustProbabilitiesForHand(baseProbabilities, knownCards)
  }

  return createProbabilityResults(baseProbabilities, 1000) // Simulated total outcomes
}

/**
 * Monte Carlo simulation for accurate calculations
 */
function calculateUsingSimulation(
  playerHand: Card[],
  communityCards: Card[],
  numSimulations: number = 10000
): ProbabilityResult[] {
  const knownCards = [...playerHand, ...communityCards]
  const handCounts: Record<HandStrength, number> = {
    [HandStrength.HIGH_CARD]: 0,
    [HandStrength.PAIR]: 0,
    [HandStrength.TWO_PAIR]: 0,
    [HandStrength.THREE_OF_A_KIND]: 0,
    [HandStrength.STRAIGHT]: 0,
    [HandStrength.FLUSH]: 0,
    [HandStrength.FULL_HOUSE]: 0,
    [HandStrength.FOUR_OF_A_KIND]: 0,
    [HandStrength.STRAIGHT_FLUSH]: 0,
    [HandStrength.ROYAL_FLUSH]: 0
  }

  // Run simulations
  const simulations = simulateDeal(knownCards, numSimulations)
  
  for (const simulatedCards of simulations) {
    try {
      const evaluation = evaluatePokerHand(simulatedCards)
      handCounts[evaluation.handStrength]++
    } catch (error) {
      // Skip invalid simulations
      continue
    }
  }

  // Convert counts to probabilities
  const results: ProbabilityResult[] = []
  
  for (let handType = 0; handType <= 9; handType++) {
    const count = handCounts[handType as HandStrength]
    const probability = count / numSimulations
    
    results.push({
      handType: handType as HandStrength,
      probability,
      percentage: probability * 100,
      odds: formatOdds(probability),
      occurrences: count,
      totalOutcomes: numSimulations
    })
  }

  return results
}

/**
 * Exact combinatorial calculation (slower but precise)
 */
function calculateUsingExact(
  playerHand: Card[],
  communityCards: Card[],
  stage: string
): ProbabilityResult[] {
  // For demo purposes, fall back to simulation with high precision
  // In production, this would use exact combinatorial mathematics
  return calculateUsingSimulation(playerHand, communityCards, stage, 100000)
}

/**
 * Gets base probability distribution for Texas Hold'em
 */
function getBaseProbabilities(): Record<HandStrength, number> {
  return {
    [HandStrength.HIGH_CARD]: 0.501177,
    [HandStrength.PAIR]: 0.422569,
    [HandStrength.TWO_PAIR]: 0.047539,
    [HandStrength.THREE_OF_A_KIND]: 0.021128,
    [HandStrength.STRAIGHT]: 0.003925,
    [HandStrength.FLUSH]: 0.001965,
    [HandStrength.FULL_HOUSE]: 0.001441,
    [HandStrength.FOUR_OF_A_KIND]: 0.000240,
    [HandStrength.STRAIGHT_FLUSH]: 0.000015,
    [HandStrength.ROYAL_FLUSH]: 0.000002
  }
}

/**
 * Adjusts probabilities based on current hand potential
 */
function adjustProbabilitiesForHand(
  baseProbabilities: Record<HandStrength, number>,
  knownCards: Card[]
): Record<HandStrength, number> {
  // Start with zero probabilities and calculate based on current hand
  const adjusted: Record<HandStrength, number> = {
    [HandStrength.HIGH_CARD]: 0,
    [HandStrength.PAIR]: 0,
    [HandStrength.TWO_PAIR]: 0,
    [HandStrength.THREE_OF_A_KIND]: 0,
    [HandStrength.STRAIGHT]: 0,
    [HandStrength.FLUSH]: 0,
    [HandStrength.FULL_HOUSE]: 0,
    [HandStrength.FOUR_OF_A_KIND]: 0,
    [HandStrength.STRAIGHT_FLUSH]: 0,
    [HandStrength.ROYAL_FLUSH]: 0
  }
  
  // Analyze current hand
  const ranks = knownCards.map(c => c.rank)
  const suits = knownCards.map(c => c.suit)
  
  // Check for pairs
  const rankCounts: Record<string, number> = {}
  ranks.forEach(rank => {
    rankCounts[rank] = (rankCounts[rank] || 0) + 1
  })
  
  // Check for flush potential  
  const suitCounts: Record<string, number> = {}
  suits.forEach(suit => {
    suitCounts[suit] = (suitCounts[suit] || 0) + 1
  })
  
  // Count existing hand types
  const pairCount = Object.values(rankCounts).filter(count => count === 2).length
  const tripCount = Object.values(rankCounts).filter(count => count === 3).length
  const quadCount = Object.values(rankCounts).filter(count => count === 4).length
  
  // If we already have four of a kind, that's 100%
  if (quadCount > 0) {
    adjusted[HandStrength.FOUR_OF_A_KIND] = 1.0
    return adjusted
  }
  
  // If we already have trips, we can't have high card or single pair
  if (tripCount > 0) {
    adjusted[HandStrength.HIGH_CARD] = 0
    adjusted[HandStrength.PAIR] = 0
    adjusted[HandStrength.THREE_OF_A_KIND] = 0.6  // Stay as trips
    adjusted[HandStrength.FULL_HOUSE] = 0.35      // Improve to full house
    adjusted[HandStrength.FOUR_OF_A_KIND] = 0.05  // Improve to quads
    return adjusted
  }
  
  // If we already have two pair, we can't have high card or single pair
  if (pairCount >= 2) {
    adjusted[HandStrength.HIGH_CARD] = 0
    adjusted[HandStrength.PAIR] = 0
    adjusted[HandStrength.TWO_PAIR] = 0.7         // Stay as two pair
    adjusted[HandStrength.FULL_HOUSE] = 0.25      // Improve to full house
    adjusted[HandStrength.THREE_OF_A_KIND] = 0.03
    adjusted[HandStrength.FOUR_OF_A_KIND] = 0.02
    return adjusted
  }
  
  // If we already have a pair (like AA), we can't have high card
  if (pairCount === 1) {
    adjusted[HandStrength.HIGH_CARD] = 0          // IMPOSSIBLE with existing pair
    adjusted[HandStrength.PAIR] = 0.18            // Stay as pair only
    adjusted[HandStrength.TWO_PAIR] = 0.23        // Make two pair
    adjusted[HandStrength.THREE_OF_A_KIND] = 0.12 // Make trips
    adjusted[HandStrength.STRAIGHT] = 0.04        // Make straight
    adjusted[HandStrength.FLUSH] = 0.02           // Make flush
    adjusted[HandStrength.FULL_HOUSE] = 0.025     // Make full house
    adjusted[HandStrength.FOUR_OF_A_KIND] = 0.002 // Make quads
    adjusted[HandStrength.STRAIGHT_FLUSH] = 0.0001
    adjusted[HandStrength.ROYAL_FLUSH] = 0.000001
    return adjusted
  }
  
  // If no pairs yet, use base probabilities but adjust for draws
  const maxSuitCount = Math.max(...Object.values(suitCounts))
  const sortedValues = [...new Set(knownCards.map(c => c.value))].sort((a, b) => a - b)
  
  // Check for straight draws
  let straightDraw = 0
  for (let i = 0; i < sortedValues.length - 1; i++) {
    if (sortedValues[i + 1] - sortedValues[i] === 1) {
      straightDraw++
    }
  }
  
  // Adjust probabilities based on draws
  adjusted[HandStrength.HIGH_CARD] = baseProbabilities[HandStrength.HIGH_CARD]
  adjusted[HandStrength.PAIR] = baseProbabilities[HandStrength.PAIR]
  adjusted[HandStrength.TWO_PAIR] = baseProbabilities[HandStrength.TWO_PAIR]
  adjusted[HandStrength.THREE_OF_A_KIND] = baseProbabilities[HandStrength.THREE_OF_A_KIND]
  adjusted[HandStrength.STRAIGHT] = baseProbabilities[HandStrength.STRAIGHT] * (straightDraw >= 3 ? 3 : 1)
  adjusted[HandStrength.FLUSH] = baseProbabilities[HandStrength.FLUSH] * (maxSuitCount >= 4 ? 8 : maxSuitCount >= 3 ? 2 : 1)
  adjusted[HandStrength.FULL_HOUSE] = baseProbabilities[HandStrength.FULL_HOUSE]
  adjusted[HandStrength.FOUR_OF_A_KIND] = baseProbabilities[HandStrength.FOUR_OF_A_KIND]
  adjusted[HandStrength.STRAIGHT_FLUSH] = baseProbabilities[HandStrength.STRAIGHT_FLUSH]
  adjusted[HandStrength.ROYAL_FLUSH] = baseProbabilities[HandStrength.ROYAL_FLUSH]
  
  // Normalize to sum to 1
  const total = Object.values(adjusted).reduce((sum, prob) => sum + prob, 0)
  if (total > 0) {
    Object.keys(adjusted).forEach(key => {
      adjusted[parseInt(key) as HandStrength] /= total
    })
  }
  
  return adjusted
}

/**
 * Creates probability result objects
 */
function createProbabilityResults(
  probabilities: Record<HandStrength, number>,
  totalOutcomes: number
): ProbabilityResult[] {
  const results: ProbabilityResult[] = []
  
  for (let handType = 0; handType <= 9; handType++) {
    const probability = probabilities[handType as HandStrength] || 0
    const occurrences = Math.round(probability * totalOutcomes)
    
    results.push({
      handType: handType as HandStrength,
      probability,
      percentage: probability * 100,
      odds: formatOdds(probability),
      occurrences,
      totalOutcomes
    })
  }
  
  return results
}

/**
 * Formats probability as odds (e.g., "2.5:1")
 */
function formatOdds(probability: number): string {
  if (probability === 0) return "∞:1"
  if (probability === 1) return "1:1"
  
  const odds = (1 - probability) / probability
  return `${odds.toFixed(1)}:1`
}

/**
 * Calculates outs (cards that improve the hand)
 */
export function calculateOuts(
  playerHand: Card[],
  communityCards: Card[],
  targetHand: HandStrength
): number {
  const knownCards = [...playerHand, ...communityCards]
  const remainingCards = getRemainingCards(knownCards)
  
  let outs = 0
  
  for (const card of remainingCards) {
    const testCards = [...knownCards, card]
    try {
      const evaluation = evaluatePokerHand(testCards)
      if (evaluation.handStrength >= targetHand) {
        outs++
      }
    } catch (error) {
      // Skip invalid combinations
      continue
    }
  }
  
  return outs
}
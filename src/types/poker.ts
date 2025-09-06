/**
 * Poker Hand Types and Interfaces
 * Domain model for poker hands and rankings
 */

import type { Card } from './card'

export enum HandStrength {
  HIGH_CARD = 0,
  PAIR = 1,
  TWO_PAIR = 2,
  THREE_OF_A_KIND = 3,
  STRAIGHT = 4,
  FLUSH = 5,
  FULL_HOUSE = 6,
  FOUR_OF_A_KIND = 7,
  STRAIGHT_FLUSH = 8,
  ROYAL_FLUSH = 9
}

export interface HandType {
  strength: HandStrength
  name: string
  description: string
  probability: number // Base probability for 5-card evaluation
}

export interface HandProbability {
  handType: number
  probability: number
  percentage: number
  odds: string
  occurrences: number
}

export interface PlayerHand {
  holeCards: Card[] // Always 2 cards
  bestHand: Card[] // Best 5-card combination from available cards
  handStrength: HandStrength
  kickers: Card[] // Tie-breaking cards
  isValid: boolean
}

export interface HandEvaluation {
  bestHand: Card[] // Best 5-card hand
  handStrength: HandStrength
  kickers: Card[]
  description: string
}

export interface ProbabilityResult {
  handType: HandStrength
  probability: number // 0-1 decimal
  percentage: number // 0-100 display format  
  odds: string // e.g., "2.5:1"
  occurrences: number // Favorable outcomes in calculation
  totalOutcomes: number // Total possible outcomes
}

export interface CalculationResults {
  stage: string // GameStage type (defined in game.ts)
  playerHand: Card[]
  communityCards: Card[]
  probabilities: ProbabilityResult[]
  calculationTime: number // milliseconds
  method: 'lookup' | 'simulation' | 'exact' // Calculation approach used
  timestamp: number // For caching
}

// Hand type definitions with base probabilities
export const HAND_TYPES: Record<HandStrength, HandType> = {
  [HandStrength.HIGH_CARD]: {
    strength: HandStrength.HIGH_CARD,
    name: 'High Card',
    description: 'No pairs, straights, or flushes',
    probability: 0.501177
  },
  [HandStrength.PAIR]: {
    strength: HandStrength.PAIR,
    name: 'One Pair',
    description: 'Two cards of the same rank',
    probability: 0.422569
  },
  [HandStrength.TWO_PAIR]: {
    strength: HandStrength.TWO_PAIR,
    name: 'Two Pair',
    description: 'Two different pairs',
    probability: 0.047539
  },
  [HandStrength.THREE_OF_A_KIND]: {
    strength: HandStrength.THREE_OF_A_KIND,
    name: 'Three of a Kind',
    description: 'Three cards of the same rank',
    probability: 0.021128
  },
  [HandStrength.STRAIGHT]: {
    strength: HandStrength.STRAIGHT,
    name: 'Straight',
    description: 'Five cards in sequence',
    probability: 0.003925
  },
  [HandStrength.FLUSH]: {
    strength: HandStrength.FLUSH,
    name: 'Flush',
    description: 'Five cards of the same suit',
    probability: 0.001965
  },
  [HandStrength.FULL_HOUSE]: {
    strength: HandStrength.FULL_HOUSE,
    name: 'Full House',
    description: 'Three of a kind plus a pair',
    probability: 0.001441
  },
  [HandStrength.FOUR_OF_A_KIND]: {
    strength: HandStrength.FOUR_OF_A_KIND,
    name: 'Four of a Kind',
    description: 'Four cards of the same rank',
    probability: 0.000240
  },
  [HandStrength.STRAIGHT_FLUSH]: {
    strength: HandStrength.STRAIGHT_FLUSH,
    name: 'Straight Flush',
    description: 'Five cards in sequence, same suit',
    probability: 0.000015
  },
  [HandStrength.ROYAL_FLUSH]: {
    strength: HandStrength.ROYAL_FLUSH,
    name: 'Royal Flush',
    description: 'A, K, Q, J, 10 all same suit',
    probability: 0.000002
  }
}

// Error types for poker operations
export enum PokerError {
  INVALID_CARD = 'Invalid card selection',
  DUPLICATE_CARD = 'Card already selected', 
  INVALID_STAGE = 'Invalid game stage transition',
  CALCULATION_FAILED = 'Probability calculation failed',
  PERFORMANCE_TIMEOUT = 'Calculation exceeded time limit',
  INSUFFICIENT_CARDS = 'Not enough cards for evaluation'
}

// Calculation method preferences
export type CalculationMethod = 'auto' | 'lookup' | 'simulation' | 'exact'

export interface CalculationRequest {
  playerHand: Card[]
  communityCards: Card[]
  stage: string
  preferredMethod?: CalculationMethod
}
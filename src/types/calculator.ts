/**
 * Calculator State Types and Interfaces
 * Domain model for the poker calculator application state
 */

import type { Card } from './card'
import type { CommunityCards, GameStage } from './game'
import type { CalculationResults } from './poker'

export interface CalculatorState {
  // Input State
  selectedCards: Card[]
  communityCards: CommunityCards
  currentStage: GameStage
  
  // Calculation State  
  isCalculating: boolean
  calculationResults: CalculationResults | null
  error: string | null
  
  // UI State
  selectedCardSlot: CardSlot | null
  showProbabilities: boolean
  
  // Configuration
  calculationMethod: 'auto' | 'lookup' | 'simulation' | 'exact'
  displayFormat: 'percentage' | 'decimal' | 'odds'
}

export type CardSlot = 
  | 'hole1' 
  | 'hole2' 
  | 'flop1' 
  | 'flop2' 
  | 'flop3' 
  | 'turn' 
  | 'river'

export interface CalculatorActions {
  selectCard: (card: Card, slot: CardSlot) => void
  clearCards: () => void
  calculateProbabilities: () => Promise<void>
  setStage: (stage: GameStage) => void
  setDisplayFormat: (format: 'percentage' | 'decimal' | 'odds') => void
  setCalculationMethod: (method: 'auto' | 'lookup' | 'simulation' | 'exact') => void
  clearError: () => void
  reset: () => void
}

// Cache management for calculation results
export interface CalculationCache {
  key: string // Hash of game state
  result: CalculationResults
  accessCount: number
  lastAccessed: number
}

export interface CacheManager {
  get: (key: string) => CalculationResults | null
  set: (key: string, result: CalculationResults) => void
  clear: () => void
  size: number
  maxSize: number
}

// Performance tracking
export interface PerformanceMetrics {
  calculationTime: number
  cacheHitRate: number
  averageResponseTime: number
  totalCalculations: number
}

// Error handling
export interface ErrorState {
  hasError: boolean
  errorCode: string | null
  errorMessage: string | null
  errorContext: Record<string, unknown> | null
  canRecover: boolean
  recoveryActions: string[]
}

// UI display preferences
export interface DisplayPreferences {
  format: 'percentage' | 'decimal' | 'odds'
  precision: number // decimal places
  showCalculationTime: boolean
  showMethod: boolean
  highlightBestHands: boolean
}

// Validation state for game progression
export interface ValidationState {
  canSelectHoleCards: boolean
  canSelectFlop: boolean
  canSelectTurn: boolean
  canSelectRiver: boolean
  missingRequirements: string[]
}

export interface AppState extends CalculatorState {
  actions: CalculatorActions
  cache: CacheManager
  performance: PerformanceMetrics
  errorState: ErrorState
  displayPreferences: DisplayPreferences
  validationState: ValidationState
}
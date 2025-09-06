import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { Card } from '../types/card'
import { GameStage } from '../types/game'
import type { CalculationResults, CalculationMethod } from '../types/poker'
import { calculateProbabilities } from '../lib/poker-engine/src/poker-engine'

export interface CalculatorState {
  // Card state
  playerHand: (Card | undefined)[]
  communityCards: (Card | undefined)[]
  usedCards: Set<string>
  
  // Game state
  stage: GameStage
  
  // UI state
  selectedSlot: { type: 'player' | 'community', index: number } | null
  showCardSelector: boolean
  isCalculating: boolean
  
  // Results
  results: CalculationResults | null
  error: string | null
  calculationHistory: CalculationResults[]
  
  // Settings
  preferredCalculationMethod: CalculationMethod
  autoCalculate: boolean
  showAdvancedStats: boolean
}

export interface CalculatorActions {
  // Card actions
  setPlayerCard: (index: number, card: Card) => void
  setCommunityCard: (index: number, card: Card) => void
  removeCard: (type: 'player' | 'community', index: number) => void
  clearAllCards: () => void
  
  // Game actions
  setStage: (stage: GameStage) => void
  resetGame: () => void
  
  // UI actions
  setSelectedSlot: (slot: { type: 'player' | 'community', index: number } | null) => void
  setShowCardSelector: (show: boolean) => void
  setIsCalculating: (calculating: boolean) => void
  
  // Calculation actions
  calculateProbabilities: () => Promise<void>
  setResults: (results: CalculationResults | null) => void
  setError: (error: string | null) => void
  addToHistory: (results: CalculationResults) => void
  clearHistory: () => void
  
  // Settings actions
  setPreferredCalculationMethod: (method: CalculationMethod) => void
  setAutoCalculate: (auto: boolean) => void
  setShowAdvancedStats: (show: boolean) => void
}

type CalculatorStore = CalculatorState & CalculatorActions

export const useCalculatorStore = create<CalculatorStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        playerHand: [undefined, undefined],
        communityCards: [undefined, undefined, undefined, undefined, undefined],
        usedCards: new Set<string>(),
        stage: GameStage.PRE_FLOP,
        selectedSlot: null,
        showCardSelector: false,
        isCalculating: false,
        results: null,
        error: null,
        calculationHistory: [],
        preferredCalculationMethod: 'auto',
        autoCalculate: true,
        showAdvancedStats: false,

        // Card actions
        setPlayerCard: (index: number, card: Card) => {
          const state = get()
          const newPlayerHand = [...state.playerHand]
          const oldCard = newPlayerHand[index]
          
          newPlayerHand[index] = card
          
          const newUsedCards = new Set(state.usedCards)
          if (oldCard) newUsedCards.delete(oldCard.id)
          newUsedCards.add(card.id)
          
          const newStage = calculateStage(newPlayerHand, state.communityCards)
          
          set({
            playerHand: newPlayerHand,
            usedCards: newUsedCards,
            stage: newStage,
            error: null
          })
          
          // Auto-calculate if enabled and player hand is complete
          if (state.autoCalculate && newPlayerHand.every(c => c !== undefined)) {
            setTimeout(() => get().calculateProbabilities(), 0)
          }
        },

        setCommunityCard: (index: number, card: Card) => {
          const state = get()
          const newCommunityCards = [...state.communityCards]
          const oldCard = newCommunityCards[index]
          
          newCommunityCards[index] = card
          
          const newUsedCards = new Set(state.usedCards)
          if (oldCard) newUsedCards.delete(oldCard.id)
          newUsedCards.add(card.id)
          
          const newStage = calculateStage(state.playerHand, newCommunityCards)
          
          set({
            communityCards: newCommunityCards,
            usedCards: newUsedCards,
            stage: newStage,
            error: null
          })
          
          // Auto-calculate if enabled and player hand is complete
          if (state.autoCalculate && state.playerHand.every(c => c !== undefined)) {
            setTimeout(() => get().calculateProbabilities(), 0)
          }
        },

        removeCard: (type: 'player' | 'community', index: number) => {
          const state = get()
          
          if (type === 'player') {
            const newPlayerHand = [...state.playerHand]
            const oldCard = newPlayerHand[index]
            newPlayerHand[index] = undefined
            
            const newUsedCards = new Set(state.usedCards)
            if (oldCard) newUsedCards.delete(oldCard.id)
            
            const newStage = calculateStage(newPlayerHand, state.communityCards)
            
            set({
              playerHand: newPlayerHand,
              usedCards: newUsedCards,
              stage: newStage,
              results: null,
              error: null
            })
          } else {
            const newCommunityCards = [...state.communityCards]
            const oldCard = newCommunityCards[index]
            newCommunityCards[index] = undefined
            
            const newUsedCards = new Set(state.usedCards)
            if (oldCard) newUsedCards.delete(oldCard.id)
            
            const newStage = calculateStage(state.playerHand, newCommunityCards)
            
            set({
              communityCards: newCommunityCards,
              usedCards: newUsedCards,
              stage: newStage,
              error: null
            })
            
            // Recalculate if auto-calculate is enabled
            if (state.autoCalculate && state.playerHand.every(c => c !== undefined)) {
              setTimeout(() => get().calculateProbabilities(), 0)
            }
          }
        },

        clearAllCards: () => {
          set({
            playerHand: [undefined, undefined],
            communityCards: [undefined, undefined, undefined, undefined, undefined],
            usedCards: new Set<string>(),
            stage: GameStage.PRE_FLOP,
            results: null,
            error: null,
            selectedSlot: null,
            showCardSelector: false
          })
        },

        // Game actions
        setStage: (stage: GameStage) => {
          set({ stage })
        },

        resetGame: () => {
          const state = get()
          set({
            playerHand: [undefined, undefined],
            communityCards: [undefined, undefined, undefined, undefined, undefined],
            usedCards: new Set<string>(),
            stage: GameStage.PRE_FLOP,
            selectedSlot: null,
            showCardSelector: false,
            isCalculating: false,
            results: null,
            error: null,
            // Keep settings and history
            preferredCalculationMethod: state.preferredCalculationMethod,
            autoCalculate: state.autoCalculate,
            showAdvancedStats: state.showAdvancedStats,
            calculationHistory: state.calculationHistory
          })
        },

        // UI actions
        setSelectedSlot: (slot) => {
          set({ selectedSlot: slot })
        },

        setShowCardSelector: (show) => {
          set({ showCardSelector: show })
        },

        setIsCalculating: (calculating) => {
          set({ isCalculating: calculating })
        },

        // Calculation actions
        calculateProbabilities: async () => {
          const state = get()
          const validPlayerCards = state.playerHand.filter(c => c !== undefined) as Card[]
          const validCommunityCards = state.communityCards.filter(c => c !== undefined) as Card[]
          
          if (validPlayerCards.length !== 2) {
            set({ error: 'Need exactly 2 hole cards to calculate probabilities' })
            return
          }
          
          set({ isCalculating: true, error: null })
          
          try {
            const results = await calculateProbabilities({
              playerHand: validPlayerCards,
              communityCards: validCommunityCards,
              stage: state.stage,
              preferredMethod: state.preferredCalculationMethod
            })
            
            set({ 
              results,
              isCalculating: false,
              error: null 
            })
            
            // Add to history
            get().addToHistory(results)
            
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Calculation failed'
            set({ 
              error: errorMessage,
              isCalculating: false,
              results: null 
            })
          }
        },

        setResults: (results) => {
          set({ results })
        },

        setError: (error) => {
          set({ error })
        },

        addToHistory: (results) => {
          const state = get()
          const newHistory = [results, ...state.calculationHistory].slice(0, 50) // Keep last 50
          set({ calculationHistory: newHistory })
        },

        clearHistory: () => {
          set({ calculationHistory: [] })
        },

        // Settings actions
        setPreferredCalculationMethod: (method) => {
          set({ preferredCalculationMethod: method })
        },

        setAutoCalculate: (auto) => {
          set({ autoCalculate: auto })
        },

        setShowAdvancedStats: (show) => {
          set({ showAdvancedStats: show })
        }
      }),
      {
        name: 'poker-calculator-store',
        partialize: (state) => ({
          // Only persist settings and history, not current game state
          preferredCalculationMethod: state.preferredCalculationMethod,
          autoCalculate: state.autoCalculate,
          showAdvancedStats: state.showAdvancedStats,
          calculationHistory: state.calculationHistory
        })
      }
    ),
    {
      name: 'poker-calculator-store'
    }
  )
)

// Helper function to calculate game stage
function calculateStage(
  playerHand: (Card | undefined)[],
  communityCards: (Card | undefined)[]
): GameStage {
  const playerCount = playerHand.filter(card => card !== undefined).length
  const communityCount = communityCards.filter(card => card !== undefined).length

  if (playerCount < 2) return GameStage.PRE_FLOP
  if (communityCount === 0) return GameStage.PRE_FLOP
  if (communityCount <= 3) return GameStage.FLOP
  if (communityCount === 4) return GameStage.TURN
  return GameStage.RIVER
}

// Selectors for derived state
export const selectAvailableCards = (state: CalculatorState) => {
  // This would typically import the deck creation from card-utils
  // For now, return empty array as placeholder
  return []
}

export const selectCanCalculate = (state: CalculatorState) => {
  return state.playerHand.filter(c => c !== undefined).length === 2
}

export const selectCurrentHandStrength = (state: CalculatorState) => {
  if (!state.results) return null
  
  // Calculate overall hand strength from probabilities
  const probabilities = state.results.probabilities
  let weightedSum = 0
  let totalWeight = 0
  
  probabilities.forEach(prob => {
    const weight = prob.percentage / 100
    weightedSum += prob.handType * weight
    totalWeight += weight
  })
  
  return totalWeight > 0 ? (weightedSum / totalWeight) / 9 : 0
}
import { useState, useCallback, useEffect } from 'react'
import { HandDisplay } from '../Cards/HandDisplay'
import { CommunityCards } from '../Cards/CommunityCards'
import { ResultsDisplay } from '../Results/ResultsDisplay'
import { Card } from '../Cards/Card'
import { createDeck } from '../../lib/card-utils/src/card-utils'
import { calculateProbabilities } from '../../lib/poker-engine/src/poker-engine'
import type { Card as CardType } from '../../types/card'
import { GameStage } from '../../types/game'
import type { CalculationResults } from '../../types/poker'

interface CalculatorState {
  playerHand: (CardType | undefined)[]
  communityCards: (CardType | undefined)[]
  stage: GameStage
  selectedSlot: { type: 'player' | 'community', index: number } | null
  showCardSelector: boolean
  usedCards: Set<string>
  isCalculating: boolean
  results: CalculationResults | null
  error: string | null
}

export function Calculator() {
  const [state, setState] = useState<CalculatorState>({
    playerHand: [undefined, undefined],
    communityCards: [undefined, undefined, undefined, undefined, undefined],
    stage: GameStage.PRE_FLOP,
    selectedSlot: null,
    showCardSelector: false,
    usedCards: new Set(),
    isCalculating: false,
    results: null,
    error: null
  })

  const deck = createDeck()

  // Calculate stage based on cards
  const calculateStage = useCallback((playerHand: (CardType | undefined)[], communityCards: (CardType | undefined)[]): GameStage => {
    const playerCount = playerHand.filter(card => card !== undefined).length
    const communityCount = communityCards.filter(card => card !== undefined).length

    if (playerCount < 2) return GameStage.PRE_FLOP
    if (communityCount === 0) return GameStage.PRE_FLOP
    if (communityCount <= 3) return GameStage.FLOP
    if (communityCount === 4) return GameStage.TURN
    return GameStage.RIVER
  }, [])

  // Update used cards and stage when cards change - moved to handleCardSelect for immediate update

  // Auto-calculate probabilities when player hand is complete
  useEffect(() => {
    const validPlayerCards = state.playerHand.filter(card => card !== undefined) as CardType[]
    const validCommunityCards = state.communityCards.filter(card => card !== undefined) as CardType[]

    if (validPlayerCards.length === 2) {
      calculateProbabilitiesAsync(validPlayerCards, validCommunityCards, state.stage)
    }
  }, [state.playerHand, state.communityCards, state.stage])

  const calculateProbabilitiesAsync = useCallback(async (
    playerHand: CardType[],
    communityCards: CardType[],
    stage: GameStage
  ) => {
    setState(prev => ({ ...prev, isCalculating: true, error: null }))

    try {
      const results = await calculateProbabilities({
        playerHand,
        communityCards,
        stage,
        preferredMethod: 'auto'
      })

      setState(prev => ({
        ...prev,
        results,
        isCalculating: false
      }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Calculation failed',
        isCalculating: false
      }))
    }
  }, [])

  const handleCardSlotClick = useCallback((type: 'player' | 'community', index: number) => {
    setState(prev => ({
      ...prev,
      selectedSlot: { type, index },
      showCardSelector: true,
      error: null
    }))
  }, [])

  const handleCardSelect = useCallback((card: CardType) => {
    const { selectedSlot } = state

    if (!selectedSlot) return

    // Check for duplicates
    if (state.usedCards.has(card.id)) {
      setState(prev => ({
        ...prev,
        error: 'Card already selected',
        showCardSelector: false,
        selectedSlot: null
      }))
      return
    }

    setState(prev => {
      const newState = { ...prev }

      if (selectedSlot.type === 'player') {
        newState.playerHand = [...prev.playerHand]
        newState.playerHand[selectedSlot.index] = card
      } else {
        newState.communityCards = [...prev.communityCards]
        newState.communityCards[selectedSlot.index] = card
      }

      // Update used cards immediately
      const allCards = [...newState.playerHand, ...newState.communityCards].filter(card => card !== undefined) as CardType[]
      newState.usedCards = new Set(allCards.map(card => card.id))
      newState.stage = calculateStage(newState.playerHand, newState.communityCards)

      newState.showCardSelector = false
      newState.selectedSlot = null
      newState.error = null

      return newState
    })
  }, [state, calculateStage])

  const handleReset = useCallback(() => {
    setState({
      playerHand: [undefined, undefined],
      communityCards: [undefined, undefined, undefined, undefined, undefined],
      stage: GameStage.PRE_FLOP,
      selectedSlot: null,
      showCardSelector: false,
      usedCards: new Set(),
      isCalculating: false,
      results: null,
      error: null
    })
  }, [])

  const handleClosePicker = useCallback(() => {
    setState(prev => ({
      ...prev,
      showCardSelector: false,
      selectedSlot: null
    }))
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-100" style={{
      background: 'linear-gradient(135deg, #FEF7ED, #FFFBEB, #FFF7ED)'
    }}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 1px, transparent 1px),
                           radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 mb-4 drop-shadow-lg">
            🃏 Texas Hold'em Calculator
          </h1>
          <p className="text-emerald-100 text-lg font-medium">
            Professional Poker Probability Analysis
          </p>
        </div>

        {/* Game Stage Display */}
        <div className="text-center mb-8">
          <div className="inline-block px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-400 text-yellow-900 rounded-full text-lg font-bold shadow-xl transform hover:scale-105 transition-transform duration-200">
            <span className="text-shadow">Stage: {state.stage.replace('_', '-').replace(/^./, (match) => match.toUpperCase())}</span>
          </div>
        </div>

        {/* Main Poker Table */}
        <div className="relative">
          {/* Poker Table Surface */}
          <div className="bg-gradient-to-br from-green-700 via-green-800 to-green-900 rounded-[3rem] p-8 shadow-2xl border-8 border-yellow-600 relative overflow-hidden felt-texture">
            {/* Table felt texture */}
            <div className="absolute inset-0 rounded-[2.5rem] opacity-30">
              <div className="w-full h-full bg-gradient-radial from-green-600/20 to-green-900/40" />
            </div>
            
            {/* Table edge highlights */}
            <div className="absolute inset-2 rounded-[2.25rem] border-2 border-yellow-500/30" />
            
            <div className="relative z-10 space-y-8">
              {/* Player Hand Section */}
              <div className="text-center">
                <div className="inline-block bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-yellow-500/30">
                  <h3 className="text-yellow-400 text-xl font-bold mb-4 text-shadow">Your Hole Cards</h3>
                  <HandDisplay
                    cards={state.playerHand}
                    onCardClick={(index) => handleCardSlotClick('player', index)}
                    placeholders={['Hole Card 1', 'Hole Card 2']}
                    selectedIndex={
                      state.selectedSlot?.type === 'player' ? state.selectedSlot.index : undefined
                    }
                    size="large"
                  />
                </div>
              </div>

              {/* Community Cards Section */}
              <div className="text-center">
                <div className="inline-block bg-black/30 backdrop-blur-sm rounded-3xl p-6 border border-yellow-400/20">
                  <h3 className="text-yellow-300 text-lg font-bold mb-6 text-shadow">Community Cards</h3>
                  <CommunityCards
                    cards={state.communityCards}
                    onCardClick={(index) => handleCardSlotClick('community', index)}
                    selectedIndex={
                      state.selectedSlot?.type === 'community' ? state.selectedSlot.index : undefined
                    }
                    stage={state.stage}
                    disabled={state.playerHand.some(card => card === undefined)}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="text-center pt-4">
                <button
                  onClick={handleReset}
                  className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-full text-lg font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 border-2 border-red-400"
                >
                  🔄 Reset Table
                </button>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute top-6 left-6 w-4 h-4 bg-yellow-500 rounded-full shadow-lg float" style={{ animationDelay: '0s' }} />
            <div className="absolute top-6 right-6 w-4 h-4 bg-yellow-500 rounded-full shadow-lg float" style={{ animationDelay: '0.5s' }} />
            <div className="absolute bottom-6 left-6 w-4 h-4 bg-yellow-500 rounded-full shadow-lg float" style={{ animationDelay: '1s' }} />
            <div className="absolute bottom-6 right-6 w-4 h-4 bg-yellow-500 rounded-full shadow-lg float" style={{ animationDelay: '1.5s' }} />
          </div>
        </div>

        {/* Results Panel */}
        <div className="space-y-6">
          {/* Results Display Card */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-600">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-1 mb-6">
              <div className="bg-slate-900 rounded-xl p-4">
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 text-center">
                  📊 Probability Analysis
                </h2>
              </div>
            </div>

            {state.error && (
              <div className="bg-gradient-to-r from-red-600/20 to-red-800/20 border border-red-500/50 rounded-xl p-4 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">⚠️</span>
                  <p className="text-red-200 font-medium">{state.error}</p>
                </div>
              </div>
            )}

            {state.isCalculating && (
              <div className="flex flex-col items-center justify-center p-12 space-y-4">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-blue-400/30 border-t-blue-400 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 w-16 h-16 border-4 border-purple-400/30 border-b-purple-400 rounded-full animate-spin animate-reverse"></div>
                </div>
                <p className="text-slate-300 text-lg font-medium animate-pulse">
                  Calculating probabilities...
                </p>
              </div>
            )}

            {state.results && !state.isCalculating && (
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 rounded-2xl p-6 backdrop-blur-sm border border-slate-600/50">
                <ResultsDisplay results={state.results} />
              </div>
            )}

            {!state.results && !state.isCalculating && !state.error && (
              <div className="text-center py-12 space-y-4">
                <div className="text-6xl opacity-30">🎯</div>
                <p className="text-slate-400 text-lg font-medium">
                  Select your hole cards to see probability analysis
                </p>
                <p className="text-slate-500 text-sm">
                  Real-time calculations powered by Monte Carlo simulation
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Card Selection Modal */}
      {state.showCardSelector && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 max-w-6xl w-full max-h-[90vh] overflow-hidden border-2 border-yellow-500/30 shadow-2xl">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-8">
              <div className="bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-2xl p-1">
                <div className="bg-slate-900 rounded-xl px-6 py-3">
                  <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-300">
                    🎴 Select Card for {
                      state.selectedSlot?.type === 'player'
                        ? `Hole Card ${(state.selectedSlot.index + 1)}`
                        : state.selectedSlot?.index === 0 ? 'Flop Card 1'
                        : state.selectedSlot?.index === 1 ? 'Flop Card 2'  
                        : state.selectedSlot?.index === 2 ? 'Flop Card 3'
                        : state.selectedSlot?.index === 3 ? 'Turn Card'
                        : 'River Card'
                    }
                  </h3>
                </div>
              </div>
              
              <button
                onClick={handleClosePicker}
                className="w-12 h-12 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center text-white text-xl font-bold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                ✕
              </button>
            </div>
            
            {/* Card Grid */}
            <div className="overflow-y-auto max-h-[60vh] pr-4 custom-scrollbar">
              <div className="grid grid-cols-8 lg:grid-cols-10 xl:grid-cols-13 gap-4 p-6 bg-gradient-to-br from-green-900/50 to-emerald-900/50 rounded-2xl border border-green-700/50 felt-texture">
                {deck.availableCards.filter(card => !state.usedCards.has(card.id)).map((card) => (
                  <div key={card.id} className="flex justify-center">
                    <Card
                      card={card}
                      onClick={() => handleCardSelect(card)}
                      size="small"
                      className="hover:ring-2 hover:ring-yellow-400 hover:ring-opacity-75 card-shine card-luxury"
                    />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="mt-6 text-center">
              <p className="text-slate-400 text-sm">
                Click any card to add it to your selection • {deck.availableCards.filter(card => !state.usedCards.has(card.id)).length} cards available
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Calculator
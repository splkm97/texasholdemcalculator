/**
 * Deck Management Utilities
 * Advanced deck operations and management functions
 */

import type { Card, Deck } from '../../../types/card'
import { createDeck, dealCards, shuffleDeck } from './card-utils'

/**
 * Creates a shuffled deck ready for dealing
 */
export function createShuffledDeck(): Deck {
  const deck = createDeck()
  return shuffleDeck(deck)
}

/**
 * Removes specific cards from deck (for simulation purposes)
 */
export function removeCardsFromDeck(deck: Deck, cardsToRemove: Card[]): Deck {
  const removeIds = new Set(cardsToRemove.map(card => card.id))
  
  const availableCards = deck.availableCards.filter(card => !removeIds.has(card.id))
  const usedCards = [...deck.usedCards, ...cardsToRemove]

  return {
    availableCards,
    usedCards,
    totalCards: 52
  }
}

/**
 * Gets remaining cards after removing known cards
 */
export function getRemainingCards(knownCards: Card[]): Card[] {
  const fullDeck = createDeck()
  const knownIds = new Set(knownCards.map(card => card.id))
  
  return fullDeck.availableCards.filter(card => !knownIds.has(card.id))
}

/**
 * Deals a specific number of hands from deck
 */
export function dealHands(deck: Deck, numHands: number, cardsPerHand: number): {
  hands: Card[][]
  remainingDeck: Deck
} {
  let currentDeck = deck
  const hands: Card[][] = []

  for (let i = 0; i < numHands; i++) {
    const result = dealCards(currentDeck, cardsPerHand)
    hands.push(result.dealtCards)
    currentDeck = result.remainingDeck
  }

  return {
    hands,
    remainingDeck: currentDeck
  }
}

/**
 * Simulates dealing cards for Monte Carlo calculations
 */
export function simulateDeal(
  knownCards: Card[], 
  numSimulations: number = 1000
): Card[][] {
  const simulations: Card[][] = []
  const availableCards = getRemainingCards(knownCards)

  for (let i = 0; i < numSimulations; i++) {
    // Create a deck with only unknown cards
    const simulationDeck: Deck = {
      availableCards: [...availableCards],
      usedCards: [...knownCards],
      totalCards: 52
    }

    // Shuffle and deal
    const shuffled = shuffleDeck(simulationDeck)
    const neededCards = 7 - knownCards.length // Total cards needed for full hand
    
    if (neededCards > 0) {
      const dealt = dealCards(shuffled, Math.min(neededCards, shuffled.availableCards.length))
      simulations.push([...knownCards, ...dealt.dealtCards])
    } else {
      simulations.push([...knownCards])
    }
  }

  return simulations
}

/**
 * Calculates deck statistics
 */
export function getDeckStats(deck: Deck): {
  availableCount: number
  usedCount: number
  availablePercentage: number
  suitCounts: Record<string, number>
  rankCounts: Record<string, number>
} {
  const suitCounts: Record<string, number> = {
    hearts: 0,
    diamonds: 0,
    clubs: 0,
    spades: 0
  }

  const rankCounts: Record<string, number> = {
    'A': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0, '7': 0,
    '8': 0, '9': 0, '10': 0, 'J': 0, 'Q': 0, 'K': 0
  }

  // Count available cards by suit and rank
  deck.availableCards.forEach(card => {
    suitCounts[card.suit]++
    rankCounts[card.rank]++
  })

  return {
    availableCount: deck.availableCards.length,
    usedCount: deck.usedCards.length,
    availablePercentage: (deck.availableCards.length / 52) * 100,
    suitCounts,
    rankCounts
  }
}

/**
 * Checks if deck has enough cards for operation
 */
export function canDealCards(deck: Deck, count: number): boolean {
  return deck.availableCards.length >= count
}

/**
 * Resets deck to full 52 cards
 */
export function resetDeck(): Deck {
  return createDeck()
}
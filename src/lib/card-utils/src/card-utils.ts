/**
 * Card Utilities Library
 * Core functions for card creation, validation, and deck management
 */

import type { 
  Card, 
  Deck, 
  Suit, 
  Rank, 
  ValidationResult, 
  ValidationError, 
  ComparisonResult 
} from '../../../types/card'
import { 
  SUITS, 
  RANKS, 
  SUIT_SYMBOLS, 
  SUIT_ABBREVIATIONS, 
  CARD_VALUES, 
  CARD_VALUES_ACE_LOW 
} from '../../../types/card'

/**
 * Creates a playing card with all required properties
 */
export function createCard(suit: Suit, rank: Rank): Card {
  if (!SUITS.includes(suit)) {
    throw new Error('INVALID_SUIT')
  }
  if (!RANKS.includes(rank)) {
    throw new Error('INVALID_RANK')
  }

  const value = CARD_VALUES[rank]
  const display = `${rank}${SUIT_SYMBOLS[suit]}`
  const id = `${rank}${SUIT_ABBREVIATIONS[suit]}`

  return {
    suit,
    rank,
    value,
    display,
    id
  }
}

/**
 * Creates a complete deck of 52 playing cards
 */
export function createDeck(): Deck {
  const availableCards: Card[] = []

  for (const suit of SUITS) {
    for (const rank of RANKS) {
      availableCards.push(createCard(suit, rank))
    }
  }

  return {
    availableCards,
    usedCards: [],
    totalCards: 52
  }
}

/**
 * Shuffles the available cards in a deck using Fisher-Yates algorithm
 */
export function shuffleDeck(deck: Deck): Deck {
  const shuffledCards = [...deck.availableCards]
  
  for (let i = shuffledCards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffledCards[i], shuffledCards[j]] = [shuffledCards[j], shuffledCards[i]]
  }

  return {
    ...deck,
    availableCards: shuffledCards
  }
}

/**
 * Deals specified number of cards from deck
 */
export function dealCards(deck: Deck, count: number): { dealtCards: Card[], remainingDeck: Deck } {
  if (count > deck.availableCards.length) {
    throw new Error('INSUFFICIENT_CARDS')
  }

  const dealtCards = deck.availableCards.slice(0, count)
  const remainingAvailable = deck.availableCards.slice(count)
  const newUsedCards = [...deck.usedCards, ...dealtCards]

  return {
    dealtCards,
    remainingDeck: {
      availableCards: remainingAvailable,
      usedCards: newUsedCards,
      totalCards: 52
    }
  }
}

/**
 * Validates array of cards for duplicates and correctness
 */
export function validateCards(cards: Card[]): ValidationResult {
  const errors: ValidationError[] = []
  const seenIds = new Set<string>()

  for (const card of cards) {
    // Check for duplicate cards
    if (seenIds.has(card.id)) {
      errors.push({
        code: 'DUPLICATE_CARD',
        message: `Card already exists: ${card.display}`,
        field: card.id
      })
    }
    seenIds.add(card.id)

    // Validate card structure
    if (!SUITS.includes(card.suit)) {
      errors.push({
        code: 'INVALID_SUIT',
        message: `Invalid suit: ${card.suit}`,
        field: card.id
      })
    }

    if (!RANKS.includes(card.rank)) {
      errors.push({
        code: 'INVALID_RANK',
        message: `Invalid rank: ${card.rank}`,
        field: card.id
      })
    }

    // Validate derived properties
    if (card.value !== CARD_VALUES[card.rank]) {
      errors.push({
        code: 'INVALID_VALUE',
        message: `Incorrect value for ${card.rank}: expected ${CARD_VALUES[card.rank]}, got ${card.value}`,
        field: card.id
      })
    }

    const expectedDisplay = `${card.rank}${SUIT_SYMBOLS[card.suit]}`
    if (card.display !== expectedDisplay) {
      errors.push({
        code: 'INVALID_DISPLAY',
        message: `Incorrect display format: expected ${expectedDisplay}, got ${card.display}`,
        field: card.id
      })
    }

    const expectedId = `${card.rank}${SUIT_ABBREVIATIONS[card.suit]}`
    if (card.id !== expectedId) {
      errors.push({
        code: 'INVALID_ID',
        message: `Incorrect ID format: expected ${expectedId}, got ${card.id}`,
        field: card.id
      })
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Validates poker hand configuration for specific game stage
 */
export function validatePokerHand(
  playerHand: Card[], 
  communityCards: Card[], 
  stage: string
): ValidationResult {
  const errors: ValidationError[] = []
  const allCards = [...playerHand, ...communityCards]

  // First validate all cards individually
  const cardValidation = validateCards(allCards)
  if (!cardValidation.isValid) {
    errors.push(...cardValidation.errors)
  }

  // Validate player hand size
  if (stage !== 'pre-flop' && playerHand.length !== 2) {
    errors.push({
      code: 'INVALID_PLAYER_HAND_SIZE',
      message: `Player hand must have exactly 2 cards, got ${playerHand.length}`
    })
  }

  // Validate community cards for stage
  const stageRequirements: Record<string, number> = {
    'pre-flop': 0,
    'flop': 3,
    'turn': 4,
    'river': 5
  }

  const expectedCommunityCount = stageRequirements[stage]
  if (expectedCommunityCount !== undefined && communityCards.length !== expectedCommunityCount) {
    errors.push({
      code: 'INVALID_COMMUNITY_CARDS',
      message: `${stage} stage requires ${expectedCommunityCount} community cards, got ${communityCards.length}`
    })
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Parses card from string representation (e.g., "AS", "KH", "10D")
 */
export function parseCard(cardString: string): Card {
  if (!cardString || cardString.length < 2) {
    throw new Error('INVALID_CARD_STRING')
  }

  // Handle 10 cards specially
  let rank: Rank
  let suitChar: string

  if (cardString.startsWith('10')) {
    rank = '10'
    suitChar = cardString.charAt(2)
  } else {
    rank = cardString.charAt(0) as Rank
    suitChar = cardString.charAt(1)
  }

  // Map suit character to full suit name
  const suitMap: Record<string, Suit> = {
    'H': 'hearts',
    'D': 'diamonds',
    'C': 'clubs',
    'S': 'spades'
  }

  const suit = suitMap[suitChar.toUpperCase()]
  if (!suit) {
    throw new Error('INVALID_CARD_STRING')
  }

  if (!RANKS.includes(rank)) {
    throw new Error('INVALID_CARD_STRING')
  }

  return createCard(suit, rank)
}

/**
 * Compares two cards for sorting/ranking purposes
 */
export function compareCards(card1: Card, card2: Card, aceHigh: boolean = true): ComparisonResult {
  const values = aceHigh ? CARD_VALUES : CARD_VALUES_ACE_LOW
  const value1 = values[card1.rank]
  const value2 = values[card2.rank]

  let result: -1 | 0 | 1
  let reasoning: string

  if (value1 < value2) {
    result = -1
    reasoning = `${card1.display} (${value1}) is lower than ${card2.display} (${value2})`
  } else if (value1 > value2) {
    result = 1
    reasoning = `${card1.display} (${value1}) is higher than ${card2.display} (${value2})`
  } else {
    result = 0
    reasoning = `${card1.display} and ${card2.display} have equal rank (${value1})`
  }

  if (aceHigh && (card1.rank === 'A' || card2.rank === 'A')) {
    reasoning += ' (Ace is high)'
  } else if (!aceHigh && (card1.rank === 'A' || card2.rank === 'A')) {
    reasoning += ' (Ace is low)'
  }

  return { result, reasoning }
}

/**
 * Gets poker-related constants and configurations
 */
export function getConstants() {
  return {
    SUITS,
    RANKS,
    HAND_TYPES: {
      0: 'High Card',
      1: 'One Pair', 
      2: 'Two Pair',
      3: 'Three of a Kind',
      4: 'Straight',
      5: 'Flush',
      6: 'Full House',
      7: 'Four of a Kind',
      8: 'Straight Flush',
      9: 'Royal Flush'
    },
    DECK_SIZE: 52,
    UNICODE_SUITS: SUIT_SYMBOLS
  }
}
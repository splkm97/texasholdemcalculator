/**
 * Card Types and Interfaces
 * Domain model for playing cards in poker
 */

export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades'

export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K'

export interface Card {
  suit: Suit
  rank: Rank
  value: number // Numerical value for calculations (A=1/14, 2-10=face, J=11, Q=12, K=13)
  display: string // Human readable format (e.g., "A♠", "K♥")
  id: string // Unique identifier (e.g., "AS", "KH")
}

export interface Deck {
  availableCards: Card[]
  usedCards: Card[]
  totalCards: 52
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
}

export interface ValidationError {
  code: string
  message: string
  field?: string
}

export interface ComparisonResult {
  result: -1 | 0 | 1 // -1 if first < second, 0 if equal, 1 if first > second
  reasoning: string
}

// Constants for card creation and validation
export const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades']
export const RANKS: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']

// Unicode symbols for card display
export const SUIT_SYMBOLS: Record<Suit, string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠'
}

// Suit abbreviations for ID generation
export const SUIT_ABBREVIATIONS: Record<Suit, string> = {
  hearts: 'H',
  diamonds: 'D',
  clubs: 'C',
  spades: 'S'
}

// Card values for comparison (Ace can be high or low)
export const CARD_VALUES: Record<Rank, number> = {
  'A': 14, // Default to high
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  '10': 10,
  'J': 11,
  'Q': 12,
  'K': 13
}

export const CARD_VALUES_ACE_LOW: Record<Rank, number> = {
  'A': 1, // Ace low
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  '10': 10,
  'J': 11,
  'Q': 12,
  'K': 13
}
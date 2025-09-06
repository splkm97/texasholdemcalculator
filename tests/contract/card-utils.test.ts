import { describe, test, expect } from 'vitest'
import { createCard, validateCards, createDeck, dealCards, parseCard, compareCards } from '../../src/lib/card-utils/src/card-utils'

describe('Card Utils Library Contract Tests', () => {
  describe('createCard', () => {
    test('should create valid card object', () => {
      const card = createCard('hearts', 'A')
      
      expect(card).toEqual({
        suit: 'hearts',
        rank: 'A', 
        value: 14, // Ace high
        display: 'A♥',
        id: 'AH'
      })
    })
    
    test('should create number cards correctly', () => {
      const card = createCard('spades', '10')
      
      expect(card).toEqual({
        suit: 'spades',
        rank: '10',
        value: 10,
        display: '10♠',
        id: '10S'
      })
    })
    
    test('should throw error for invalid suit', () => {
      expect(() => createCard('invalid' as any, 'A')).toThrow('INVALID_SUIT')
    })
    
    test('should throw error for invalid rank', () => {
      expect(() => createCard('hearts', 'X' as any)).toThrow('INVALID_RANK')
    })
  })
  
  describe('createDeck', () => {
    test('should create 52 unique cards', () => {
      const deck = createDeck()
      
      expect(deck.availableCards).toHaveLength(52)
      expect(deck.usedCards).toHaveLength(0)
      expect(deck.totalCards).toBe(52)
      
      // Verify uniqueness
      const ids = deck.availableCards.map(card => card.id)
      expect(new Set(ids)).toHaveLength(52)
      
      // Verify all suits and ranks are present
      const suits = ['hearts', 'diamonds', 'clubs', 'spades']
      const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
      
      suits.forEach(suit => {
        ranks.forEach(rank => {
          const expected = rank + suit.charAt(0).toUpperCase()
          expect(ids).toContain(expected)
        })
      })
    })
  })
  
  describe('validateCards', () => {
    test('should detect duplicate cards', () => {
      const duplicateCards = [
        createCard('hearts', 'A'),
        createCard('hearts', 'A')
      ]
      
      const result = validateCards(duplicateCards)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].code).toBe('DUPLICATE_CARD')
      expect(result.errors[0].message).toContain('Card already exists')
    })
    
    test('should pass validation for unique cards', () => {
      const uniqueCards = [
        createCard('hearts', 'A'),
        createCard('spades', 'K'),
        createCard('diamonds', 'Q')
      ]
      
      const result = validateCards(uniqueCards)
      
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
    
    test('should validate empty array', () => {
      const result = validateCards([])
      
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
  })
  
  describe('dealCards', () => {
    test('should deal specified number of cards from deck', () => {
      const deck = createDeck()
      const originalAvailable = deck.availableCards.length
      
      const result = dealCards(deck, 5)
      
      expect(result.dealtCards).toHaveLength(5)
      expect(result.remainingDeck.availableCards).toHaveLength(originalAvailable - 5)
      expect(result.remainingDeck.usedCards).toHaveLength(5)
      
      // Verify dealt cards are unique
      const ids = result.dealtCards.map(card => card.id)
      expect(new Set(ids)).toHaveLength(5)
    })
    
    test('should throw error when insufficient cards', () => {
      const deck = createDeck()
      
      expect(() => dealCards(deck, 53)).toThrow('INSUFFICIENT_CARDS')
    })
  })
  
  describe('parseCard', () => {
    test('should parse standard card notation', () => {
      const card = parseCard('AS')
      
      expect(card.suit).toBe('spades')
      expect(card.rank).toBe('A')
      expect(card.id).toBe('AS')
    })
    
    test('should parse 10 cards correctly', () => {
      const card = parseCard('10H')
      
      expect(card.suit).toBe('hearts')
      expect(card.rank).toBe('10')
      expect(card.id).toBe('10H')
    })
    
    test('should throw error for invalid card string', () => {
      expect(() => parseCard('XX')).toThrow('INVALID_CARD_STRING')
    })
  })
  
  describe('compareCards', () => {
    test('should compare card values correctly', () => {
      const aceHigh = createCard('spades', 'A')
      const king = createCard('hearts', 'K')
      
      const result = compareCards(aceHigh, king, true)
      
      expect(result.result).toBe(1) // ace > king
      expect(result.reasoning).toContain('is higher')
    })
    
    test('should handle ace low comparison', () => {
      const aceLow = createCard('spades', 'A')
      const two = createCard('hearts', '2')
      
      const result = compareCards(aceLow, two, false)
      
      expect(result.result).toBe(-1) // ace < 2 when ace low
    })
  })
})
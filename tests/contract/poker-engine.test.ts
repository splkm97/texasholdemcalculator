import { describe, test, expect } from 'vitest'
import { calculateProbabilities, evaluateHand } from '../../src/lib/poker-engine/src/poker-engine'
import { createCard } from '../../src/lib/card-utils/src/card-utils'

describe('Poker Engine Library Contract Tests', () => {
  describe('calculateProbabilities', () => {
    test('should return valid probability results for pre-flop', async () => {
      const playerHand = [
        createCard('spades', 'A'),
        createCard('hearts', 'A')
      ]
      const communityCards: any[] = []
      const stage = 'pre-flop'
      
      const results = await calculateProbabilities({
        playerHand,
        communityCards,
        stage,
        preferredMethod: 'lookup' as const
      })
      
      expect(results.stage).toBe('pre-flop')
      expect(results.probabilities).toHaveLength(10) // All hand types
      expect(results.calculationTime).toBeLessThan(100) // Performance requirement
      expect(results.method).toBe('lookup')
      expect(results.timestamp).toBeTypeOf('number')
      
      // Verify probabilities sum to ~1.0 (allowing for rounding)
      const total = results.probabilities.reduce((sum, p) => sum + p.probability, 0)
      expect(total).toBeCloseTo(1.0, 2)
      
      // Verify all probabilities are valid
      results.probabilities.forEach(prob => {
        expect(prob.probability).toBeGreaterThanOrEqual(0)
        expect(prob.probability).toBeLessThanOrEqual(1)
        expect(prob.percentage).toBe(prob.probability * 100)
        expect(prob.occurrences).toBeGreaterThanOrEqual(0)
        expect(prob.totalOutcomes).toBeGreaterThan(0)
        expect(prob.odds).toMatch(/^\d+(\.\d+)?:\d+$/)
      })
    })
    
    test('should handle flop stage calculations', async () => {
      const playerHand = [
        createCard('spades', 'A'),
        createCard('hearts', 'A')
      ]
      const communityCards = [
        createCard('clubs', 'A'),
        createCard('diamonds', 'K'),
        createCard('spades', 'Q')
      ]
      
      const results = await calculateProbabilities({
        playerHand,
        communityCards,
        stage: 'flop',
        preferredMethod: 'auto' as const
      })
      
      expect(results.stage).toBe('flop')
      expect(results.communityCards).toHaveLength(3)
      expect(results.calculationTime).toBeLessThan(100)
    })
    
    test('should throw error for invalid card combinations', async () => {
      const playerHand = [
        createCard('spades', 'A'),
        createCard('spades', 'A') // Duplicate card
      ]
      
      await expect(calculateProbabilities({
        playerHand,
        communityCards: [],
        stage: 'pre-flop'
      })).rejects.toThrow('DUPLICATE_CARD')
    })
  })
  
  describe('evaluateHand', () => {
    test('should identify best 5-card hand from 7 cards', () => {
      const cards = [
        createCard('spades', 'A'),
        createCard('hearts', 'A'),
        createCard('clubs', 'A'), 
        createCard('diamonds', 'K'),
        createCard('spades', 'K'),
        createCard('hearts', '2'),
        createCard('clubs', '7')
      ]
      
      const result = evaluateHand({ cards })
      
      expect(result.handStrength).toBe(6) // FULL_HOUSE
      expect(result.bestHand).toHaveLength(5)
      expect(result.kickers).toBeInstanceOf(Array)
      expect(result.description).toContain('Full House')
    })
    
    test('should handle 5-card hand evaluation', () => {
      const cards = [
        createCard('spades', '2'),
        createCard('hearts', '3'),
        createCard('clubs', '4'), 
        createCard('diamonds', '5'),
        createCard('spades', '6')
      ]
      
      const result = evaluateHand({ cards })
      
      expect(result.handStrength).toBe(4) // STRAIGHT
      expect(result.bestHand).toHaveLength(5)
      expect(result.description).toContain('Straight')
    })
    
    test('should throw error for insufficient cards', () => {
      const cards = [
        createCard('spades', 'A'),
        createCard('hearts', 'K'),
        createCard('clubs', 'Q'),
        createCard('diamonds', 'J')
      ]
      
      expect(() => evaluateHand({ cards })).toThrow('INSUFFICIENT_CARDS')
    })
  })
})
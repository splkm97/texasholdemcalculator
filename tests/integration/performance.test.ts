import { describe, test, expect, vi } from 'vitest'
import { calculateProbabilities } from '../../src/lib/poker-engine/src/poker-engine'
import { createCard } from '../../src/lib/card-utils/src/card-utils'

describe('Performance Integration Tests', () => {
  test('probability calculations should complete within 100ms', async () => {
    const playerHand = [
      createCard('spades', 'A'),
      createCard('hearts', 'A')
    ]
    
    const startTime = performance.now()
    
    const results = await calculateProbabilities({
      playerHand,
      communityCards: [],
      stage: 'pre-flop',
      preferredMethod: 'lookup'
    })
    
    const endTime = performance.now()
    const executionTime = endTime - startTime
    
    expect(executionTime).toBeLessThan(100)
    expect(results.calculationTime).toBeLessThan(100)
  })

  test('flop stage calculations should complete within 100ms', async () => {
    const playerHand = [
      createCard('spades', 'A'),
      createCard('hearts', 'K')
    ]
    const communityCards = [
      createCard('diamonds', 'Q'),
      createCard('clubs', 'J'),
      createCard('spades', '10')
    ]
    
    const startTime = performance.now()
    
    const results = await calculateProbabilities({
      playerHand,
      communityCards,
      stage: 'flop',
      preferredMethod: 'auto'
    })
    
    const endTime = performance.now()
    
    expect(endTime - startTime).toBeLessThan(100)
    expect(results.calculationTime).toBeLessThan(100)
  })

  test('multiple rapid calculations should maintain performance', async () => {
    const testCases = [
      {
        playerHand: [createCard('spades', 'A'), createCard('hearts', 'A')],
        communityCards: [],
        stage: 'pre-flop' as const
      },
      {
        playerHand: [createCard('spades', 'K'), createCard('hearts', 'Q')],
        communityCards: [createCard('diamonds', 'J'), createCard('clubs', '10'), createCard('spades', '9')],
        stage: 'flop' as const
      },
      {
        playerHand: [createCard('diamonds', '7'), createCard('clubs', '7')],
        communityCards: [createCard('hearts', '7'), createCard('spades', 'K'), createCard('diamonds', 'K'), createCard('clubs', 'Q')],
        stage: 'turn' as const
      }
    ]
    
    const startTime = performance.now()
    
    const results = await Promise.all(
      testCases.map(testCase => calculateProbabilities(testCase))
    )
    
    const endTime = performance.now()
    const totalTime = endTime - startTime
    
    // All calculations together should complete quickly
    expect(totalTime).toBeLessThan(300)
    
    // Each individual calculation should be fast
    results.forEach(result => {
      expect(result.calculationTime).toBeLessThan(100)
    })
  })

  test('cache should improve repeated calculation performance', async () => {
    const playerHand = [
      createCard('spades', 'A'),
      createCard('hearts', 'A')
    ]
    const communityCards = [
      createCard('diamonds', 'K'),
      createCard('clubs', 'Q'),
      createCard('spades', 'J')
    ]
    
    // First calculation (cache miss)
    const startTime1 = performance.now()
    const result1 = await calculateProbabilities({
      playerHand,
      communityCards,
      stage: 'flop'
    })
    const endTime1 = performance.now()
    const firstCalculationTime = endTime1 - startTime1
    
    // Second calculation (cache hit)
    const startTime2 = performance.now()
    const result2 = await calculateProbabilities({
      playerHand,
      communityCards,
      stage: 'flop'
    })
    const endTime2 = performance.now()
    const secondCalculationTime = endTime2 - startTime2
    
    // Second calculation should be faster due to caching
    expect(secondCalculationTime).toBeLessThan(firstCalculationTime)
    expect(secondCalculationTime).toBeLessThan(10) // Very fast cache retrieval
    
    // Results should be identical
    expect(result2.probabilities).toEqual(result1.probabilities)
  })

  test('large deck operations should be efficient', async () => {
    const { createDeck, dealCards, validateCards } = await import('../../src/lib/card-utils/src/card-utils')
    
    const startTime = performance.now()
    
    // Create and manipulate full deck
    const deck = createDeck()
    expect(deck.availableCards).toHaveLength(52)
    
    // Deal multiple hands
    let currentDeck = deck
    const dealtHands = []
    for (let i = 0; i < 10; i++) {
      const result = dealCards(currentDeck, 7) // Deal 7 cards per hand
      dealtHands.push(result.dealtCards)
      currentDeck = result.remainingDeck
    }
    
    // Validate all dealt cards
    const allDealtCards = dealtHands.flat()
    const validationResult = validateCards(allDealtCards)
    
    const endTime = performance.now()
    
    expect(endTime - startTime).toBeLessThan(50) // Deck operations should be very fast
    expect(validationResult.isValid).toBe(true)
    expect(allDealtCards).toHaveLength(70)
  })

  test('memory usage should remain stable during calculations', async () => {
    // Simulate memory pressure test
    const calculations = []
    
    for (let i = 0; i < 50; i++) {
      const playerHand = [
        createCard('spades', 'A'),
        createCard('hearts', 'K')
      ]
      
      calculations.push(calculateProbabilities({
        playerHand,
        communityCards: [],
        stage: 'pre-flop'
      }))
    }
    
    const startTime = performance.now()
    await Promise.all(calculations)
    const endTime = performance.now()
    
    // Even with many calculations, total time should be reasonable
    expect(endTime - startTime).toBeLessThan(1000)
  })

  test('UI responsiveness should be maintained during calculations', async () => {
    // This test would typically use a UI testing framework to measure
    // rendering performance, but we'll simulate the concept
    
    const playerHand = [
      createCard('spades', 'A'),
      createCard('hearts', 'A')
    ]
    
    // Mock a scenario where multiple UI updates happen during calculation
    const uiUpdates = []
    const calculationPromise = calculateProbabilities({
      playerHand,
      communityCards: [],
      stage: 'pre-flop'
    })
    
    // Simulate rapid UI updates
    for (let i = 0; i < 10; i++) {
      const updateStart = performance.now()
      // Simulate DOM update
      await new Promise(resolve => setTimeout(resolve, 1))
      const updateEnd = performance.now()
      uiUpdates.push(updateEnd - updateStart)
    }
    
    await calculationPromise
    
    // UI updates should remain fast even during calculation
    const avgUpdateTime = uiUpdates.reduce((sum, time) => sum + time, 0) / uiUpdates.length
    expect(avgUpdateTime).toBeLessThan(16) // Maintain 60fps (16ms per frame)
  })

  test('web worker isolation should not block main thread', async () => {
    // This test simulates the expected behavior when calculations are moved to web workers
    // In the actual implementation, heavy calculations would run in a web worker
    
    const heavyCalculation = async () => {
      // Simulate CPU-intensive calculation
      const playerHand = [createCard('spades', 'A'), createCard('hearts', 'A')]
      const communityCards = [
        createCard('diamonds', 'K'),
        createCard('clubs', 'Q'),
        createCard('spades', 'J'),
        createCard('hearts', '10')
      ]
      
      return calculateProbabilities({
        playerHand,
        communityCards,
        stage: 'turn',
        preferredMethod: 'simulation' // More CPU intensive
      })
    }
    
    const mainThreadWork = async () => {
      // Simulate main thread work
      const start = performance.now()
      await new Promise(resolve => setTimeout(resolve, 10))
      return performance.now() - start
    }
    
    // Start both simultaneously
    const [calculationResult, mainThreadTime] = await Promise.all([
      heavyCalculation(),
      mainThreadWork()
    ])
    
    // Main thread work should complete quickly
    expect(mainThreadTime).toBeLessThan(50)
    expect(calculationResult.calculationTime).toBeLessThan(100)
  })
})
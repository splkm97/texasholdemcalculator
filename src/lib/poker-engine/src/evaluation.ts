/**
 * Poker Hand Evaluation
 * Functions for evaluating and ranking poker hands
 */

import type { Card } from '../../../types/card'
import type { HandEvaluation } from '../../../types/poker'
import { HandStrength } from '../../../types/poker'

/**
 * Evaluates the best 5-card poker hand from 5-7 cards
 */
export function evaluatePokerHand(cards: Card[]): HandEvaluation {
  if (cards.length < 5) {
    throw new Error('INSUFFICIENT_CARDS')
  }

  if (cards.length === 5) {
    return evaluateFiveCardHand(cards)
  }

  // For 6-7 cards, find the best 5-card combination
  return findBestFiveCardHand(cards)
}

/**
 * Evaluates exactly 5 cards
 */
function evaluateFiveCardHand(cards: Card[]): HandEvaluation {
  const sortedCards = [...cards].sort((a, b) => b.value - a.value)
  
  // Check for each hand type in order of strength
  let result = checkRoyalFlush(sortedCards)
  if (result) return result

  result = checkStraightFlush(sortedCards)
  if (result) return result

  result = checkFourOfAKind(sortedCards)
  if (result) return result

  result = checkFullHouse(sortedCards)
  if (result) return result

  result = checkFlush(sortedCards)
  if (result) return result

  result = checkStraight(sortedCards)
  if (result) return result

  result = checkThreeOfAKind(sortedCards)
  if (result) return result

  result = checkTwoPair(sortedCards)
  if (result) return result

  result = checkOnePair(sortedCards)
  if (result) return result

  // High card
  return {
    bestHand: sortedCards,
    handStrength: HandStrength.HIGH_CARD,
    kickers: sortedCards.slice(1),
    description: `High Card, ${sortedCards[0].display} high`
  }
}

/**
 * Finds best 5-card hand from 6-7 cards
 */
function findBestFiveCardHand(cards: Card[]): HandEvaluation {
  const combinations = getCombinations(cards, 5)
  let bestHand: HandEvaluation | null = null

  for (const combo of combinations) {
    const evaluation = evaluateFiveCardHand(combo)
    
    if (!bestHand || evaluation.handStrength > bestHand.handStrength) {
      bestHand = evaluation
    } else if (evaluation.handStrength === bestHand.handStrength) {
      // Compare kickers for same hand strength
      if (compareHands(evaluation, bestHand) > 0) {
        bestHand = evaluation
      }
    }
  }

  return bestHand!
}

/**
 * Generates all 5-card combinations from n cards
 */
function getCombinations(cards: Card[], k: number): Card[][] {
  if (k === 0) return [[]]
  if (cards.length === 0) return []

  const [first, ...rest] = cards
  const combosWithoutFirst = getCombinations(rest, k)
  const combosWithFirst = getCombinations(rest, k - 1).map(combo => [first, ...combo])

  return combosWithoutFirst.concat(combosWithFirst)
}

/**
 * Hand evaluation helper functions
 */
function checkRoyalFlush(cards: Card[]): HandEvaluation | null {
  const flushResult = checkFlush(cards)
  if (!flushResult) return null

  const ranks = cards.map(c => c.rank)
  const royalRanks = ['A', 'K', 'Q', 'J', '10']
  const isRoyal = royalRanks.every(rank => ranks.includes(rank as any))

  if (isRoyal) {
    return {
      bestHand: cards,
      handStrength: HandStrength.ROYAL_FLUSH,
      kickers: [],
      description: `Royal Flush of ${cards[0].suit}`
    }
  }

  return null
}

function checkStraightFlush(cards: Card[]): HandEvaluation | null {
  const flushResult = checkFlush(cards)
  const straightResult = checkStraight(cards)

  if (flushResult && straightResult) {
    return {
      bestHand: cards,
      handStrength: HandStrength.STRAIGHT_FLUSH,
      kickers: [],
      description: `Straight Flush, ${cards[0].display} high`
    }
  }

  return null
}

function checkFourOfAKind(cards: Card[]): HandEvaluation | null {
  const rankCounts = countRanks(cards)
  const fourOfAKindRank = Object.keys(rankCounts).find(rank => rankCounts[rank] === 4)

  if (fourOfAKindRank) {
    const fourCards = cards.filter(c => c.rank === fourOfAKindRank)
    const kicker = cards.find(c => c.rank !== fourOfAKindRank)!

    return {
      bestHand: [...fourCards, kicker],
      handStrength: HandStrength.FOUR_OF_A_KIND,
      kickers: [kicker],
      description: `Four of a Kind, ${fourOfAKindRank}s`
    }
  }

  return null
}

function checkFullHouse(cards: Card[]): HandEvaluation | null {
  const rankCounts = countRanks(cards)
  const threeOfAKindRank = Object.keys(rankCounts).find(rank => rankCounts[rank] === 3)
  const pairRank = Object.keys(rankCounts).find(rank => rankCounts[rank] === 2)

  if (threeOfAKindRank && pairRank) {
    const threeCards = cards.filter(c => c.rank === threeOfAKindRank)
    const pairCards = cards.filter(c => c.rank === pairRank)

    return {
      bestHand: [...threeCards, ...pairCards],
      handStrength: HandStrength.FULL_HOUSE,
      kickers: [],
      description: `Full House, ${threeOfAKindRank}s over ${pairRank}s`
    }
  }

  return null
}

function checkFlush(cards: Card[]): HandEvaluation | null {
  const suitCounts = countSuits(cards)
  const flushSuit = Object.keys(suitCounts).find(suit => suitCounts[suit] >= 5)

  if (flushSuit) {
    const flushCards = cards.filter(c => c.suit === flushSuit).slice(0, 5)
    
    return {
      bestHand: flushCards,
      handStrength: HandStrength.FLUSH,
      kickers: flushCards.slice(1),
      description: `Flush, ${flushCards[0].display} high`
    }
  }

  return null
}

function checkStraight(cards: Card[]): HandEvaluation | null {
  const uniqueValues = [...new Set(cards.map(c => c.value))].sort((a, b) => b - a)
  
  // Check for regular straight
  for (let i = 0; i <= uniqueValues.length - 5; i++) {
    if (uniqueValues[i] - uniqueValues[i + 4] === 4) {
      const straightCards = cards
        .filter(c => c.value >= uniqueValues[i + 4] && c.value <= uniqueValues[i])
        .slice(0, 5)

      return {
        bestHand: straightCards,
        handStrength: HandStrength.STRAIGHT,
        kickers: [],
        description: `Straight, ${straightCards[0].display} high`
      }
    }
  }

  // Check for A-2-3-4-5 straight (wheel)
  const hasAce = cards.some(c => c.rank === 'A')
  const hasTwo = cards.some(c => c.rank === '2')
  const hasThree = cards.some(c => c.rank === '3')
  const hasFour = cards.some(c => c.rank === '4')
  const hasFive = cards.some(c => c.rank === '5')

  if (hasAce && hasTwo && hasThree && hasFour && hasFive) {
    const wheelCards = [
      cards.find(c => c.rank === '5')!,
      cards.find(c => c.rank === '4')!,
      cards.find(c => c.rank === '3')!,
      cards.find(c => c.rank === '2')!,
      cards.find(c => c.rank === 'A')!
    ]

    return {
      bestHand: wheelCards,
      handStrength: HandStrength.STRAIGHT,
      kickers: [],
      description: 'Straight, 5 high (wheel)'
    }
  }

  return null
}

function checkThreeOfAKind(cards: Card[]): HandEvaluation | null {
  const rankCounts = countRanks(cards)
  const threeOfAKindRank = Object.keys(rankCounts).find(rank => rankCounts[rank] === 3)

  if (threeOfAKindRank) {
    const threeCards = cards.filter(c => c.rank === threeOfAKindRank)
    const kickers = cards
      .filter(c => c.rank !== threeOfAKindRank)
      .sort((a, b) => b.value - a.value)
      .slice(0, 2)

    return {
      bestHand: [...threeCards, ...kickers],
      handStrength: HandStrength.THREE_OF_A_KIND,
      kickers,
      description: `Three of a Kind, ${threeOfAKindRank}s`
    }
  }

  return null
}

function checkTwoPair(cards: Card[]): HandEvaluation | null {
  const rankCounts = countRanks(cards)
  const pairs = Object.keys(rankCounts).filter(rank => rankCounts[rank] === 2)

  if (pairs.length >= 2) {
    // Sort pairs by card value
    const sortedPairs = pairs.sort((a, b) => {
      const aCard = cards.find(c => c.rank === a)!
      const bCard = cards.find(c => c.rank === b)!
      return bCard.value - aCard.value
    })

    const higherPair = cards.filter(c => c.rank === sortedPairs[0])
    const lowerPair = cards.filter(c => c.rank === sortedPairs[1])
    const kicker = cards
      .filter(c => !pairs.includes(c.rank))
      .sort((a, b) => b.value - a.value)[0]

    return {
      bestHand: [...higherPair, ...lowerPair, kicker],
      handStrength: HandStrength.TWO_PAIR,
      kickers: [kicker],
      description: `Two Pair, ${sortedPairs[0]}s and ${sortedPairs[1]}s`
    }
  }

  return null
}

function checkOnePair(cards: Card[]): HandEvaluation | null {
  const rankCounts = countRanks(cards)
  const pairRank = Object.keys(rankCounts).find(rank => rankCounts[rank] === 2)

  if (pairRank) {
    const pairCards = cards.filter(c => c.rank === pairRank)
    const kickers = cards
      .filter(c => c.rank !== pairRank)
      .sort((a, b) => b.value - a.value)
      .slice(0, 3)

    return {
      bestHand: [...pairCards, ...kickers],
      handStrength: HandStrength.PAIR,
      kickers,
      description: `Pair of ${pairRank}s`
    }
  }

  return null
}

/**
 * Helper functions
 */
function countRanks(cards: Card[]): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const card of cards) {
    counts[card.rank] = (counts[card.rank] || 0) + 1
  }
  return counts
}

function countSuits(cards: Card[]): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const card of cards) {
    counts[card.suit] = (counts[card.suit] || 0) + 1
  }
  return counts
}

function compareHands(hand1: HandEvaluation, hand2: HandEvaluation): number {
  // Compare primary hand values first
  if (hand1.handStrength !== hand2.handStrength) {
    return hand1.handStrength - hand2.handStrength
  }

  // Compare kickers
  for (let i = 0; i < Math.max(hand1.kickers.length, hand2.kickers.length); i++) {
    const kicker1Value = hand1.kickers[i]?.value || 0
    const kicker2Value = hand2.kickers[i]?.value || 0
    
    if (kicker1Value !== kicker2Value) {
      return kicker1Value - kicker2Value
    }
  }

  return 0 // Hands are equal
}
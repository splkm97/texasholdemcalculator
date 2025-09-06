/**
 * Card Validation Utilities
 * Advanced validation functions for poker game logic
 */

import type { Card, ValidationResult, ValidationError } from '../../../types/card'
import { GameStage } from '../../../types/game'
import { validateCards } from './card-utils'

/**
 * Validates that cards are suitable for Texas Hold'em poker
 */
export function validateTexasHoldemCards(
  playerHand: Card[],
  communityCards: Card[],
  stage: GameStage
): ValidationResult {
  const errors: ValidationError[] = []

  // Basic card validation first
  const allCards = [...playerHand, ...communityCards]
  const basicValidation = validateCards(allCards)
  if (!basicValidation.isValid) {
    return basicValidation
  }

  // Player hand validation
  if (playerHand.length > 2) {
    errors.push({
      code: 'TOO_MANY_HOLE_CARDS',
      message: `Player can only have 2 hole cards, got ${playerHand.length}`
    })
  }

  // Stage-specific community card validation
  const stageRequirements: Record<GameStage, { min: number, max: number }> = {
    'pre-flop': { min: 0, max: 0 },
    'flop': { min: 3, max: 3 },
    'turn': { min: 4, max: 4 },
    'river': { min: 5, max: 5 }
  }

  const requirement = stageRequirements[stage]
  if (requirement) {
    if (communityCards.length < requirement.min) {
      errors.push({
        code: 'INSUFFICIENT_COMMUNITY_CARDS',
        message: `${stage} requires at least ${requirement.min} community cards, got ${communityCards.length}`
      })
    }
    if (communityCards.length > requirement.max) {
      errors.push({
        code: 'TOO_MANY_COMMUNITY_CARDS',
        message: `${stage} allows maximum ${requirement.max} community cards, got ${communityCards.length}`
      })
    }
  }

  // Total card count validation
  const totalCards = playerHand.length + communityCards.length
  const maxCardsForStage: Record<GameStage, number> = {
    'pre-flop': 2,
    'flop': 5,
    'turn': 6,
    'river': 7
  }

  if (totalCards > maxCardsForStage[stage]) {
    errors.push({
      code: 'TOO_MANY_TOTAL_CARDS',
      message: `${stage} allows maximum ${maxCardsForStage[stage]} total cards, got ${totalCards}`
    })
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Validates game progression rules
 */
export function validateGameProgression(
  currentStage: GameStage,
  targetStage: GameStage,
  playerHand: Card[],
  communityCards: Card[]
): ValidationResult {
  const errors: ValidationError[] = []

  // Define valid progressions
  const validProgressions: Record<GameStage, GameStage[]> = {
    [GameStage.PRE_FLOP]: [GameStage.FLOP],
    [GameStage.FLOP]: [GameStage.TURN],
    [GameStage.TURN]: [GameStage.RIVER],
    [GameStage.RIVER]: []
  }

  // Check if progression is valid
  if (!validProgressions[currentStage].includes(targetStage)) {
    errors.push({
      code: 'INVALID_STAGE_PROGRESSION',
      message: `Cannot progress from ${currentStage} to ${targetStage}`
    })
  }

  // Check prerequisites for target stage
  if (targetStage === 'flop' && playerHand.length < 2) {
    errors.push({
      code: 'MISSING_HOLE_CARDS',
      message: 'Both hole cards must be selected before flop'
    })
  }

  if (targetStage === 'turn' && communityCards.length < 3) {
    errors.push({
      code: 'MISSING_FLOP_CARDS', 
      message: 'All 3 flop cards must be selected before turn'
    })
  }

  if (targetStage === 'river' && communityCards.length < 4) {
    errors.push({
      code: 'MISSING_TURN_CARD',
      message: 'Turn card must be selected before river'
    })
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Validates card selection for specific slot
 */
export function validateCardSelection(
  card: Card,
  slot: string,
  existingCards: Card[]
): ValidationResult {
  const errors: ValidationError[] = []

  // Check for duplicates
  if (existingCards.some(existing => existing.id === card.id)) {
    errors.push({
      code: 'DUPLICATE_CARD',
      message: `${card.display} is already selected`,
      field: card.id
    })
  }

  // Validate slot-specific rules
  if (slot.startsWith('hole') && existingCards.filter(c => c.id.startsWith('hole')).length >= 2) {
    errors.push({
      code: 'HOLE_CARDS_FULL',
      message: 'Both hole card slots are already filled'
    })
  }

  if (slot.startsWith('flop') && existingCards.filter(c => c.id.startsWith('flop')).length >= 3) {
    errors.push({
      code: 'FLOP_CARDS_FULL',
      message: 'All flop card slots are already filled'
    })
  }

  if (slot === 'turn' && existingCards.some(c => c.id === 'turn')) {
    errors.push({
      code: 'TURN_CARD_FILLED',
      message: 'Turn card slot is already filled'
    })
  }

  if (slot === 'river' && existingCards.some(c => c.id === 'river')) {
    errors.push({
      code: 'RIVER_CARD_FILLED',
      message: 'River card slot is already filled'
    })
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Validates that hand has minimum cards for evaluation
 */
export function validateHandForEvaluation(cards: Card[]): ValidationResult {
  const errors: ValidationError[] = []

  if (cards.length < 5) {
    errors.push({
      code: 'INSUFFICIENT_CARDS',
      message: `Hand evaluation requires at least 5 cards, got ${cards.length}`
    })
  }

  if (cards.length > 7) {
    errors.push({
      code: 'TOO_MANY_CARDS',
      message: `Hand evaluation supports maximum 7 cards, got ${cards.length}`
    })
  }

  // Validate all cards
  const cardValidation = validateCards(cards)
  if (!cardValidation.isValid) {
    errors.push(...cardValidation.errors)
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}
/**
 * Game State Types and Interfaces
 * Domain model for Texas Hold'em game stages and state management
 */

import type { Card } from './card'

export enum GameStage {
  PRE_FLOP = 'pre-flop',
  FLOP = 'flop', 
  TURN = 'turn',
  RIVER = 'river'
}

export interface Stage {
  stage: GameStage
  knownCards: number // 2, 5, 6, 7
  remainingCards: number // 50, 47, 46, 45
  communityCardsCount: number // 0, 3, 4, 5
  isComplete: boolean
}

export interface CommunityCards {
  flop: Card[] // 3 cards or empty
  turn: Card | null // 1 card or null
  river: Card | null // 1 card or null
  allCards: Card[] // Combined array (0-5 cards)
  stage: GameStage
}

// Stage progression rules and validation
export const STAGE_RULES: Record<GameStage, Stage> = {
  [GameStage.PRE_FLOP]: {
    stage: GameStage.PRE_FLOP,
    knownCards: 2,
    remainingCards: 50,
    communityCardsCount: 0,
    isComplete: false
  },
  [GameStage.FLOP]: {
    stage: GameStage.FLOP,
    knownCards: 5,
    remainingCards: 47,
    communityCardsCount: 3,
    isComplete: false
  },
  [GameStage.TURN]: {
    stage: GameStage.TURN,
    knownCards: 6,
    remainingCards: 46,
    communityCardsCount: 4,
    isComplete: false
  },
  [GameStage.RIVER]: {
    stage: GameStage.RIVER,
    knownCards: 7,
    remainingCards: 45,
    communityCardsCount: 5,
    isComplete: true
  }
}

// Valid stage transitions
export const STAGE_TRANSITIONS: Record<GameStage, GameStage[]> = {
  [GameStage.PRE_FLOP]: [GameStage.FLOP],
  [GameStage.FLOP]: [GameStage.TURN],
  [GameStage.TURN]: [GameStage.RIVER],
  [GameStage.RIVER]: [] // Terminal state
}

export interface GameProgression {
  currentStage: GameStage
  canProgress: boolean
  nextStage: GameStage | null
  requirements: string[] // What needs to be completed to progress
}
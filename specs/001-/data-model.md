# Data Model: Texas Hold'em Poker Calculator

**Date**: 2025-09-06  
**Status**: Complete  
**Phase**: 1 - Design

## Core Entities

### Playing Card
**Purpose**: Represents individual playing cards with suit, rank, and derived properties

```typescript
interface Card {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  rank: 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';
  value: number; // Numerical value for calculations (A=1/14, 2-10=face, J=11, Q=12, K=13)
  display: string; // Human readable format (e.g., "A♠", "K♥")
  id: string; // Unique identifier (e.g., "AS", "KH")
}
```

**Validation Rules**:
- Must have valid suit from enum
- Must have valid rank from enum  
- Value must correspond to rank (with Ace handling)
- Display must be formatted consistently
- ID must be unique per card

**Relationships**: 
- Part of Deck entity
- Used in PlayerHand, CommunityCards, Deck collections

### Poker Hand Types
**Purpose**: Enumeration of all possible poker hand rankings with metadata

```typescript
enum HandStrength {
  HIGH_CARD = 0,
  PAIR = 1,
  TWO_PAIR = 2,
  THREE_OF_A_KIND = 3,
  STRAIGHT = 4,
  FLUSH = 5,
  FULL_HOUSE = 6,
  FOUR_OF_A_KIND = 7,
  STRAIGHT_FLUSH = 8,
  ROYAL_FLUSH = 9
}

interface HandType {
  strength: HandStrength;
  name: string;
  description: string;
  probability: number; // Base probability for 5-card evaluation
}
```

**Validation Rules**:
- Strength values 0-9 only
- Probabilities must sum to 1.0 across all hand types
- Names must be unique and standard poker terminology

### Game Stage
**Purpose**: Represents the four distinct stages of Texas Hold'em with known card counts

```typescript
enum GameStage {
  PRE_FLOP = 'pre-flop',
  FLOP = 'flop', 
  TURN = 'turn',
  RIVER = 'river'
}

interface Stage {
  stage: GameStage;
  knownCards: number; // 2, 5, 6, 7
  remainingCards: number; // 50, 47, 46, 45
  communityCardsCount: number; // 0, 3, 4, 5
  isComplete: boolean;
}
```

**State Transitions**:
- PRE_FLOP → FLOP (when 3 community cards added)
- FLOP → TURN (when 4th community card added)
- TURN → RIVER (when 5th community card added)
- RIVER = terminal state

### Player Hand
**Purpose**: Represents player's hole cards and current best hand combination

```typescript
interface PlayerHand {
  holeCards: Card[]; // Always 2 cards
  bestHand: Card[]; // Best 5-card combination from available cards
  handStrength: HandStrength;
  kickers: Card[]; // Tie-breaking cards
  isValid: boolean;
}
```

**Validation Rules**:
- Exactly 2 hole cards required
- Hole cards must be unique
- Best hand exactly 5 cards when stage allows
- Hand strength must match actual combination
- Kickers must be relevant to hand type

### Community Cards
**Purpose**: Manages the shared cards revealed during game progression

```typescript
interface CommunityCards {
  flop: Card[]; // 3 cards or empty
  turn: Card | null; // 1 card or null
  river: Card | null; // 1 card or null
  allCards: Card[]; // Combined array (0-5 cards)
  stage: GameStage;
}
```

**Validation Rules**:
- Flop must be exactly 3 cards or empty array
- Turn/River must be single card or null
- All cards must be unique across community + player hands
- Stage must reflect number of revealed cards

### Probability Calculation
**Purpose**: Stores calculated probabilities for each hand type at current game state

```typescript
interface ProbabilityResult {
  handType: HandStrength;
  probability: number; // 0-1 decimal
  percentage: number; // 0-100 display format  
  odds: string; // e.g., "2.5:1"
  occurrences: number; // Favorable outcomes in calculation
  totalOutcomes: number; // Total possible outcomes
}

interface CalculationResults {
  stage: GameStage;
  playerHand: Card[];
  communityCards: Card[];
  probabilities: ProbabilityResult[];
  calculationTime: number; // milliseconds
  method: 'lookup' | 'simulation' | 'exact'; // Calculation approach used
  timestamp: number; // For caching
}
```

**Validation Rules**:
- Probabilities must sum to ≤ 1.0 (some hands may be impossible)
- Percentage must equal probability * 100
- Calculation time must be positive
- Method must match actual algorithm used

### Calculator State
**Purpose**: Root state container for entire calculator application

```typescript
interface CalculatorState {
  // Input State
  selectedCards: Card[];
  communityCards: CommunityCards;
  currentStage: GameStage;
  
  // Calculation State  
  isCalculating: boolean;
  calculationResults: CalculationResults | null;
  error: string | null;
  
  // UI State
  selectedCardSlot: 'hole1' | 'hole2' | 'flop1' | 'flop2' | 'flop3' | 'turn' | 'river' | null;
  showProbabilities: boolean;
  
  // Configuration
  calculationMethod: 'auto' | 'lookup' | 'simulation' | 'exact';
  displayFormat: 'percentage' | 'decimal' | 'odds';
}
```

**State Transitions**:
- Card selection updates selectedCards and communityCards
- Stage progresses based on community card count
- Calculation triggers update calculationResults
- Errors clear on valid state changes

## Derived Data

### Deck Management
**Purpose**: Track available cards and prevent duplicates

```typescript
interface DeckState {
  availableCards: Card[]; // Cards not yet selected
  usedCards: Card[]; // Cards in play
  totalCards: 52; // Constant
}
```

### Cache Management  
**Purpose**: Store recent calculations for performance

```typescript
interface CalculationCache {
  key: string; // Hash of game state
  result: CalculationResults;
  accessCount: number;
  lastAccessed: number;
}
```

## Data Flow Architecture

### Input Flow
1. User selects card → Update selectedCards
2. Validate card selection → Check for duplicates
3. Update game stage → Based on community card count
4. Trigger calculation → If valid state exists

### Calculation Flow  
1. Extract current game state → Cards + stage
2. Check cache → Recent calculations
3. Choose algorithm → Based on performance requirements
4. Execute calculation → Lookup/Simulation/Exact
5. Store results → Update calculationResults + cache

### Output Flow
1. Format probabilities → Based on display preferences
2. Update UI state → Trigger re-render
3. Handle errors → Display user-friendly messages
4. Log performance → For monitoring

## Validation Strategy

### Input Validation
- Card uniqueness across all selections
- Valid poker combinations only
- Game stage consistency with card count

### Calculation Validation  
- Probability totals within acceptable bounds
- Performance benchmarks met
- Result consistency across methods

### State Validation
- Immutable state updates
- No circular references  
- Proper TypeScript type checking

## Performance Considerations

### Memory Management
- Efficient card representation (52 total objects)
- LRU cache for calculation results
- Garbage collection friendly state updates

### Calculation Optimization
- Pre-computed lookup tables loaded at startup
- Web Worker isolation for heavy calculations  
- Incremental updates when cards added

### Render Optimization
- Memoized components for stable references
- Selective state subscriptions
- Optimized dependency arrays for useEffect

## Error Handling

### Domain Errors
```typescript
enum PokerError {
  INVALID_CARD = 'Invalid card selection',
  DUPLICATE_CARD = 'Card already selected', 
  INVALID_STAGE = 'Invalid game stage transition',
  CALCULATION_FAILED = 'Probability calculation failed',
  PERFORMANCE_TIMEOUT = 'Calculation exceeded time limit'
}
```

### Recovery Strategies
- Reset to valid state on errors
- Graceful degradation for calculation failures  
- User feedback for all error conditions
- Automatic retry for transient failures

## Testing Data Requirements

### Test Fixtures
- Complete deck of 52 cards
- Known probability scenarios for each stage
- Invalid input combinations
- Edge cases (identical cards, impossible hands)

### Performance Benchmarks
- Calculation time limits per method
- Memory usage constraints
- UI responsiveness thresholds
- Cache hit rate targets

This data model provides type safety, clear validation rules, and efficient state management for the Texas Hold'em poker calculator while supporting all functional requirements from the specification.
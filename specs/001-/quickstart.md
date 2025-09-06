# Quickstart Guide: Texas Hold'em Poker Calculator

**Date**: 2025-09-06  
**Status**: Complete  
**Phase**: 1 - Development Setup & Validation

## Prerequisites

### System Requirements
- Node.js 18.0+ with npm 9.0+
- Git 2.30+
- Modern web browser (Chrome 90+, Firefox 90+, Safari 14+)
- VSCode or similar IDE with TypeScript support

### Recommended Extensions
- ES7+ React/Redux/React-Native snippets
- TypeScript Importer
- Tailwind CSS IntelliSense
- Jest Runner
- Git Lens

## Project Setup

### 1. Initialize Project Structure
```bash
# Create main project
npm create vite@latest poker-calculator -- --template react-ts
cd poker-calculator

# Install core dependencies
npm install zustand @types/react @types/react-dom

# Install development dependencies  
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event
npm install --save-dev tailwindcss postcss autoprefixer
npm install --save-dev @types/jest jest-environment-jsdom

# Initialize Tailwind CSS
npx tailwindcss init -p
```

### 2. Configure Tailwind CSS
Update `tailwind.config.js`:
```javascript
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        'poker-green': '#0F5132',
        'poker-felt': '#1B5E20', 
        'card-red': '#DC2626',
        'card-black': '#1F2937'
      }
    }
  },
  plugins: []
}
```

### 3. Set Up Testing Configuration
Create `jest.config.js`:
```javascript
export default {
  preset: '@testing-library/jest-dom',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/main.tsx',
    '!src/vite-env.d.ts'
  ]
};
```

Create `src/setupTests.ts`:
```typescript
import '@testing-library/jest-dom';
```

### 4. Initialize Library Structure
```bash
# Create library directories
mkdir -p src/lib/poker-engine/{src,tests,cli}
mkdir -p src/lib/card-utils/{src,tests,cli}

# Create main source directories
mkdir -p src/{components,hooks,types,utils,store}
mkdir -p src/components/{Calculator,Cards,UI}
```

## Core Libraries Development

### 1. Card Utils Library (TDD First)
Create failing tests first (`src/lib/card-utils/tests/card-utils.test.ts`):
```typescript
import { describe, test, expect } from 'vitest';
import { createCard, createDeck, validateCards } from '../src/card-utils';

describe('Card Utils Library', () => {
  test('createCard should create valid card object', () => {
    const card = createCard('hearts', 'A');
    
    expect(card).toEqual({
      suit: 'hearts',
      rank: 'A', 
      value: 14,
      display: 'A♥',
      id: 'AH'
    });
  });

  test('createDeck should create 52 unique cards', () => {
    const deck = createDeck();
    
    expect(deck.availableCards).toHaveLength(52);
    expect(deck.usedCards).toHaveLength(0);
    expect(deck.totalCards).toBe(52);
    
    // Verify uniqueness
    const ids = deck.availableCards.map(card => card.id);
    expect(new Set(ids)).toHaveLength(52);
  });

  test('validateCards should detect duplicate cards', () => {
    const duplicateCards = [
      createCard('hearts', 'A'),
      createCard('hearts', 'A')
    ];
    
    const result = validateCards(duplicateCards);
    
    expect(result.isValid).toBe(false);
    expect(result.errors[0].code).toBe('DUPLICATE_CARD');
  });
});
```

### 2. Poker Engine Library (TDD First)  
Create failing tests first (`src/lib/poker-engine/tests/poker-engine.test.ts`):
```typescript
import { describe, test, expect } from 'vitest';
import { calculateProbabilities, evaluateHand } from '../src/poker-engine';
import { createCard } from '../../card-utils/src/card-utils';

describe('Poker Engine Library', () => {
  test('calculateProbabilities should return valid probability results', () => {
    const playerHand = [
      createCard('spades', 'A'),
      createCard('hearts', 'A')
    ];
    const communityCards = [];
    const stage = 'pre-flop';
    
    const results = calculateProbabilities({
      playerHand,
      communityCards,
      stage,
      preferredMethod: 'lookup'
    });
    
    expect(results.stage).toBe('pre-flop');
    expect(results.probabilities).toHaveLength(10); // All hand types
    expect(results.calculationTime).toBeLessThan(100); // Performance requirement
    expect(results.method).toBe('lookup');
    
    // Verify probabilities sum to ~1.0 (allowing for rounding)
    const total = results.probabilities.reduce((sum, p) => sum + p.probability, 0);
    expect(total).toBeCloseTo(1.0, 2);
  });

  test('evaluateHand should identify best 5-card hand', () => {
    const cards = [
      createCard('spades', 'A'),
      createCard('hearts', 'A'),
      createCard('clubs', 'A'), 
      createCard('diamonds', 'K'),
      createCard('spades', 'K'),
      createCard('hearts', '2'),
      createCard('clubs', '7')
    ];
    
    const result = evaluateHand({ cards });
    
    expect(result.handStrength).toBe(6); // FULL_HOUSE
    expect(result.bestHand).toHaveLength(5);
    expect(result.description).toContain('Full House');
  });
});
```

## React Application Development

### 1. State Management Setup
Create `src/store/calculatorStore.ts`:
```typescript
import { create } from 'zustand';
import type { CalculatorState, Card, GameStage, CalculationResults } from '../types/poker';

interface CalculatorStore extends CalculatorState {
  actions: {
    selectCard: (card: Card, slot: string) => void;
    clearCards: () => void;
    calculateProbabilities: () => Promise<void>;
    setStage: (stage: GameStage) => void;
  };
}

export const useCalculatorStore = create<CalculatorStore>((set, get) => ({
  // Initial state
  selectedCards: [],
  communityCards: { flop: [], turn: null, river: null, allCards: [], stage: 'pre-flop' },
  currentStage: 'pre-flop',
  isCalculating: false,
  calculationResults: null,
  error: null,
  selectedCardSlot: null,
  showProbabilities: true,
  calculationMethod: 'auto',
  displayFormat: 'percentage',
  
  actions: {
    selectCard: (card, slot) => {
      // Implementation to be written after tests
    },
    clearCards: () => {
      // Implementation to be written after tests  
    },
    calculateProbabilities: async () => {
      // Implementation to be written after tests
    },
    setStage: (stage) => {
      // Implementation to be written after tests
    }
  }
}));
```

### 2. Component Structure (Test-First)
Create `src/components/Calculator/PokerCalculator.test.tsx`:
```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PokerCalculator } from './PokerCalculator';

describe('PokerCalculator Component', () => {
  test('displays hole card selection initially', () => {
    render(<PokerCalculator />);
    
    expect(screen.getByText(/select your hole cards/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /hole card 1/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /hole card 2/i })).toBeInTheDocument();
  });

  test('shows probability calculations after selecting cards', async () => {
    const user = userEvent.setup();
    render(<PokerCalculator />);
    
    // Select first hole card
    await user.click(screen.getByRole('button', { name: /hole card 1/i }));
    await user.click(screen.getByRole('button', { name: /ace of spades/i }));
    
    // Select second hole card  
    await user.click(screen.getByRole('button', { name: /hole card 2/i }));
    await user.click(screen.getByRole('button', { name: /ace of hearts/i }));
    
    // Verify probability display appears
    await waitFor(() => {
      expect(screen.getByText(/win probability/i)).toBeInTheDocument();
    });
    
    // Verify specific hand probabilities are shown
    expect(screen.getByText(/pair/i)).toBeInTheDocument();
    expect(screen.getByText(/two pair/i)).toBeInTheDocument();
  });

  test('prevents duplicate card selection', async () => {
    const user = userEvent.setup();
    render(<PokerCalculator />);
    
    // Select same card twice
    await user.click(screen.getByRole('button', { name: /hole card 1/i }));
    await user.click(screen.getByRole('button', { name: /ace of spades/i }));
    
    await user.click(screen.getByRole('button', { name: /hole card 2/i }));
    await user.click(screen.getByRole('button', { name: /ace of spades/i }));
    
    // Should show error message
    expect(screen.getByText(/card already selected/i)).toBeInTheDocument();
  });
});
```

## Development Workflow

### 1. TDD Process (Constitutional Requirement)
```bash
# 1. Write failing test
npm test -- --watch

# 2. Run test to confirm it fails (RED)
npm test src/lib/card-utils/tests/card-utils.test.ts

# 3. Implement minimal code to make test pass (GREEN)
# Edit src/lib/card-utils/src/card-utils.ts

# 4. Refactor while keeping tests green (REFACTOR)
npm test -- --coverage

# 5. Commit with test-first structure
git add -A
git commit -m "Add card creation with failing tests

Tests cover:
- Card object creation and validation
- Deck initialization and uniqueness  
- Duplicate card detection

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

### 2. Library CLI Development
Create CLIs for each library:

`src/lib/poker-engine/cli/poker-engine-cli.ts`:
```typescript
#!/usr/bin/env node

import { Command } from 'commander';
import { calculateProbabilities } from '../src/poker-engine';

const program = new Command();

program
  .name('poker-engine')
  .description('Texas Hold\'em probability calculation engine')
  .version('1.0.0');

program
  .command('calculate')
  .description('Calculate hand probabilities')
  .option('--cards <cards>', 'Player cards (e.g., "AS,AH")')
  .option('--community <cards>', 'Community cards (e.g., "KS,QH,JD")')
  .option('--stage <stage>', 'Game stage', 'pre-flop')
  .option('--method <method>', 'Calculation method', 'auto')
  .action(async (options) => {
    // Implementation after tests written
  });

program.parse();
```

### 3. Performance Validation
Create performance tests:
```typescript
describe('Performance Requirements', () => {
  test('calculations should complete within 100ms', async () => {
    const startTime = performance.now();
    
    await calculateProbabilities({
      playerHand: [createCard('spades', 'A'), createCard('hearts', 'A')],
      communityCards: [],
      stage: 'pre-flop'
    });
    
    const endTime = performance.now();
    expect(endTime - startTime).toBeLessThan(100);
  });
});
```

## User Story Validation

### Acceptance Test Scenarios
Run these integration tests to validate requirements:

1. **Pre-flop Probability Display**
   ```bash
   npm test -- acceptance/preflop.test.ts
   ```

2. **Community Card Progression**
   ```bash
   npm test -- acceptance/community-cards.test.ts
   ```

3. **Error Handling**
   ```bash
   npm test -- acceptance/error-handling.test.ts  
   ```

## Launch Application

### Development Server
```bash
# Start development server
npm run dev

# Run tests in watch mode (separate terminal)
npm test -- --watch

# Run specific test suites
npm test -- poker-engine
npm test -- card-utils
npm test -- components
```

### Production Build
```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Run full test suite with coverage
npm test -- --coverage --run
```

## Validation Checklist

- [ ] Card Utils library tests pass (RED-GREEN-Refactor demonstrated)
- [ ] Poker Engine library tests pass (RED-GREEN-Refactor demonstrated)  
- [ ] React components render without errors
- [ ] Probability calculations complete within 100ms
- [ ] Duplicate card validation works
- [ ] All user acceptance scenarios pass
- [ ] Performance benchmarks met
- [ ] TypeScript compilation succeeds with no errors
- [ ] Production build completes successfully

## Next Steps

After quickstart validation:
1. Run `/tasks` command to generate detailed implementation tasks
2. Begin TDD implementation cycle for core libraries
3. Implement React components following user stories
4. Add comprehensive integration tests
5. Performance optimization and caching
6. UI polish and responsive design

## Troubleshooting

### Common Issues
- **Vite build errors**: Check TypeScript configuration and import paths
- **Test failures**: Ensure all imports use relative paths to libraries
- **Performance issues**: Verify Web Workers are properly configured
- **CSS not loading**: Check Tailwind PostCSS configuration

### Performance Debugging
```bash
# Monitor build performance
npm run build -- --profile

# Analyze bundle size
npm install --save-dev @rollup/plugin-analyzer
```

This quickstart guide ensures constitutional compliance with TDD requirements and provides a complete development environment for the poker calculator implementation.
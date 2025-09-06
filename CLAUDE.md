# poker-calculator Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-09-06

## Active Technologies
- React.js 18+ + TypeScript 5+ (001- Texas Hold'em Calculator)
- Vite build tool with Tailwind CSS
- Zustand for state management
- pokersolver library for hand evaluation
- Jest + React Testing Library for testing

## Project Structure
```
src/
├── lib/
│   ├── poker-engine/     # Probability calculation library
│   └── card-utils/       # Card validation and utilities
├── components/
│   ├── Calculator/       # Main calculator interface
│   ├── Cards/           # Card display components
│   └── UI/              # Reusable UI components
├── hooks/               # Custom React hooks
├── store/              # Zustand state management
└── types/              # TypeScript type definitions
tests/
├── contract/           # Contract tests for libraries
├── integration/        # Component integration tests
└── unit/              # Unit tests
```

## Commands
# Library CLIs
poker-engine --calculate --cards="AS,AH" --stage="pre-flop"
card-utils --validate --cards="AS,AH,KS"

# Development
npm run dev          # Start development server
npm test             # Run test suite with watch mode
npm run build        # Production build
npm test -- --coverage  # Test coverage report

## Code Style
TypeScript: Strict type checking enabled with discriminated unions
React: Functional components with hooks, custom hooks for logic separation
Testing: TDD with RED-GREEN-Refactor cycle (constitutional requirement)
State: Zustand store with actions pattern, no direct state mutations

## Recent Changes
- 001-: Added Texas Hold'em probability calculator with React.js + TypeScript stack

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
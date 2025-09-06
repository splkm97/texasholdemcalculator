# Tasks: Texas Hold'em Poker Hand Probability Calculator

**Input**: Design documents from `/specs/001-/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → Tech stack: React.js 18+ + TypeScript 5+ + Vite
   → Libraries: poker-engine, card-utils
   → Structure: Single frontend project (src/, tests/)
2. Load optional design documents:
   → data-model.md: Extract entities → model tasks
   → contracts/: poker-engine.json, card-utils.json → contract test tasks
   → research.md: Extract decisions → setup tasks
3. Generate tasks by category:
   → Setup: Vite project init, dependencies, TypeScript/Tailwind
   → Tests: contract tests, integration tests, component tests
   → Core: TypeScript models, React components, library implementations
   → Integration: state management, Web Workers, performance optimization
   → Polish: unit tests, error handling, documentation
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validation: All contracts have tests, all entities have models, all components tested
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Single project**: `src/`, `tests/` at repository root
- Libraries in `src/lib/poker-engine/` and `src/lib/card-utils/`
- React components in `src/components/`

## Phase 3.1: Setup
- [ ] T001 Create Vite React TypeScript project structure with src/, tests/, and lib/ directories
- [ ] T002 Install dependencies: React 18+, TypeScript 5+, Zustand, Tailwind CSS, Testing Library, pokersolver
- [ ] T003 [P] Configure TypeScript strict mode in tsconfig.json
- [ ] T004 [P] Configure Tailwind CSS with poker-themed colors in tailwind.config.js
- [ ] T005 [P] Configure Jest and Vitest for testing in jest.config.js and vite.config.ts
- [ ] T006 [P] Configure ESLint and Prettier for code quality

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

### Contract Tests for Libraries
- [ ] T007 [P] Contract test poker-engine calculateProbabilities in tests/contract/poker-engine.test.ts
- [ ] T008 [P] Contract test poker-engine evaluateHand in tests/contract/poker-engine.test.ts  
- [ ] T009 [P] Contract test card-utils createCard in tests/contract/card-utils.test.ts
- [ ] T010 [P] Contract test card-utils validateCards in tests/contract/card-utils.test.ts
- [ ] T011 [P] Contract test card-utils createDeck in tests/contract/card-utils.test.ts

### Component Integration Tests
- [ ] T012 [P] Integration test card selection flow in tests/integration/card-selection.test.tsx
- [ ] T013 [P] Integration test probability calculation display in tests/integration/probability-display.test.tsx
- [ ] T014 [P] Integration test game stage progression in tests/integration/game-stages.test.tsx
- [ ] T015 [P] Integration test error handling and validation in tests/integration/error-handling.test.tsx
- [ ] T016 [P] Integration test performance requirements (<100ms) in tests/integration/performance.test.ts

## Phase 3.3: Core Implementation (ONLY after tests are failing)

### TypeScript Domain Models
- [ ] T017 [P] Card interface and types in src/types/card.ts
- [ ] T018 [P] Poker hand types and enums in src/types/poker.ts
- [ ] T019 [P] Game state interfaces in src/types/game.ts
- [ ] T020 [P] Calculator state interface in src/types/calculator.ts

### Core Libraries (TDD - tests first)
- [ ] T021 [P] Card utilities library implementation in src/lib/card-utils/src/card-utils.ts
- [ ] T022 [P] Card validation functions in src/lib/card-utils/src/validation.ts
- [ ] T023 [P] Deck management utilities in src/lib/card-utils/src/deck.ts
- [ ] T024 Poker engine probability calculations in src/lib/poker-engine/src/probability.ts
- [ ] T025 Poker engine hand evaluation in src/lib/poker-engine/src/evaluation.ts
- [ ] T026 Poker engine lookup tables in src/lib/poker-engine/src/lookup-tables.ts

### CLI Interfaces for Libraries
- [ ] T027 [P] Card utils CLI in src/lib/card-utils/cli/card-utils-cli.ts
- [ ] T028 [P] Poker engine CLI in src/lib/poker-engine/cli/poker-engine-cli.ts

### React Components
- [ ] T029 [P] Card component in src/components/Cards/Card.tsx
- [ ] T030 [P] Card selector component in src/components/Cards/CardSelector.tsx
- [ ] T031 [P] Hand display component in src/components/Cards/Hand.tsx
- [ ] T032 [P] Probability results display in src/components/Calculator/ProbabilityDisplay.tsx
- [ ] T033 [P] Game stage indicator in src/components/Calculator/GameStageIndicator.tsx
- [ ] T034 Main poker calculator component in src/components/Calculator/PokerCalculator.tsx
- [ ] T035 [P] Reset/clear functionality in src/components/UI/ResetButton.tsx
- [ ] T036 [P] Loading spinner component in src/components/UI/LoadingSpinner.tsx

### Custom React Hooks
- [ ] T037 [P] useCardSelection hook in src/hooks/useCardSelection.ts
- [ ] T038 [P] useProbabilityCalculation hook in src/hooks/useProbabilityCalculation.ts
- [ ] T039 [P] useGameState hook in src/hooks/useGameState.ts

## Phase 3.4: Integration

### State Management
- [ ] T040 Calculator Zustand store in src/store/calculatorStore.ts
- [ ] T041 [P] Web Worker for heavy calculations in src/workers/calculationWorker.ts
- [ ] T042 [P] Performance monitoring utilities in src/utils/performance.ts

### Application Setup
- [ ] T043 Main App component integration in src/App.tsx
- [ ] T044 [P] Global CSS with Tailwind utilities in src/index.css
- [ ] T045 React root setup in src/main.tsx

### Error Handling & Validation
- [ ] T046 [P] Input validation utilities in src/utils/validation.ts
- [ ] T047 [P] Error handling middleware in src/utils/errorHandling.ts
- [ ] T048 [P] Logging utilities for debugging in src/utils/logging.ts

## Phase 3.5: Polish

### Unit Tests
- [ ] T049 [P] Unit tests for card utilities in tests/unit/card-utils.test.ts
- [ ] T050 [P] Unit tests for poker calculations in tests/unit/poker-engine.test.ts
- [ ] T051 [P] Unit tests for state management in tests/unit/calculatorStore.test.ts
- [ ] T052 [P] Unit tests for custom hooks in tests/unit/hooks.test.ts

### Performance & Optimization
- [ ] T053 Performance optimization and caching in existing files
- [ ] T054 [P] Bundle size analysis and optimization
- [ ] T055 [P] Accessibility testing and ARIA labels
- [ ] T056 [P] Mobile responsive design testing

### Documentation & Final Polish
- [ ] T057 [P] Update README.md with usage instructions
- [ ] T058 [P] Create library documentation in llms.txt format
- [ ] T059 [P] Add inline code documentation and JSDoc comments
- [ ] T060 Final integration testing and bug fixes

## Dependencies
- Setup (T001-T006) before all other phases
- Tests (T007-T016) before implementation (T017-T048)
- Types (T017-T020) before libraries and components (T021-T036)
- Libraries (T021-T028) before React components (T029-T036)
- Components before integration (T040-T048)
- Core implementation before polish (T049-T060)

### Specific Dependencies
- T021-T023 (card-utils) blocks T029-T031 (card components)
- T024-T026 (poker-engine) blocks T032, T038 (probability components)
- T017-T020 (types) blocks all implementation tasks
- T040 (store) blocks T043 (App integration)
- T041 (Web Worker) blocks T042 (performance)

## Parallel Example
```
# Launch setup tasks together (T003-T006):
Task: "Configure TypeScript strict mode in tsconfig.json"
Task: "Configure Tailwind CSS with poker-themed colors in tailwind.config.js" 
Task: "Configure Jest and Vitest for testing in jest.config.js and vite.config.ts"
Task: "Configure ESLint and Prettier for code quality"

# Launch contract tests together (T007-T011):
Task: "Contract test poker-engine calculateProbabilities in tests/contract/poker-engine.test.ts"
Task: "Contract test poker-engine evaluateHand in tests/contract/poker-engine.test.ts"
Task: "Contract test card-utils createCard in tests/contract/card-utils.test.ts"
Task: "Contract test card-utils validateCards in tests/contract/card-utils.test.ts"
Task: "Contract test card-utils createDeck in tests/contract/card-utils.test.ts"

# Launch type definitions together (T017-T020):
Task: "Card interface and types in src/types/card.ts"
Task: "Poker hand types and enums in src/types/poker.ts"  
Task: "Game state interfaces in src/types/game.ts"
Task: "Calculator state interface in src/types/calculator.ts"
```

## Notes
- [P] tasks = different files, no dependencies
- Verify tests fail before implementing (TDD requirement)
- Commit after each task with constitutional format
- Each library must have CLI interface (constitutional requirement)
- Performance target: <100ms calculation time
- All components must be tested before implementation

## Task Generation Rules
*Applied during main() execution*

1. **From Contracts**:
   - poker-engine.json → T007, T008 (contract tests) + T024-T026 (implementation)
   - card-utils.json → T009-T011 (contract tests) + T021-T023 (implementation)
   
2. **From Data Model**:
   - Card entity → T017, T021, T029-T031
   - Poker Hand entity → T018, T024-T025, T032
   - Game Stage entity → T019, T033, T039
   - Calculator State entity → T020, T040, T043
   
3. **From User Stories** (quickstart.md):
   - Card selection → T012, T030, T037
   - Probability display → T013, T032, T038
   - Game progression → T014, T033, T039
   - Error handling → T015, T046-T048

4. **Ordering**:
   - Setup → Tests → Types → Libraries → Components → Integration → Polish
   - TDD: All tests before corresponding implementation
   - Constitutional: Libraries before applications

## Validation Checklist
*GATE: Checked by main() before returning*

- [x] All contracts have corresponding tests (T007-T011)
- [x] All entities have model tasks (T017-T020)
- [x] All tests come before implementation (phases 3.2 before 3.3)
- [x] Parallel tasks truly independent (different files)
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task
- [x] Libraries have CLI interfaces (T027-T028)
- [x] Performance requirements addressed (T016, T053-T054)
- [x] Constitutional TDD requirements followed
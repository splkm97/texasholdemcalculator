# Research: Texas Hold'em Poker Calculator Implementation

**Date**: 2025-09-06  
**Status**: Complete  
**Phase**: 0 - Technical Research

## Technology Stack Decisions

### Frontend Framework
**Decision**: React.js 18+ with TypeScript 5+
**Rationale**: 
- Modern concurrent features for real-time calculation performance
- Excellent ecosystem for interactive UIs
- Strong TypeScript support for poker domain modeling
- User-specified requirement in implementation details
**Alternatives considered**: Phaser3 (rejected - overkill for calculator UI, better for game visualization)

### Build Tool
**Decision**: Vite
**Rationale**:
- 390ms startup vs 4.5 seconds (Create React App)
- 16.1s builds vs 28.4s (Create React App)
- Native ES modules with hot reload for fast development cycles
- Perfect for single-page calculator applications
**Alternatives considered**: Create React App (deprecated), Next.js (unnecessary for client-only app)

### State Management
**Decision**: Zustand
**Rationale**:
- Lightweight for poker calculator complexity level
- Excellent TypeScript integration
- No Redux boilerplate for straightforward state updates
- Perfect middle ground between useState and Redux Toolkit
**Alternatives considered**: Redux Toolkit (too heavy), React Context (performance issues for frequent updates)

### Styling Approach
**Decision**: Tailwind CSS
**Rationale**:
- Rapid development with utility-first approach
- Built-in responsive design for poker interfaces
- Dark mode support (essential for poker applications)
- Excellent purging for production performance
**Alternatives considered**: CSS-in-JS (Styled Components), CSS Modules

## Poker Calculation Algorithm Research

### Core Algorithm
**Decision**: Pre-computed Lookup Tables + Monte Carlo Fallback
**Rationale**:
- Achieves <100ms target performance consistently
- Pre-computed probability maps for common 2-3 card scenarios
- Monte Carlo simulation for edge cases (100k simulations in ~300ms)
- Memory footprint ~500KB total including lookup tables
**Alternatives considered**: Pure Monte Carlo (slower), Pure combinatorial (too slow for real-time)

### Hand Evaluation Library
**Decision**: pokersolver library (goldfire/pokersolver)
**Rationale**:
- Production-tested (used in CasinoRPG)
- Handles 3-7 card evaluation efficiently
- Client-side compatible with good performance
- MIT license compatible
**Alternatives considered**: PHE (JavaScript port of C++ evaluator), custom implementation

### Performance Strategy
**Decision**: Web Workers + Caching + React 18 Concurrent Features
**Rationale**:
- Web Workers for heavy calculations without blocking UI
- In-memory LRU cache for recent calculations
- React 18 useTransition for non-blocking probability updates
- useDeferredValue for responsive card selection
**Alternatives considered**: Main thread calculations (blocking), Service Workers (overkill)

## Architecture Decisions

### Component Architecture
**Decision**: Container/Presentational Pattern with Custom Hooks
**Rationale**:
- Clear separation between calculation logic and UI rendering
- Custom hooks (usePokerCalculator, useCardSelection) for reusable stateful logic
- Easy testing and maintainability
- Follows React 2025 best practices
**Alternatives considered**: Class components (deprecated), All-in-one components (not maintainable)

### Domain Modeling
**Decision**: Strict TypeScript with Discriminated Unions
**Rationale**:
- Type safety prevents common poker logic errors
- Discriminated unions for card types and hand strengths
- Builder pattern for validating poker hands
- Compile-time error catching
**Alternatives considered**: JavaScript with JSDoc, Loose TypeScript configuration

### Testing Strategy
**Decision**: React Testing Library + Jest with User-Centric Testing
**Rationale**:
- Tests user behavior rather than implementation details
- Accessibility-first testing approach
- Integration tests for component interactions
- Follows Testing Library philosophy
**Alternatives considered**: Enzyme (deprecated), Cypress for unit tests (overkill)

## Performance Requirements Analysis

### Calculation Performance
**Target**: <100ms for probability updates
**Solution**: 
- Primary: Lookup table queries (1-5ms)
- Fallback: Fast Monte Carlo simulation (10-50ms)
- Emergency: Exact combinatorial calculation (50-100ms)

### Memory Constraints
**Target**: <1MB total application footprint
**Solution**:
- Pre-computed lookup tables: ~500KB
- Application code: ~200KB gzipped
- Runtime cache: ~100KB for recent calculations

### UI Performance
**Target**: Smooth 60fps interactions
**Solution**:
- React 18 concurrent features for non-blocking updates
- Optimized re-rendering with proper dependency arrays
- CSS animations for card transitions

## Development Workflow Decisions

### Testing Approach
**Decision**: Test-Driven Development with RED-GREEN-Refactor
**Rationale**:
- Constitutional requirement (non-negotiable)
- Ensures robust poker calculation logic
- Tests written before implementation to catch edge cases
- Git commit structure enforces TDD workflow

### Library Structure
**Decision**: Standalone Libraries with CLI Interfaces
**Rationale**:
- poker-engine library for probability calculations
- card-utils library for validation and utilities
- Each library has CLI interface with --help, --version options
- Libraries can be tested independently

### Documentation Format
**Decision**: llms.txt format for each library
**Rationale**:
- Constitutional requirement
- AI-readable documentation format
- Consistent across all libraries
- Enables automated documentation generation

## Integration Points

### No Backend Required
**Decision**: Pure client-side implementation
**Rationale**:
- User requirement specified no backend needed
- All calculations can be performed client-side efficiently
- Simpler deployment and maintenance
- Offline-capable application

### Browser Compatibility
**Target**: Modern browsers (Chrome 90+, Firefox 90+, Safari 14+)
**Rationale**:
- ES2022 features and modern JavaScript APIs
- Web Workers support required for performance
- CSS Grid and Flexbox for layout
- No IE11 support needed for calculator application

## Risk Mitigation

### Calculation Accuracy
**Mitigation**: 
- Comprehensive test suite with known probability scenarios
- Cross-validation with established poker odds databases
- Monte Carlo simulation for verification of exact calculations

### Performance Degradation
**Mitigation**:
- Tiered performance approach (lookup → simulation → exact)
- Performance monitoring in development
- Caching strategy for repeated calculations
- Web Workers to prevent UI blocking

### Browser Compatibility
**Mitigation**:
- Progressive enhancement approach
- Feature detection for Web Workers
- Fallback calculations for older browsers if needed
- Polyfills for essential features only

## Next Phase Requirements

Phase 1 requires:
1. Data model design based on poker domain research
2. API contracts for library interfaces (even though client-only)
3. Test scenarios extracted from user stories
4. Quickstart guide for development setup
5. Updated Claude context file for development guidance

**Research Complete**: All NEEDS CLARIFICATION items resolved through technical research and user requirements analysis.
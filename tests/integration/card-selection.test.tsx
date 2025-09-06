import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, test, expect } from 'vitest'
import { PokerCalculator } from '../../src/components/Calculator/PokerCalculator'

describe('Card Selection Integration Tests', () => {
  test('should display hole card selection initially', () => {
    render(<PokerCalculator />)
    
    expect(screen.getByText(/select your hole cards/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /hole card 1/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /hole card 2/i })).toBeInTheDocument()
  })

  test('should show card selection grid when hole card slot clicked', async () => {
    const user = userEvent.setup()
    render(<PokerCalculator />)
    
    await user.click(screen.getByRole('button', { name: /hole card 1/i }))
    
    // Should show all 52 cards in selection grid
    expect(screen.getByText(/select card for hole card 1/i)).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /^[AKQJ2-9]|10[♠♥♦♣]$/})).toHaveLength(52)
  })

  test('should select card and show it in hole card slot', async () => {
    const user = userEvent.setup()
    render(<PokerCalculator />)
    
    // Select first hole card
    await user.click(screen.getByRole('button', { name: /hole card 1/i }))
    await user.click(screen.getByRole('button', { name: /A♠/i }))
    
    // Verify card is selected and displayed - look for aria-label instead of text content
    expect(screen.getByRole('button', { name: /A♠/i })).toBeInTheDocument()
    expect(screen.queryByText(/select card for hole card 1/i)).not.toBeInTheDocument()
  })

  test('should prevent duplicate card selection', async () => {
    const user = userEvent.setup()
    render(<PokerCalculator />)
    
    // Select first card
    await user.click(screen.getByRole('button', { name: /hole card 1/i }))
    
    // Count how many A♠ buttons are available before selection
    const beforeSelection = screen.getAllByRole('button', { name: /A♠/i })
    expect(beforeSelection).toHaveLength(1) // Should be only 1 in card grid
    
    await user.click(screen.getByRole('button', { name: /A♠/i }))
    
    // Now A♠ should be in hole card 1, try to select hole card 2
    await user.click(screen.getByRole('button', { name: /hole card 2/i }))
    
    // A♠ should not be in the card selector anymore (only in hole card 1)
    const afterSelection = screen.getAllByRole('button', { name: /A♠/i })
    expect(afterSelection).toHaveLength(1) // Should be only the one in hole card 1
    
    // And the one that exists should be the hole card (not in selector)
    expect(screen.getByRole('button', { name: /A♠/i })).not.toHaveClass('card-luxury')
  })

  test('should allow community card selection after hole cards', async () => {
    const user = userEvent.setup()
    render(<PokerCalculator />)
    
    // Select both hole cards
    await user.click(screen.getByRole('button', { name: /hole card 1/i }))
    await user.click(screen.getByRole('button', { name: /A♠/i }))
    
    await user.click(screen.getByRole('button', { name: /hole card 2/i }))
    await user.click(screen.getByRole('button', { name: /A♥/i }))
    
    // Community card buttons should now be enabled
    expect(screen.getByRole('button', { name: /flop card 1/i })).toBeEnabled()
    expect(screen.getByRole('button', { name: /flop card 2/i })).toBeEnabled()
    expect(screen.getByRole('button', { name: /flop card 3/i })).toBeEnabled()
  })

  test('should progress through game stages correctly', async () => {
    const user = userEvent.setup()
    render(<PokerCalculator />)
    
    // Select hole cards
    await user.click(screen.getByRole('button', { name: /hole card 1/i }))
    await user.click(screen.getByRole('button', { name: /A♠/i }))
    await user.click(screen.getByRole('button', { name: /hole card 2/i }))
    await user.click(screen.getByRole('button', { name: /A♥/i }))
    
    expect(screen.getByText(/stage: pre-flop/i)).toBeInTheDocument()
    
    // Select flop cards
    await user.click(screen.getByRole('button', { name: /flop card 1/i }))
    await user.click(screen.getByRole('button', { name: /K♠/i }))
    await user.click(screen.getByRole('button', { name: /flop card 2/i }))
    await user.click(screen.getByRole('button', { name: /Q♥/i }))
    await user.click(screen.getByRole('button', { name: /flop card 3/i }))
    await user.click(screen.getByRole('button', { name: /J♦/i }))
    
    expect(screen.getByText(/stage: flop/i)).toBeInTheDocument()
    
    // Turn card should now be enabled
    expect(screen.getByRole('button', { name: /turn card/i })).toBeEnabled()
  })

  test('should clear all cards when reset button clicked', async () => {
    const user = userEvent.setup()
    render(<PokerCalculator />)
    
    // Select some cards
    await user.click(screen.getByRole('button', { name: /hole card 1/i }))
    await user.click(screen.getByRole('button', { name: /A♠/i }))
    
    // Click reset
    await user.click(screen.getByRole('button', { name: /reset/i }))
    
    // Should return to initial state
    expect(screen.getByRole('button', { name: /hole card 1/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /A♠/i })).not.toBeInTheDocument()
    expect(screen.getByText(/stage: pre-flop/i)).toBeInTheDocument()
  })
})
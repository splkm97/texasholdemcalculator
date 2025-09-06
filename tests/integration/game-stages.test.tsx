import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, test, expect } from 'vitest'
import { PokerCalculator } from '../../src/components/Calculator/PokerCalculator'

describe('Game Stage Progression Integration Tests', () => {
  test('should start in pre-flop stage', () => {
    render(<PokerCalculator />)
    
    expect(screen.getByText(/stage: pre-flop/i)).toBeInTheDocument()
    expect(screen.getByText(/cards known: 0/i)).toBeInTheDocument()
  })

  test('should progress to flop stage after selecting 3 community cards', async () => {
    const user = userEvent.setup()
    render(<PokerCalculator />)
    
    // Select hole cards first
    await user.click(screen.getByRole('button', { name: /hole card 1/i }))
    await user.click(screen.getByRole('button', { name: /A♠/i }))
    await user.click(screen.getByRole('button', { name: /hole card 2/i }))
    await user.click(screen.getByRole('button', { name: /K♠/i }))
    
    // Select flop cards
    await user.click(screen.getByRole('button', { name: /flop card 1/i }))
    await user.click(screen.getByRole('button', { name: /Q♠/i }))
    await user.click(screen.getByRole('button', { name: /flop card 2/i }))
    await user.click(screen.getByRole('button', { name: /J♠/i }))
    await user.click(screen.getByRole('button', { name: /flop card 3/i }))
    await user.click(screen.getByRole('button', { name: /10♠/i }))
    
    expect(screen.getByText(/stage: flop/i)).toBeInTheDocument()
    expect(screen.getByText(/cards known: 5/i)).toBeInTheDocument()
    
    // Turn card should be enabled
    expect(screen.getByRole('button', { name: /turn card/i })).toBeEnabled()
    expect(screen.getByRole('button', { name: /river card/i })).toBeDisabled()
  })

  test('should progress to turn stage after selecting turn card', async () => {
    const user = userEvent.setup()
    render(<PokerCalculator />)
    
    // Complete setup through flop
    await user.click(screen.getByRole('button', { name: /hole card 1/i }))
    await user.click(screen.getByRole('button', { name: /A♠/i }))
    await user.click(screen.getByRole('button', { name: /hole card 2/i }))
    await user.click(screen.getByRole('button', { name: /K♥/i }))
    
    await user.click(screen.getByRole('button', { name: /flop card 1/i }))
    await user.click(screen.getByRole('button', { name: /Q♠/i }))
    await user.click(screen.getByRole('button', { name: /flop card 2/i }))
    await user.click(screen.getByRole('button', { name: /J♠/i }))
    await user.click(screen.getByRole('button', { name: /flop card 3/i }))
    await user.click(screen.getByRole('button', { name: /10♠/i }))
    
    // Select turn card
    await user.click(screen.getByRole('button', { name: /turn card/i }))
    await user.click(screen.getByRole('button', { name: /9♠/i }))
    
    expect(screen.getByText(/stage: turn/i)).toBeInTheDocument()
    expect(screen.getByText(/cards known: 6/i)).toBeInTheDocument()
    
    // River card should now be enabled
    expect(screen.getByRole('button', { name: /river card/i })).toBeEnabled()
  })

  test('should complete at river stage', async () => {
    const user = userEvent.setup()
    render(<PokerCalculator />)
    
    // Complete setup through turn
    await user.click(screen.getByRole('button', { name: /hole card 1/i }))
    await user.click(screen.getByRole('button', { name: /A♠/i }))
    await user.click(screen.getByRole('button', { name: /hole card 2/i }))
    await user.click(screen.getByRole('button', { name: /K♥/i }))
    
    await user.click(screen.getByRole('button', { name: /flop card 1/i }))
    await user.click(screen.getByRole('button', { name: /Q♠/i }))
    await user.click(screen.getByRole('button', { name: /flop card 2/i }))
    await user.click(screen.getByRole('button', { name: /J♠/i }))
    await user.click(screen.getByRole('button', { name: /flop card 3/i }))
    await user.click(screen.getByRole('button', { name: /10♠/i }))
    
    await user.click(screen.getByRole('button', { name: /turn card/i }))
    await user.click(screen.getByRole('button', { name: /9♠/i }))
    
    // Select river card
    await user.click(screen.getByRole('button', { name: /river card/i }))
    await user.click(screen.getByRole('button', { name: /8♠/i }))
    
    expect(screen.getByText(/stage: river/i)).toBeInTheDocument()
    expect(screen.getByText(/cards known: 7/i)).toBeInTheDocument()
    
    // Should show final hand result
    expect(screen.getByText(/final hand: straight flush/i)).toBeInTheDocument()
  })

  test('should disable community cards until hole cards selected', () => {
    render(<PokerCalculator />)
    
    // Community card buttons should be disabled
    expect(screen.getByRole('button', { name: /flop card 1/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /flop card 2/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /flop card 3/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /turn card/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /river card/i })).toBeDisabled()
  })

  test('should update remaining cards count correctly', async () => {
    const user = userEvent.setup()
    render(<PokerCalculator />)
    
    expect(screen.getByText(/remaining cards: 52/i)).toBeInTheDocument()
    
    // Select hole cards
    await user.click(screen.getByRole('button', { name: /hole card 1/i }))
    await user.click(screen.getByRole('button', { name: /A♠/i }))
    
    expect(screen.getByText(/remaining cards: 51/i)).toBeInTheDocument()
    
    await user.click(screen.getByRole('button', { name: /hole card 2/i }))
    await user.click(screen.getByRole('button', { name: /K♥/i }))
    
    expect(screen.getByText(/remaining cards: 50/i)).toBeInTheDocument()
    
    // Select flop
    await user.click(screen.getByRole('button', { name: /flop card 1/i }))
    await user.click(screen.getByRole('button', { name: /Q♠/i }))
    await user.click(screen.getByRole('button', { name: /flop card 2/i }))
    await user.click(screen.getByRole('button', { name: /J♠/i }))
    await user.click(screen.getByRole('button', { name: /flop card 3/i }))
    await user.click(screen.getByRole('button', { name: /10♠/i }))
    
    expect(screen.getByText(/remaining cards: 47/i)).toBeInTheDocument()
  })

  test('should show correct stage indicators', async () => {
    const user = userEvent.setup()
    render(<PokerCalculator />)
    
    // Pre-flop indicators
    expect(screen.getByTestId('stage-indicator-preflop')).toHaveClass('active')
    expect(screen.getByTestId('stage-indicator-flop')).toHaveClass('inactive')
    expect(screen.getByTestId('stage-indicator-turn')).toHaveClass('inactive')
    expect(screen.getByTestId('stage-indicator-river')).toHaveClass('inactive')
    
    // Complete hole cards and flop
    await user.click(screen.getByRole('button', { name: /hole card 1/i }))
    await user.click(screen.getByRole('button', { name: /A♠/i }))
    await user.click(screen.getByRole('button', { name: /hole card 2/i }))
    await user.click(screen.getByRole('button', { name: /K♥/i }))
    
    await user.click(screen.getByRole('button', { name: /flop card 1/i }))
    await user.click(screen.getByRole('button', { name: /Q♠/i }))
    await user.click(screen.getByRole('button', { name: /flop card 2/i }))
    await user.click(screen.getByRole('button', { name: /J♠/i }))
    await user.click(screen.getByRole('button', { name: /flop card 3/i }))
    await user.click(screen.getByRole('button', { name: /10♠/i }))
    
    // Flop indicators
    expect(screen.getByTestId('stage-indicator-preflop')).toHaveClass('completed')
    expect(screen.getByTestId('stage-indicator-flop')).toHaveClass('active')
    expect(screen.getByTestId('stage-indicator-turn')).toHaveClass('inactive')
    expect(screen.getByTestId('stage-indicator-river')).toHaveClass('inactive')
  })
})
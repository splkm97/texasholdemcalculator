import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, test, expect } from 'vitest'
import { PokerCalculator } from '../../src/components/Calculator/PokerCalculator'

describe('Probability Display Integration Tests', () => {
  test('should show probability calculations after selecting hole cards', async () => {
    const user = userEvent.setup()
    render(<PokerCalculator />)
    
    // Select both hole cards
    await user.click(screen.getByRole('button', { name: /hole card 1/i }))
    await user.click(screen.getByRole('button', { name: /A♠/i }))
    
    await user.click(screen.getByRole('button', { name: /hole card 2/i }))
    await user.click(screen.getByRole('button', { name: /A♥/i }))
    
    // Verify probability display appears
    await waitFor(() => {
      expect(screen.getByText(/probability results/i)).toBeInTheDocument()
    }, { timeout: 2000 })
    
    // Verify specific hand probabilities are shown
    expect(screen.getByText(/pair/i)).toBeInTheDocument()
    expect(screen.getByText(/two pair/i)).toBeInTheDocument()
    expect(screen.getByText(/three of a kind/i)).toBeInTheDocument()
    expect(screen.getByText(/full house/i)).toBeInTheDocument()
    expect(screen.getByText(/four of a kind/i)).toBeInTheDocument()
  })

  test('should update probabilities when community cards added', async () => {
    const user = userEvent.setup()
    render(<PokerCalculator />)
    
    // Select hole cards (pocket aces)
    await user.click(screen.getByRole('button', { name: /hole card 1/i }))
    await user.click(screen.getByRole('button', { name: /A♠/i }))
    await user.click(screen.getByRole('button', { name: /hole card 2/i }))
    await user.click(screen.getByRole('button', { name: /A♥/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/probability results/i)).toBeInTheDocument()
    })
    
    // Get initial pair probability
    const initialPairElement = screen.getByTestId('pair-probability')
    const initialPairValue = initialPairElement.textContent
    
    // Add flop cards (another ace for trips)
    await user.click(screen.getByRole('button', { name: /flop card 1/i }))
    await user.click(screen.getByRole('button', { name: /A♦/i }))
    await user.click(screen.getByRole('button', { name: /flop card 2/i }))
    await user.click(screen.getByRole('button', { name: /K♠/i }))
    await user.click(screen.getByRole('button', { name: /flop card 3/i }))
    await user.click(screen.getByRole('button', { name: /Q♥/i }))
    
    // Probabilities should update
    await waitFor(() => {
      const updatedPairElement = screen.getByTestId('pair-probability')
      expect(updatedPairElement.textContent).not.toBe(initialPairValue)
    })
  })

  test('should display probabilities in correct format', async () => {
    const user = userEvent.setup()
    render(<PokerCalculator />)
    
    // Select hole cards
    await user.click(screen.getByRole('button', { name: /hole card 1/i }))
    await user.click(screen.getByRole('button', { name: /A♠/i }))
    await user.click(screen.getByRole('button', { name: /hole card 2/i }))
    await user.click(screen.getByRole('button', { name: /K♠/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/probability results/i)).toBeInTheDocument()
    })
    
    // Check percentage format
    const percentageElements = screen.getAllByText(/%$/)
    expect(percentageElements.length).toBeGreaterThan(0)
    
    // Check odds format (e.g., "2.5:1")
    const oddsElements = screen.getAllByText(/:\d+$/)
    expect(oddsElements.length).toBeGreaterThan(0)
  })

  test('should show calculation time under 100ms', async () => {
    const user = userEvent.setup()
    render(<PokerCalculator />)
    
    // Select hole cards
    await user.click(screen.getByRole('button', { name: /hole card 1/i }))
    await user.click(screen.getByRole('button', { name: /A♠/i }))
    await user.click(screen.getByRole('button', { name: /hole card 2/i }))
    await user.click(screen.getByRole('button', { name: /A♥/i }))
    
    await waitFor(() => {
      const calculationTimeElement = screen.getByTestId('calculation-time')
      const timeText = calculationTimeElement.textContent || '0'
      const timeValue = parseFloat(timeText.replace(/[^\d.]/g, ''))
      expect(timeValue).toBeLessThan(100)
    })
  })

  test('should allow switching between display formats', async () => {
    const user = userEvent.setup()
    render(<PokerCalculator />)
    
    // Select hole cards
    await user.click(screen.getByRole('button', { name: /hole card 1/i }))
    await user.click(screen.getByRole('button', { name: /A♠/i }))
    await user.click(screen.getByRole('button', { name: /hole card 2/i }))
    await user.click(screen.getByRole('button', { name: /A♥/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/probability results/i)).toBeInTheDocument()
    })
    
    // Switch to odds format
    await user.click(screen.getByRole('button', { name: /show odds/i }))
    
    const oddsElements = screen.getAllByText(/:\d+$/)
    expect(oddsElements.length).toBeGreaterThan(0)
    
    // Switch to decimal format
    await user.click(screen.getByRole('button', { name: /show decimal/i }))
    
    const decimalElements = screen.getAllByText(/^0\.\d+$/)
    expect(decimalElements.length).toBeGreaterThan(0)
  })

  test('should show loading spinner during calculation', async () => {
    const user = userEvent.setup()
    render(<PokerCalculator />)
    
    // Select first hole card
    await user.click(screen.getByRole('button', { name: /hole card 1/i }))
    await user.click(screen.getByRole('button', { name: /A♠/i }))
    
    // Select second hole card (this should trigger calculation)
    await user.click(screen.getByRole('button', { name: /hole card 2/i }))
    
    // Loading spinner should appear briefly
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    
    await user.click(screen.getByRole('button', { name: /A♥/i }))
    
    // Results should appear and spinner should disappear
    await waitFor(() => {
      expect(screen.getByText(/probability results/i)).toBeInTheDocument()
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
    })
  })
})
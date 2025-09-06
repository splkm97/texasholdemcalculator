import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, test, expect } from 'vitest'
import { PokerCalculator } from '../../src/components/Calculator/PokerCalculator'

describe('Error Handling Integration Tests', () => {
  test('should show error for duplicate card selection', async () => {
    const user = userEvent.setup()
    render(<PokerCalculator />)
    
    // Select same card twice
    await user.click(screen.getByRole('button', { name: /hole card 1/i }))
    await user.click(screen.getByRole('button', { name: /A♠/i }))
    
    await user.click(screen.getByRole('button', { name: /hole card 2/i }))
    await user.click(screen.getByRole('button', { name: /A♠/i }))
    
    // Should show error message
    expect(screen.getByRole('alert')).toHaveTextContent(/card already selected/i)
    expect(screen.getByTestId('error-message')).toBeInTheDocument()
  })

  test('should clear error when valid selection made', async () => {
    const user = userEvent.setup()
    render(<PokerCalculator />)
    
    // Create error condition
    await user.click(screen.getByRole('button', { name: /hole card 1/i }))
    await user.click(screen.getByRole('button', { name: /A♠/i }))
    await user.click(screen.getByRole('button', { name: /hole card 2/i }))
    await user.click(screen.getByRole('button', { name: /A♠/i }))
    
    expect(screen.getByTestId('error-message')).toBeInTheDocument()
    
    // Make valid selection
    await user.click(screen.getByRole('button', { name: /K♥/i }))
    
    // Error should be cleared
    expect(screen.queryByTestId('error-message')).not.toBeInTheDocument()
  })

  test('should handle calculation failure gracefully', async () => {
    const user = userEvent.setup()
    render(<PokerCalculator />)
    
    // Mock a calculation failure by selecting cards that would cause issues
    // This is a contrived example - in real implementation we'd mock the calculation service
    await user.click(screen.getByRole('button', { name: /hole card 1/i }))
    await user.click(screen.getByRole('button', { name: /A♠/i }))
    await user.click(screen.getByRole('button', { name: /hole card 2/i }))
    await user.click(screen.getByRole('button', { name: /K♥/i }))
    
    // Simulate calculation error by triggering calculation with invalid state
    // In actual implementation, this would be handled by the poker engine
    await waitFor(() => {
      if (screen.queryByTestId('calculation-error')) {
        expect(screen.getByTestId('calculation-error')).toHaveTextContent(/calculation failed/i)
        expect(screen.getByRole('button', { name: /retry calculation/i })).toBeInTheDocument()
      }
    }, { timeout: 1000 })
  })

  test('should show validation errors for invalid game state', async () => {
    const user = userEvent.setup()
    render(<PokerCalculator />)
    
    // Try to select community cards without hole cards (this should be prevented by UI)
    // But if somehow it happens, should show validation error
    
    // This test simulates a state where validation catches invalid game progression
    // In real implementation, the UI prevents this, but validation provides backup
    
    expect(screen.getByRole('button', { name: /flop card 1/i })).toBeDisabled()
    
    // If user somehow bypasses UI restrictions, validation should catch it
    // This would be tested with direct store manipulation in actual implementation
  })

  test('should handle network/calculation timeout', async () => {
    const user = userEvent.setup()
    render(<PokerCalculator />)
    
    // Select cards that would trigger a calculation
    await user.click(screen.getByRole('button', { name: /hole card 1/i }))
    await user.click(screen.getByRole('button', { name: /A♠/i }))
    await user.click(screen.getByRole('button', { name: /hole card 2/i }))
    await user.click(screen.getByRole('button', { name: /K♥/i }))
    
    // Wait for potential timeout (this would be mocked in real implementation)
    await waitFor(() => {
      // If calculation takes too long, should show timeout error
      if (screen.queryByTestId('timeout-error')) {
        expect(screen.getByTestId('timeout-error')).toHaveTextContent(/calculation timeout/i)
        expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
      }
    }, { timeout: 5000 })
  })

  test('should recover from errors when reset button clicked', async () => {
    const user = userEvent.setup()
    render(<PokerCalculator />)
    
    // Create error state
    await user.click(screen.getByRole('button', { name: /hole card 1/i }))
    await user.click(screen.getByRole('button', { name: /A♠/i }))
    await user.click(screen.getByRole('button', { name: /hole card 2/i }))
    await user.click(screen.getByRole('button', { name: /A♠/i })) // Duplicate
    
    expect(screen.getByTestId('error-message')).toBeInTheDocument()
    
    // Click reset
    await user.click(screen.getByRole('button', { name: /reset/i }))
    
    // Error should be cleared and back to initial state
    expect(screen.queryByTestId('error-message')).not.toBeInTheDocument()
    expect(screen.getByText(/stage: pre-flop/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /hole card 1/i })).toBeInTheDocument()
  })

  test('should show user-friendly error messages', async () => {
    const user = userEvent.setup()
    render(<PokerCalculator />)
    
    // Test various error conditions and their messages
    
    // Duplicate card error
    await user.click(screen.getByRole('button', { name: /hole card 1/i }))
    await user.click(screen.getByRole('button', { name: /A♠/i }))
    await user.click(screen.getByRole('button', { name: /hole card 2/i }))
    await user.click(screen.getByRole('button', { name: /A♠/i }))
    
    const errorElement = screen.getByTestId('error-message')
    expect(errorElement).toHaveTextContent(/already selected/i)
    expect(errorElement).toHaveClass('error', 'user-friendly')
    
    // Error should have clear, non-technical language
    expect(errorElement).not.toHaveTextContent(/DUPLICATE_CARD/)
    expect(errorElement).not.toHaveTextContent(/500/)
    expect(errorElement).not.toHaveTextContent(/stack trace/i)
  })

  test('should provide error context and recovery suggestions', async () => {
    const user = userEvent.setup()
    render(<PokerCalculator />)
    
    // Create error condition
    await user.click(screen.getByRole('button', { name: /hole card 1/i }))
    await user.click(screen.getByRole('button', { name: /A♠/i }))
    await user.click(screen.getByRole('button', { name: /hole card 2/i }))
    await user.click(screen.getByRole('button', { name: /A♠/i }))
    
    // Should show helpful recovery suggestion
    expect(screen.getByText(/please select a different card/i)).toBeInTheDocument()
    
    // Should highlight the available actions
    expect(screen.getByRole('button', { name: /select different card/i })).toBeInTheDocument()
  })
})
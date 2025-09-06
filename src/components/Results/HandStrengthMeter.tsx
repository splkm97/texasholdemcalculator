import { memo, useMemo } from 'react'
import type { HandProbability } from '../../types/poker'

interface HandStrengthMeterProps {
  probabilities: HandProbability[]
  className?: string
}

export const HandStrengthMeter = memo(function HandStrengthMeter({
  probabilities,
  className = ''
}: HandStrengthMeterProps) {
  const handStrength = useMemo(() => {
    // Calculate overall hand strength as weighted average
    // Higher hand types get more weight
    let weightedSum = 0
    let totalWeight = 0
    
    probabilities.forEach(prob => {
      const weight = prob.percentage / 100
      const strength = prob.handType
      weightedSum += strength * weight
      totalWeight += weight
    })
    
    const averageStrength = totalWeight > 0 ? weightedSum / totalWeight : 0
    
    // Convert to 0-100 scale (Royal Flush = 9, so scale by 9)
    return Math.min(100, (averageStrength / 9) * 100)
  }, [probabilities])
  
  const getStrengthLabel = (strength: number): string => {
    if (strength >= 90) return 'Excellent'
    if (strength >= 75) return 'Very Strong'
    if (strength >= 60) return 'Strong'
    if (strength >= 40) return 'Moderate'
    if (strength >= 25) return 'Weak'
    return 'Very Weak'
  }
  
  const getStrengthColor = (strength: number): string => {
    if (strength >= 75) return '#10B981' // green-500
    if (strength >= 50) return '#F59E0B' // amber-500  
    if (strength >= 25) return '#F97316' // orange-500
    return '#EF4444' // red-500
  }
  
  const strengthLabel = getStrengthLabel(handStrength)
  const strengthColor = getStrengthColor(handStrength)
  
  // Find the best possible hand
  const bestHand = probabilities.reduce((best, current) => 
    current.handType > best.handType ? current : best, 
    probabilities[0]
  )
  
  const handNames: Record<number, string> = {
    0: 'High Card',
    1: 'Pair',
    2: 'Two Pair',
    3: 'Three of a Kind',
    4: 'Straight', 
    5: 'Flush',
    6: 'Full House',
    7: 'Four of a Kind',
    8: 'Straight Flush',
    9: 'Royal Flush'
  }
  
  return (
    <div className={`bg-white p-6 rounded-lg border border-gray-200 ${className}`}>
      <h3 className="text-lg font-medium text-gray-900 mb-4">Hand Strength</h3>
      
      {/* Strength Meter */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Overall Strength</span>
          <span className="text-sm font-medium" style={{ color: strengthColor }}>
            {strengthLabel}
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className="h-4 rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-2"
            style={{
              width: `${handStrength}%`,
              backgroundColor: strengthColor
            }}
          >
            <span className="text-xs text-white font-medium">
              {handStrength.toFixed(0)}%
            </span>
          </div>
        </div>
      </div>
      
      {/* Best Possible Hand */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Best Possible Hand:</span>
          <span className="text-sm font-medium text-gray-900">
            {handNames[bestHand.handType]} ({bestHand.percentage.toFixed(2)}%)
          </span>
        </div>
      </div>
      
      {/* Strength Indicators */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-600">Made Hand:</span>
          <div className="font-medium text-gray-900">
            {probabilities
              .filter(p => p.handType >= 1) // Pair or better
              .reduce((sum, p) => sum + p.percentage, 0)
              .toFixed(1)}%
          </div>
        </div>
        <div>
          <span className="text-gray-600">Premium Hand:</span>
          <div className="font-medium text-gray-900">
            {probabilities
              .filter(p => p.handType >= 6) // Full House or better
              .reduce((sum, p) => sum + p.percentage, 0)
              .toFixed(1)}%
          </div>
        </div>
      </div>
      
      {/* Strength Scale Legend */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 mb-2">Strength Scale:</div>
        <div className="flex items-center gap-1">
          <div className="flex-1 h-2 bg-gradient-to-r from-red-500 via-orange-500 via-amber-500 to-green-500 rounded-full"></div>
          <div className="flex justify-between w-full text-xs text-gray-500 mt-1">
            <span>Weak</span>
            <span>Strong</span>
          </div>
        </div>
      </div>
    </div>
  )
})

export default HandStrengthMeter
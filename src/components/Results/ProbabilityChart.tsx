import { memo } from 'react'
import type { HandProbability } from '../../types/poker'

interface ProbabilityChartProps {
  probabilities: HandProbability[]
  className?: string
}

const HAND_NAMES: Record<number, string> = {
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

const HAND_COLORS: Record<number, string> = {
  0: '#94A3B8', // gray-400
  1: '#60A5FA', // blue-400
  2: '#34D399', // emerald-400
  3: '#FBBF24', // amber-400
  4: '#F97316', // orange-500
  5: '#EF4444', // red-500
  6: '#8B5CF6', // violet-500
  7: '#EC4899', // pink-500
  8: '#10B981', // emerald-500
  9: '#F59E0B'  // amber-500
}

export const ProbabilityChart = memo(function ProbabilityChart({
  probabilities,
  className = ''
}: ProbabilityChartProps) {
  // Sort probabilities by percentage descending for better visual hierarchy
  const sortedProbabilities = [...probabilities].sort((a, b) => b.percentage - a.percentage)
  
  const maxPercentage = Math.max(...sortedProbabilities.map(p => p.percentage))
  
  return (
    <div className={`bg-white p-6 rounded-lg border border-gray-200 ${className}`}>
      <h3 className="text-lg font-medium text-gray-900 mb-4">Probability Distribution</h3>
      
      <div className="space-y-3">
        {sortedProbabilities.map((prob) => {
          const handName = HAND_NAMES[prob.handType] || `Hand Type ${prob.handType}`
          const barWidth = maxPercentage > 0 ? (prob.percentage / maxPercentage) * 100 : 0
          const color = HAND_COLORS[prob.handType] || '#94A3B8'
          
          return (
            <div key={prob.handType} className="space-y-1">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-gray-700">{handName}</span>
                <span className="text-gray-600">{prob.percentage.toFixed(2)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${barWidth}%`,
                    backgroundColor: color
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
      
      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 text-xs">
          {Object.entries(HAND_NAMES).map(([handType, name]) => (
            <div key={handType} className="flex items-center gap-1">
              <div
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: HAND_COLORS[parseInt(handType)] }}
              />
              <span className="text-gray-600 truncate">{name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
})

export default ProbabilityChart
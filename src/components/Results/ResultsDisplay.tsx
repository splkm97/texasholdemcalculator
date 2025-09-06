import { useState, memo } from 'react'
import type { CalculationResults } from '../../types/poker'

interface ResultsDisplayProps {
  results: CalculationResults
  className?: string
}

type DisplayFormat = 'percentage' | 'odds' | 'decimal'

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

export const ResultsDisplay = memo(function ResultsDisplay({
  results,
  className = ''
}: ResultsDisplayProps) {
  const [displayFormat, setDisplayFormat] = useState<DisplayFormat>('percentage')

  const formatProbability = (prob: { probability: number, percentage: number, odds: string }) => {
    switch (displayFormat) {
      case 'percentage':
        return `${prob.percentage.toFixed(2)}%`
      case 'odds':
        return prob.odds
      case 'decimal':
        return prob.probability.toFixed(6)
      default:
        return `${prob.percentage.toFixed(2)}%`
    }
  }

  return (
    <div className={`${className}`}>
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🎲</span>
          <h2 className="text-xl font-bold text-slate-200">Hand Probabilities</h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setDisplayFormat('percentage')}
            className={`px-4 py-2 text-sm rounded-full font-medium transition-all duration-200 ${
              displayFormat === 'percentage'
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-105'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white'
            }`}
          >
            📊 Percentage
          </button>
          <button
            onClick={() => setDisplayFormat('odds')}
            className={`px-4 py-2 text-sm rounded-full font-medium transition-all duration-200 ${
              displayFormat === 'odds'
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-105'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white'
            }`}
          >
            🎯 Odds
          </button>
          <button
            onClick={() => setDisplayFormat('decimal')}
            className={`px-4 py-2 text-sm rounded-full font-medium transition-all duration-200 ${
              displayFormat === 'decimal'
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-105'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white'
            }`}
          >
            🔢 Decimal
          </button>
        </div>
      </div>

      {/* Game Info Card */}
      <div className="mb-6 bg-gradient-to-r from-slate-700/50 to-slate-600/50 rounded-xl p-5 border border-slate-500/30">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">🎮 Stage:</span>
            <span className="text-slate-200 font-medium capitalize">{results.stage}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">⚙️ Method:</span>
            <span className="text-slate-200 font-medium capitalize">{results.method}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">🃏 Your Hand:</span>
            <span className="text-slate-200 font-medium">{results.playerHand.map(card => card.display).join(' ')}</span>
          </div>
          <div className="flex items-center gap-2" data-testid="calculation-time">
            <span className="text-slate-400">⚡ Speed:</span>
            <span className="text-green-400 font-medium">{results.calculationTime.toFixed(2)}ms</span>
          </div>
        </div>
        {results.communityCards.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-500/30">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">🌟 Community:</span>
              <span className="text-slate-200 font-medium">{results.communityCards.map(card => card.display).join(' ')}</span>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Probability Table */}
      <div className="overflow-hidden rounded-xl border border-slate-600/50 bg-gradient-to-br from-slate-800/50 to-slate-700/50">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-slate-700 to-slate-600">
                <th className="text-left py-4 px-6 font-bold text-slate-200">🎯 Hand Type</th>
                <th className="text-right py-4 px-6 font-bold text-slate-200">
                  {displayFormat === 'percentage' ? '📊 Percentage' : 
                   displayFormat === 'odds' ? '🎲 Odds' : '🔢 Decimal'}
                </th>
                <th className="text-right py-4 px-6 font-bold text-slate-200">📈 Occurrences</th>
              </tr>
            </thead>
            <tbody>
              {results.probabilities.map((prob) => {
                const handName = HAND_NAMES[prob.handType] || `Hand Type ${prob.handType}`
                const isHighProbability = prob.percentage > 20
                const isMediumProbability = prob.percentage > 5
                
                return (
                  <tr 
                    key={prob.handType}
                    className="border-b border-slate-600/30 hover:bg-slate-600/20 transition-colors duration-200"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          isHighProbability ? 'bg-green-400' :
                          isMediumProbability ? 'bg-yellow-400' : 'bg-red-400'
                        }`} />
                        <span className="font-medium text-slate-200">{handName}</span>
                      </div>
                    </td>
                    <td 
                      className="text-right py-4 px-6 font-bold text-slate-100"
                      data-testid={`${handName.toLowerCase().replace(/\s+/g, '-')}-probability`}
                    >
                      <span className={`${
                        isHighProbability ? 'text-green-400' :
                        isMediumProbability ? 'text-yellow-400' : 'text-slate-300'
                      }`}>
                        {formatProbability(prob)}
                      </span>
                    </td>
                    <td className="text-right py-4 px-6 text-slate-300 font-medium">
                      {prob.occurrences.toLocaleString()}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enhanced Summary Stats */}
      <div className="mt-6 bg-gradient-to-br from-blue-900/40 to-purple-900/40 rounded-xl p-5 border border-blue-500/30">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">📋</span>
          <h3 className="text-lg font-bold text-blue-200">Summary Analysis</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-blue-800/30 rounded-lg p-4 border border-blue-400/20">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">🏆</span>
              <span className="text-blue-300 text-sm">Best Possible Hand</span>
            </div>
            <span className="text-blue-100 font-bold text-lg">
              {HAND_NAMES[Math.max(...results.probabilities.map(p => p.handType))]}
            </span>
          </div>
          <div className="bg-purple-800/30 rounded-lg p-4 border border-purple-400/20">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">🎯</span>
              <span className="text-purple-300 text-sm">Most Likely Outcome</span>
            </div>
            <span className="text-purple-100 font-bold text-lg">
              {(() => {
                const mostLikely = results.probabilities.reduce((a, b) => 
                  a.probability > b.probability ? a : b
                )
                return HAND_NAMES[mostLikely.handType]
              })()}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
})

export default ResultsDisplay
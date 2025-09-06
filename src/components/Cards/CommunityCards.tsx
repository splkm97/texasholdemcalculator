import { memo } from 'react'
import { Card } from './Card'
import type { Card as CardType } from '../../types/card'
import type { GameStage } from '../../types/game'

interface CommunityCardsProps {
  cards: (CardType | undefined)[]
  onCardClick?: (index: number) => void
  selectedIndex?: number
  disabled?: boolean
  stage: GameStage
  className?: string
}

export const CommunityCards = memo(function CommunityCards({
  cards,
  onCardClick,
  selectedIndex,
  disabled = false,
  stage,
  className = ''
}: CommunityCardsProps) {
  const getPlaceholders = (): string[] => {
    const placeholders = ['Flop Card 1', 'Flop Card 2', 'Flop Card 3', 'Turn Card', 'River Card']
    
    // Disable placeholders based on stage
    switch (stage) {
      case 'pre-flop':
        return placeholders
      case 'flop':
        return ['', '', '', 'Turn Card', 'River Card']
      case 'turn':
        return ['', '', '', '', 'River Card']
      case 'river':
        return ['', '', '', '', '']
      default:
        return placeholders
    }
  }
  
  const getMaxCards = (): number => {
    switch (stage) {
      case 'pre-flop':
        return 0
      case 'flop':
        return 3
      case 'turn':
        return 4
      case 'river':
        return 5
      default:
        return 5
    }
  }
  
  const isCardDisabled = (index: number): boolean => {
    if (disabled) return true
    
    // For flop stage, all 3 cards must be filled before turn
    if (stage === 'pre-flop' && index < 3) {
      return false // Flop cards can be selected
    }
    
    if (stage === 'flop' && index === 3) {
      // Turn card can be selected only if flop is complete
      return !cards[0] || !cards[1] || !cards[2]
    }
    
    if (stage === 'turn' && index === 4) {
      // River card can be selected only if turn is complete  
      return !cards[3]
    }
    
    return index >= getMaxCards()
  }
  
  const placeholders = getPlaceholders()
  
  return (
    <div className={`${className}`}>
      <div className="flex flex-col gap-4">
        {/* Flop */}
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-medium text-gray-700">Flop</h3>
          <div className="flex gap-2">
            {[0, 1, 2].map((index) => (
              <Card
                key={index}
                card={cards[index]}
                onClick={onCardClick && !isCardDisabled(index) ? () => onCardClick(index) : undefined}
                disabled={isCardDisabled(index)}
                selected={selectedIndex === index}
                placeholder={placeholders[index]}
                size="medium"
              />
            ))}
          </div>
        </div>
        
        {/* Turn */}
        {stage !== 'pre-flop' && (
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-medium text-gray-700">Turn</h3>
            <div className="flex gap-2">
              <Card
                card={cards[3]}
                onClick={onCardClick && !isCardDisabled(3) ? () => onCardClick(3) : undefined}
                disabled={isCardDisabled(3)}
                selected={selectedIndex === 3}
                placeholder="Turn Card"
                size="medium"
              />
            </div>
          </div>
        )}
        
        {/* River */}
        {(stage === 'turn' || stage === 'river') && (
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-medium text-gray-700">River</h3>
            <div className="flex gap-2">
              <Card
                card={cards[4]}
                onClick={onCardClick && !isCardDisabled(4) ? () => onCardClick(4) : undefined}
                disabled={isCardDisabled(4)}
                selected={selectedIndex === 4}
                placeholder="River Card"
                size="medium"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
})

export default CommunityCards
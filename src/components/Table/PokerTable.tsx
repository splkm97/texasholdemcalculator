import { memo } from 'react'
import { Card } from '../Cards/Card'
import type { Card as CardType } from '../../types/card'
import type { GameStage } from '../../types/game'

interface PokerTableProps {
  playerHand: (CardType | undefined)[]
  communityCards: (CardType | undefined)[]
  stage: GameStage
  onPlayerCardClick?: (index: number) => void
  onCommunityCardClick?: (index: number) => void
  selectedSlot?: { type: 'player' | 'community', index: number } | null
  disabled?: boolean
  className?: string
}

export const PokerTable = memo(function PokerTable({
  playerHand,
  communityCards,
  stage,
  onPlayerCardClick,
  onCommunityCardClick,
  selectedSlot,
  disabled = false,
  className = ''
}: PokerTableProps) {
  return (
    <div className={`relative bg-green-800 rounded-3xl p-8 shadow-2xl ${className}`}>
      {/* Table felt texture overlay */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-radial from-green-700 to-green-900 opacity-50"></div>
      
      <div className="relative z-10">
        {/* Community Cards Area - Center of table */}
        <div className="flex flex-col items-center mb-12">
          <h3 className="text-white text-lg font-medium mb-4 opacity-80">
            Community Cards
          </h3>
          
          <div className="flex gap-4 items-center">
            {/* Flop */}
            <div className="flex gap-2">
              {[0, 1, 2].map((index) => {
                const isVisible = stage !== 'pre-flop'
                const card = isVisible ? communityCards[index] : undefined
                
                return (
                  <div key={index} className="relative">
                    <Card
                      card={card}
                      onClick={!disabled && onCommunityCardClick ? () => onCommunityCardClick(index) : undefined}
                      disabled={disabled}
                      selected={selectedSlot?.type === 'community' && selectedSlot.index === index}
                      placeholder={`Flop ${index + 1}`}
                      size="large"
                      className={!isVisible && stage === 'pre-flop' ? 'opacity-30' : ''}
                    />
                  </div>
                )
              })}
            </div>
            
            {/* Turn */}
            <div className="ml-4">
              <Card
                card={stage === 'turn' || stage === 'river' ? communityCards[3] : undefined}
                onClick={!disabled && onCommunityCardClick ? () => onCommunityCardClick(3) : undefined}
                disabled={disabled}
                selected={selectedSlot?.type === 'community' && selectedSlot.index === 3}
                placeholder="Turn"
                size="large"
                className={stage === 'pre-flop' || stage === 'flop' ? 'opacity-30' : ''}
              />
            </div>
            
            {/* River */}
            <div className="ml-2">
              <Card
                card={stage === 'river' ? communityCards[4] : undefined}
                onClick={!disabled && onCommunityCardClick ? () => onCommunityCardClick(4) : undefined}
                disabled={disabled}
                selected={selectedSlot?.type === 'community' && selectedSlot.index === 4}
                placeholder="River"
                size="large"
                className={stage !== 'river' ? 'opacity-30' : ''}
              />
            </div>
          </div>
        </div>
        
        {/* Player Position */}
        <div className="flex justify-center">
          <div className="bg-black bg-opacity-20 rounded-2xl p-6 border border-white border-opacity-20">
            <div className="text-center mb-4">
              <h3 className="text-white text-lg font-medium opacity-80">Your Hand</h3>
            </div>
            
            <div className="flex gap-4 items-center">
              {playerHand.map((card, index) => (
                <div key={index} className="relative">
                  <Card
                    card={card}
                    onClick={!disabled && onPlayerCardClick ? () => onPlayerCardClick(index) : undefined}
                    disabled={disabled}
                    selected={selectedSlot?.type === 'player' && selectedSlot.index === index}
                    placeholder={`Hole Card ${index + 1}`}
                    size="large"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-4 left-4 w-8 h-8 border-2 border-white border-opacity-20 rounded-full"></div>
        <div className="absolute top-4 right-4 w-8 h-8 border-2 border-white border-opacity-20 rounded-full"></div>
        <div className="absolute bottom-4 left-4 w-8 h-8 border-2 border-white border-opacity-20 rounded-full"></div>
        <div className="absolute bottom-4 right-4 w-8 h-8 border-2 border-white border-opacity-20 rounded-full"></div>
        
        {/* Table center decorations */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -z-10">
          <div className="w-32 h-32 border border-white border-opacity-10 rounded-full"></div>
        </div>
      </div>
      
      {/* Game stage indicator */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
        <div className="bg-black bg-opacity-40 backdrop-blur-sm rounded-full px-4 py-2 border border-white border-opacity-20">
          <span className="text-white text-sm font-medium capitalize">
            {stage.replace('-', ' ')}
          </span>
        </div>
      </div>
    </div>
  )
})

export default PokerTable
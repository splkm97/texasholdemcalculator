import { memo } from 'react'
import { Card } from './Card'
import type { Card as CardType } from '../../types/card'

interface HandDisplayProps {
  cards: (CardType | undefined)[]
  onCardClick?: (index: number) => void
  selectedIndex?: number
  disabled?: boolean
  label?: string
  maxCards?: number
  placeholders?: string[]
  size?: 'small' | 'medium' | 'large'
  className?: string
}

export const HandDisplay = memo(function HandDisplay({
  cards,
  onCardClick,
  selectedIndex,
  disabled = false,
  label,
  maxCards = cards.length,
  placeholders = [],
  size = 'medium',
  className = ''
}: HandDisplayProps) {
  const displayCards = Array.from({ length: maxCards }, (_, i) => cards[i])
  
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <h3 className="text-sm font-medium text-gray-700 mb-1">{label}</h3>
      )}
      <div className="flex gap-2 flex-wrap">
        {displayCards.map((card, index) => (
          <Card
            key={index}
            card={card}
            onClick={onCardClick ? () => onCardClick(index) : undefined}
            disabled={disabled}
            selected={selectedIndex === index}
            placeholder={placeholders[index]}
            size={size}
            className={card ? "card-luxury card-shine hover:scale-110 hover:rotate-1 transition-all duration-500" : ""}
          />
        ))}
      </div>
    </div>
  )
})

export default HandDisplay
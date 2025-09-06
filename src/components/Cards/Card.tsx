import { memo } from 'react'
import type { Card as CardType } from '../../types/card'

interface CardProps {
  card?: CardType
  onClick?: () => void
  disabled?: boolean
  selected?: boolean
  placeholder?: string
  className?: string
  size?: 'small' | 'medium' | 'large'
}

export const Card = memo(function Card({
  card,
  onClick,
  disabled = false,
  selected = false,
  placeholder,
  className = '',
  size = 'medium'
}: CardProps) {
  const sizeClasses = {
    small: 'w-20 h-28 text-sm',
    medium: 'w-24 h-36 text-base', 
    large: 'w-32 h-48 text-xl'
  }
  
  const getSuitColor = (suit: string) => {
    const colors = {
      hearts: 'text-red-500',
      diamonds: 'text-red-500',
      clubs: 'text-gray-800',
      spades: 'text-gray-800'
    }
    return colors[suit as keyof typeof colors] || 'text-gray-800'
  }
  
  const getSuitSymbol = (suit: string) => {
    const symbols = {
      hearts: '♥',
      diamonds: '♦', 
      clubs: '♣',
      spades: '♠'
    }
    return symbols[suit as keyof typeof symbols] || suit
  }
  
  const cardGradient = card?.suit === 'hearts' || card?.suit === 'diamonds' 
    ? 'bg-gradient-to-br from-white via-red-50 to-red-100'
    : 'bg-gradient-to-br from-white via-gray-50 to-blue-50'
  
  const cardShadow = card?.suit === 'hearts' || card?.suit === 'diamonds'
    ? 'shadow-red-200/60 hover:shadow-red-300/80'
    : 'shadow-blue-200/60 hover:shadow-blue-300/80'
  
  const baseClasses = `
    ${sizeClasses[size]}
    relative rounded-2xl font-bold shadow-xl
    border-4 border-white/90 backdrop-blur-sm
    ${onClick && !disabled ? 'cursor-pointer' : ''}
    ${disabled ? 'cursor-not-allowed opacity-60' : ''}
    ${selected ? 'ring-4 ring-yellow-400 ring-opacity-90 shadow-yellow-400/60 scale-105' : ''}
    ${className}
  `
  
  if (!card) {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={`
          ${baseClasses}
          bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200
          border-dashed border-gray-400/70
          hover:border-blue-400 hover:bg-gradient-to-br hover:from-blue-50 hover:via-blue-100 hover:to-blue-150
          hover:shadow-blue-300/50
        `}
        aria-label={placeholder}
      >
        <div className="absolute inset-1 rounded-lg border border-gray-300 border-dashed flex items-center justify-center">
          <span className="text-gray-500 text-xs text-center px-1 font-medium">
            {placeholder || 'Select Card'}
          </span>
        </div>
      </button>
    )
  }
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${cardGradient}`}
      aria-label={card.display}
    >
      {/* Luxury card background pattern */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-transparent to-white/40" />
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 20% 20%, rgba(0,0,0,0.1) 1px, transparent 1px),
                             radial-gradient(circle at 80% 80%, rgba(0,0,0,0.1) 1px, transparent 1px)`,
            backgroundSize: '15px 15px'
          }} />
        </div>
      </div>

      {/* Card corner decorations with enhanced styling */}
      <div className="absolute top-2 left-2 flex flex-col items-center leading-none z-10">
        <span className={`font-black ${getSuitColor(card.suit)} ${
          size === 'small' ? 'text-sm' : size === 'medium' ? 'text-lg' : 'text-2xl'
        } drop-shadow-sm`}>
          {card.rank}
        </span>
        <span className={`${getSuitColor(card.suit)} ${
          size === 'small' ? 'text-lg' : size === 'medium' ? 'text-2xl' : 'text-3xl'
        } drop-shadow-sm filter drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]`}>
          {getSuitSymbol(card.suit)}
        </span>
      </div>
      
      {/* Center suit symbol with enhanced styling */}
      <div className="flex items-center justify-center flex-1 z-10">
        <div className="relative">
          <span className={`${getSuitColor(card.suit)} ${
            size === 'small' ? 'text-4xl' : 
            size === 'medium' ? 'text-6xl' : 'text-8xl'
          } opacity-25 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]`}>
            {getSuitSymbol(card.suit)}
          </span>
          {/* Subtle inner glow */}
          <span className={`absolute inset-0 ${getSuitColor(card.suit)} ${
            size === 'small' ? 'text-4xl' : 
            size === 'medium' ? 'text-6xl' : 'text-8xl'
          } opacity-10 blur-sm`}>
            {getSuitSymbol(card.suit)}
          </span>
        </div>
      </div>
      
      {/* Bottom right corner (upside down) with enhanced styling */}
      <div className="absolute bottom-2 right-2 flex flex-col-reverse items-center leading-none rotate-180 z-10">
        <span className={`font-black ${getSuitColor(card.suit)} ${
          size === 'small' ? 'text-sm' : size === 'medium' ? 'text-lg' : 'text-2xl'
        } drop-shadow-sm`}>
          {card.rank}
        </span>
        <span className={`${getSuitColor(card.suit)} ${
          size === 'small' ? 'text-lg' : size === 'medium' ? 'text-2xl' : 'text-3xl'
        } drop-shadow-sm filter drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]`}>
          {getSuitSymbol(card.suit)}
        </span>
      </div>
      
      {/* Enhanced multi-layer shine effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-transparent via-white/30 to-transparent pointer-events-none" />
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-bl from-white/20 via-transparent to-white/10 pointer-events-none" />
      
      {/* Luxury inner border */}
      <div className="absolute inset-1 rounded-xl border border-white/40 pointer-events-none" />
    </button>
  )
})

export default Card
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RatingStarsProps {
  rating: number | null | undefined
  maxRating?: number
  size?: 'sm' | 'md' | 'lg'
  interactive?: boolean
  onChange?: (rating: number) => void
}

export function RatingStars({ 
  rating, 
  maxRating = 5, 
  size = 'md',
  interactive = false,
  onChange 
}: RatingStarsProps) {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  }

  const handleClick = (value: number) => {
    if (interactive && onChange) {
      onChange(value)
    }
  }

  return (
    <div className="flex gap-0.5">
      {Array.from({ length: maxRating }, (_, i) => {
        const starValue = i + 1
        const isFilled = rating ? starValue <= rating : false
        
        return (
          <Star
            key={i}
            className={cn(
              sizeClasses[size],
              isFilled ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300',
              interactive && 'cursor-pointer hover:scale-110 transition-transform'
            )}
            onClick={() => handleClick(starValue)}
          />
        )
      })}
    </div>
  )
}

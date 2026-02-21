import * as React from 'react'
import { cn } from '@/lib/utils'

const Progress = React.forwardRef(({ className, value, indicatorClassName, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('relative h-1.5 w-full overflow-hidden rounded-full bg-secondary', className)}
    {...props}
  >
    <div
      className={cn('h-full flex-1 bg-primary transition-all', indicatorClassName)}
      style={{ width: `${Math.min(100, Math.max(0, value || 0))}%` }}
    />
  </div>
))
Progress.displayName = 'Progress'

export { Progress }

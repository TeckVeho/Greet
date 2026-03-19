import { cn } from '@/lib/utils'
import * as React from 'react'

export interface CalloutProps extends React.HTMLAttributes<HTMLDivElement> {
	icon?: React.ReactNode
	children: React.ReactNode
}

const Callout = React.forwardRef<HTMLDivElement, CalloutProps>(
	({ className, icon = '💡', children, ...props }, ref) => {
		return (
			<div
				ref={ref}
				className={cn(
					'my-4 flex gap-3 rounded-xl border border-border/80 bg-secondary/60 p-4 text-sm text-foreground shadow-sm transition-colors hover:bg-secondary/75',
					className,
				)}
				{...props}
			>
				<div className='shrink-0'>{icon}</div>
				<div className='flex-1'>{children}</div>
			</div>
		)
	},
)
Callout.displayName = 'Callout'

export { Callout }

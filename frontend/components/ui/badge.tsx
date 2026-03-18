import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

const badgeVariants = cva(
	'inline-flex items-center rounded-full border border-transparent px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-ring/70 focus:ring-offset-2',
	{
		variants: {
			variant: {
				default: 'border-border/70 bg-secondary text-secondary-foreground hover:bg-secondary/80',
				area: 'border-border/70 bg-muted text-muted-foreground hover:bg-muted/80',
				genre: 'border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100',
				sushi: 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100',
				french: 'border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100',
				italian: 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
				yakiniku: 'border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100',
				japanese: 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100',
				chinese: 'border-yellow-200 bg-yellow-50 text-yellow-700 hover:bg-yellow-100',
				danger: 'border-red-200 bg-red-100 text-red-700 hover:bg-red-200',
				success: 'border-emerald-200 bg-emerald-100 text-emerald-700 hover:bg-emerald-200',
			},
		},
		defaultVariants: {
			variant: 'default',
		},
	},
)

export interface BadgeProps
	extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
	return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }

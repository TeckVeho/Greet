import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

const badgeVariants = cva(
	'inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
	{
		variants: {
			variant: {
				default: 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200',
				area: 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200',
				genre: 'bg-blue-50 text-blue-700 hover:bg-blue-100',
				sushi: 'bg-red-50 text-red-700 hover:bg-red-100',
				french: 'bg-purple-50 text-purple-700 hover:bg-purple-100',
				italian: 'bg-green-50 text-green-700 hover:bg-green-100',
				yakiniku: 'bg-orange-50 text-orange-700 hover:bg-orange-100',
				japanese: 'bg-amber-50 text-amber-700 hover:bg-amber-100',
				chinese: 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100',
				danger: 'bg-red-100 text-red-700 hover:bg-red-200',
				success: 'bg-green-100 text-green-700 hover:bg-green-200',
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

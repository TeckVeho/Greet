import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

const buttonVariants = cva(
	'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold tracking-wide transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:translate-y-px',
	{
		variants: {
			variant: {
				default:
					'bg-primary text-primary-foreground shadow-[0_12px_24px_hsl(var(--primary)/0.28)] hover:bg-primary/92 hover:shadow-[0_16px_28px_hsl(var(--primary)/0.34)]',
				secondary:
					'border border-border/70 bg-secondary/80 text-secondary-foreground shadow-sm hover:bg-secondary',
				ghost: 'text-foreground hover:bg-accent/75 hover:text-accent-foreground',
				link: 'text-primary underline-offset-4 hover:underline',
				danger: 'bg-destructive text-destructive-foreground hover:bg-destructive/92',
				outline: 'border border-border bg-transparent hover:bg-accent',
			},
			size: {
				default: 'h-10 px-4 py-2',
				sm: 'h-8 rounded-md px-3 text-xs',
				lg: 'h-11 rounded-lg px-8 text-sm',
				icon: 'h-10 w-10',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	},
)

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant, size, ...props }, ref) => {
		return (
			<button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
		)
	},
)
Button.displayName = 'Button'

export { Button, buttonVariants }

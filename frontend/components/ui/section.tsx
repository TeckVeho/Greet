import { cn } from '@/lib/utils'

export const Section: React.FC<{ children: React.ReactNode; className?: string }> = ({
	children,
	className,
}) => {
	return (
		<div className={cn(className, 'mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8 w-full')}>
			{children}
		</div>
	)
}

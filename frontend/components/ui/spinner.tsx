import { Loader2Icon } from 'lucide-react'

import { cn } from '@/lib/utils'

function Spinner({
	className,
	type = 'spinner',
	text = 'Loading...',
	...props
}: React.ComponentProps<'svg'> & { type?: 'page-loading' | 'spinner'; text?: string }) {
	if (type === 'page-loading') {
		return (
			<div className='flex h-screen w-full items-center justify-center'>
				<Loader2Icon
					role='status'
					aria-label='Loading'
					className={cn('size-8 animate-spin text-black', className)}
					{...props}
				/>
			</div>
		)
	}
	return (
		<>
			<Loader2Icon
				role='status'
				aria-label='Loading'
				className={cn('size-4 animate-spin', className)}
				{...props}
			/>
			{text}
		</>
	)
}

export { Spinner }

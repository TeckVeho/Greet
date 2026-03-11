import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

interface ButtonRemoveImageProps {
	onClick: () => void
	className?: string
}
export const ButtonRemoveImage: React.FC<ButtonRemoveImageProps> = ({ onClick, className }) => {
	return (
		<button
			type='button'
			onClick={onClick}
			className={cn(
				`text-destructive absolute top-2 right-2 flex cursor-pointer items-center justify-center rounded-full bg-white`,
				className,
			)}
			title='Rasmni olib tashlash'
		>
			<X className='size-4 stroke-2' />
		</button>
	)
}

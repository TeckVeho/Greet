'use client'
import { ClassAttributes, InputHTMLAttributes, useState } from 'react'

import { cn } from '@/lib/utils'
import { Eye, EyeClosedIcon } from 'lucide-react'
import { Input } from './input'

export const InputPassword: React.FC<
	ClassAttributes<HTMLInputElement> &
		InputHTMLAttributes<HTMLInputElement> & {
			className?: string
		}
> = ({ className, ...props }) => {
	const [isVisible, setIsVisible] = useState<boolean>(false)
	return (
		<div className={cn('relative', className)}>
			<Input type={isVisible ? 'text' : 'password'} {...props} />
			<span
				className='absolute top-1/2 right-3 -translate-y-1/2 transform cursor-pointer'
				onClick={() => {
					setIsVisible(!isVisible)
				}}
			>
				{isVisible ? <Eye className='size-5' /> : <EyeClosedIcon className='size-5' />}
			</span>
		</div>
	)
}

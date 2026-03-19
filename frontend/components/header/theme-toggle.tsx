'use client'

import {
	Button,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui'
import { Moon, Sun, SunMoon } from 'lucide-react'
import { useTheme } from 'next-themes'

export const ThemeToggle: React.FC = () => {
	const { setTheme } = useTheme()

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant='secondary' size='icon' className='h-9 w-9'>
					<SunMoon className='h-4 w-4' />
					<span className='sr-only'>Toggle theme</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align='end'>
				<DropdownMenuItem onClick={() => setTheme('light')}>
					<Sun className='mr-2 h-4 w-4' />
					ライト
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => setTheme('dark')}>
					<Moon className='mr-2 h-4 w-4' />
					ダーク
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => setTheme('system')}>
					<SunMoon className='mr-2 h-4 w-4' />
					システム
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
